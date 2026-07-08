package com.nebula.worker.service;

import com.nebula.worker.config.RabbitConfig;
import com.nebula.worker.dto.DeployMessage;
import com.nebula.worker.model.Deploy;
import com.nebula.worker.repo.DeployRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.HashMap;
import java.util.Set;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.Collections;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;

@Service
public class WorkerService {
    private final DeployRepository deployRepository;
    private final RabbitTemplate rabbitTemplate;
    private static final int MAX_RETRIES = 3;
    private final ThreadLocal<List<String>> activeSecrets = ThreadLocal.withInitial(ArrayList::new);
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final CommandRunner commandRunner;

    @Value("${worker.process-timeout-seconds:300}")
    private long processTimeoutSeconds;

    @Value("${worker.clone-timeout-seconds:120}")
    private long cloneTimeoutSeconds;

    @Value("${worker.retry.initial-delay-ms:2000}")
    private long retryInitialDelayMs;

    @Value("${worker.retry.max-delay-ms:60000}")
    private long retryMaxDelayMs;

    @Value("${worker.retry.multiplier:2.0}")
    private double retryMultiplier;

    public WorkerService(DeployRepository deployRepository, RabbitTemplate rabbitTemplate, CommandRunner commandRunner) {
        this.deployRepository = deployRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.commandRunner = commandRunner;
    }

    @RabbitListener(queues = RabbitConfig.DEPLOY_QUEUE)
    public void handle(DeployMessage msg) {
        System.out.println("Received deploy: " + msg.getDeployId());
        var opt = deployRepository.findById(msg.getDeployId());
        if (opt.isEmpty()) {
            System.out.println("Deploy not found: " + msg.getDeployId());
            return;
        }
        Deploy d = opt.get();
        d.setStatus("processing");
        d.setStartedAt(Instant.now());
        d.setLogs(new ArrayList<>());
        deployRepository.save(d);

        Path baseDir = Path.of(System.getProperty("worker.work-dir", "/tmp/worker"));
        try {
            // prepare active secrets to be masked in logs for this deploy
            List<String> secrets = new ArrayList<>();
            Map<String,String> env = msg.getEnv();
            if (env != null) {
                String token = env.get("GIT_TOKEN");
                if (token != null && !token.isBlank()) {
                    secrets.add(token);
                    try { secrets.add(URLEncoder.encode(token, StandardCharsets.UTF_8)); } catch (Exception ignored) {}
                }
                String sshKey = env.get("GIT_SSH_PRIVATE_KEY");
                if (sshKey != null && !sshKey.isBlank()) {
                    secrets.add(sshKey);
                }
            }
            activeSecrets.set(secrets);
            
            Files.createDirectories(baseDir);
            Path work = Files.createTempDirectory(baseDir, "deploy-");
            // prepare auth (token / ssh key) and clone with fallbacks
            String repoUrl = applyAuthToRepo(msg);
            Map<String,String> extraEnv = null;
            Path sshKeyFile = null;
            try {
                Map<String,String> env2 = msg.getEnv();
                if (env2 != null) {
                    String sshKey = env2.get("GIT_SSH_PRIVATE_KEY");
                    if (sshKey != null && !sshKey.isBlank()) {
                        // write private key to a file inside work dir
                        sshKeyFile = Files.createTempFile(work, "id_rsa_", "");
                        Files.writeString(sshKeyFile, sshKey);
                        // try to set file permission to 600; ignore on unsupported FS
                        try {
                            Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-------");
                            Files.setPosixFilePermissions(sshKeyFile, perms);
                        } catch (UnsupportedOperationException ignored) {
                        }
                        String sshCmd = "ssh -i " + sshKeyFile.toAbsolutePath().toString() + " -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null";
                        extraEnv = new HashMap<>();
                        extraEnv.put("GIT_SSH_COMMAND", sshCmd);
                    }
                }

                boolean cloned = false;
                List<String> tryBranches = new ArrayList<>();
                if (msg.getBranch() != null && !msg.getBranch().isBlank()) tryBranches.add(msg.getBranch());
                tryBranches.add("master");
                tryBranches.add("main");
                tryBranches.add(null);
                Exception lastEx = null;
                for (String b : tryBranches) {
                    try {
                        if (b == null) {
                            runCommandAndLog(d, List.of("git","clone","--depth","1",repoUrl,work.toString()), work, extraEnv);
                        } else {
                            runCommandAndLog(d, List.of("git","clone","--depth","1","--branch",b,repoUrl,work.toString()), work, extraEnv);
                        }
                        cloned = true;
                        break;
                    } catch (Exception ex) {
                        lastEx = ex;
                        appendLog(d, "Clone attempt failed for branch '" + b + "': " + ex.getMessage());
                    }
                }
                if (!cloned) throw lastEx != null ? lastEx : new RuntimeException("Clone failed");
                // run build command in work dir
                runShellAndLog(d, msg.getBuildCommand(), work);
                // run run command in work dir
                runShellAndLog(d, msg.getRunCommand(), work);

                d.setStatus("success");
                d.setFinishedAt(Instant.now());
                deployRepository.save(d);
            } finally {
                // cleanup ssh key file if created
                if (sshKeyFile != null) {
                    try { Files.deleteIfExists(sshKeyFile); } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            appendLog(d, "Error: " + e.getMessage());
            // retry logic with exponential backoff (scheduled)
            int retries = msg.getRetryCount();
            if (retries < MAX_RETRIES) {
                msg.setRetryCount(retries + 1);
                appendLog(d, "Scheduling retry (" + msg.getRetryCount() + ")...");
                deployRepository.save(d);
                long delay = retryInitialDelayMs;
                for (int i = 1; i < msg.getRetryCount(); i++) {
                    delay = Math.min(retryMaxDelayMs, (long)(delay * retryMultiplier));
                }
                long finalDelay = delay;
                scheduler.schedule(() -> {
                    try {
                        rabbitTemplate.convertAndSend(RabbitConfig.DEPLOY_EXCHANGE, RabbitConfig.DEPLOY_ROUTING, msg);
                    } catch (Exception ex) {
                        appendLog(d, "Failed to republish message for retry: " + ex.getMessage());
                    }
                }, finalDelay, TimeUnit.MILLISECONDS);
                return;
            }
            // send to DLQ
            appendLog(d, "Max retries reached, sending to DLQ");
            d.setStatus("failed");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);
            try {
                // send to queue named deploys-dlq via default exchange
                rabbitTemplate.convertAndSend("", RabbitConfig.DEPLOY_QUEUE + "-dlq", msg);
            } catch (Exception rex) {
                appendLog(d, "Failed to publish to DLQ: " + rex.getMessage());
            }
        } finally {
            // ensure we clear any secrets for this thread
            activeSecrets.remove();
        }
    }

    @PreDestroy
    public void shutdown() {
        try {
            scheduler.shutdownNow();
        } catch (Exception ignored) {}
    }

    // Helper to compute exponential backoff delay for testing and reuse
    public static long computeRetryDelay(int retryCount, long initialDelayMs, long maxDelayMs, double multiplier) {
        if (retryCount <= 1) return initialDelayMs;
        long delay = initialDelayMs;
        for (int i = 1; i < retryCount; i++) {
            delay = Math.min(maxDelayMs, (long)(delay * multiplier));
        }
        return delay;
    }

    private String applyAuthToRepo(DeployMessage msg) {
        String repo = msg.getRepo();
        if (repo == null) return null;
        Map<String,String> env = msg.getEnv();
        if (env != null) {
            String token = env.get("GIT_TOKEN");
            if (token != null && repo.startsWith("https://")) {
                String enc = URLEncoder.encode(token, StandardCharsets.UTF_8);
                return repo.replaceFirst("https://", "https://" + enc + "@");
            }
            String sshKey = env.get("GIT_SSH_PRIVATE_KEY");
            if (sshKey != null && repo.startsWith("git@")) {
                // write key to temp file and set GIT_SSH_COMMAND in environment via ProcessBuilder later
                // For simplicity, return repo as-is; runCommandAndLog will pick up SSH via env if necessary
                return repo;
            }
        }
        return repo;
    }

    private void runShellAndLog(Deploy d, String cmd, Path dir) throws IOException, InterruptedException {
        if (cmd == null || cmd.isBlank()) return;
        List<String> command = List.of("/bin/sh","-c",cmd);
        runCommandAndLog(d, command, dir);
    }

    private void runCommandAndLog(Deploy d, List<String> command) throws IOException, InterruptedException {
        runCommandAndLog(d, command, null, null);
    }

    private void runCommandAndLog(Deploy d, List<String> command, Path dir) throws IOException, InterruptedException {
        runCommandAndLog(d, command, dir, null);
    }

    private void runCommandAndLog(Deploy d, List<String> command, Path dir, Map<String,String> extraEnv) throws IOException, InterruptedException {
        appendLog(d, "Running: " + String.join(" ", command));
        long timeoutSeconds = cloneTimeoutSeconds;
        if (!command.isEmpty() && !"git".equals(command.get(0))) {
            timeoutSeconds = processTimeoutSeconds;
        }
        commandRunner.execute(command, dir, extraEnv, timeoutSeconds, line -> appendLog(d, line));
    }

    private void appendLog(Deploy d, String line) {
        try {
            // mask secrets before persisting
            String masked = maskSecrets(line);
            List<String> logs = d.getLogs();
            if (logs == null) logs = new ArrayList<>();
            logs.add(Instant.now().toString() + " " + masked);
            d.setLogs(logs);
            deployRepository.save(d);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String maskSecrets(String input) {
        if (input == null) return null;
        List<String> secrets = activeSecrets.get();
        if (secrets == null || secrets.isEmpty()) return input;
        String out = input;
        // redact credentials embedded in URLs like https://token@host
        try {
            out = out.replaceAll("https?://[^\\s@/]+@", "https://[REDACTED]@");
        } catch (Exception ignored) {}
        for (String s : secrets) {
            if (s == null || s.isBlank()) continue;
            try {
                out = out.replaceAll(Pattern.quote(s), "[REDACTED]");
            } catch (Exception ignored) {
                out = out.replace(s, "[REDACTED]");
            }
        }
        return out;
    }
}
