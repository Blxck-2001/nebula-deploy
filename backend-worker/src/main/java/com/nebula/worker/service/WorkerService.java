package com.nebula.worker.service;

import com.nebula.worker.config.RabbitConfig;
import com.nebula.worker.dto.DeploymentQueuedMessage;
import com.nebula.worker.dto.DeployMessage;
import com.nebula.worker.model.Project;
import com.nebula.worker.repo.ProjectRepository;
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
    private final ProjectRepository projectRepository;
    private final RabbitTemplate rabbitTemplate;
    private static final int MAX_RETRIES = 3;
    private final ThreadLocal<List<String>> activeSecrets = ThreadLocal.withInitial(ArrayList::new);
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final CommandRunner commandRunner;
    private final GitService gitService;
    private final DockerService dockerService;

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

    public WorkerService(DeployRepository deployRepository, ProjectRepository projectRepository, RabbitTemplate rabbitTemplate, CommandRunner commandRunner, GitService gitService, DockerService dockerService) {
        this.deployRepository = deployRepository;
        this.projectRepository = projectRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.commandRunner = commandRunner;
        this.gitService = gitService;
        this.dockerService = dockerService;
    }

    @RabbitListener(queues = RabbitConfig.DEPLOY_QUEUE)
    public void handle(DeploymentQueuedMessage msg) {
        // accept either `deploymentId` or `deployId` from producers
        java.util.UUID incomingId = msg.getDeploymentId() != null ? msg.getDeploymentId() : msg.getDeployId();
        System.out.println("Received deployment queued: " + incomingId);
        var opt = deployRepository.findById(incomingId);
        if (opt.isEmpty()) {
            System.out.println("Deploy not found: " + msg.getDeploymentId());
            return;
        }
        Deploy d = opt.get();

        var popt = projectRepository.findById(msg.getProjectId());
        if (popt.isEmpty()) {
            appendLog(d, "Project not found: " + msg.getProjectId());
            d.setStatus("FAILED");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);
            return;
        }
        Project project = popt.get();

        d.setStatus("RUNNING");
        d.setStartedAt(Instant.now());
        d.setLogs(new ArrayList<>());
        deployRepository.save(d);

        Path baseDir = Path.of(System.getProperty("worker.work-dir", "/tmp/worker"));
        try {
            // prepare active secrets to be masked in logs for this deploy
            List<String> secrets = new ArrayList<>();
            Map<String,String> env = project.getEnv();
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
            // prepare repo dir (persistent per project)
            Path repoDir = gitService.prepareRepository(baseDir, project, null);

            // build image
            String imageTag = "nebula-" + project.getId().toString() + ":" + d.getId().toString();
            String dockerfilePath = "Dockerfile"; // default
            dockerService.buildImage(repoDir, imageTag, dockerfilePath, line -> appendLog(d, line));

            // stop and remove previous container
            String containerName = "nebula-" + project.getId().toString();
            dockerService.stopAndRemoveContainer(containerName);

            // run container
            int port = project.getPort() == null ? 3000 : project.getPort();
            dockerService.runContainer(containerName, imageTag, port, project.getEnv());

            // verify
            boolean running = dockerService.verifyContainerRunning(containerName);
            if (!running) throw new RuntimeException("Container failed to start");

            d.setStatus("SUCCESS");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);

            // update project status and metadata
            try {
                project.setStatus("RUNNING");
                project.setLastDeployedAt(Instant.now());
                project.setLastImage(imageTag);
                projectRepository.save(project);
            } catch (Exception ex) {
                appendLog(d, "Failed to update project metadata: " + ex.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
            appendLog(d, "Error: " + e.getMessage());

            // handle retries
            Integer retries = d.getRetryCount();
            if (retries == null) retries = 0;
            if (retries < MAX_RETRIES) {
                int next = retries + 1;
                d.setRetryCount(next);
                appendLog(d, "Scheduling retry (" + next + ")...");
                deployRepository.save(d);
                long delay = computeRetryDelay(next, retryInitialDelayMs, retryMaxDelayMs, retryMultiplier);
                DeploymentQueuedMessage retryMsg = new DeploymentQueuedMessage();
                retryMsg.setDeploymentId(d.getId());
                retryMsg.setProjectId(project.getId());
                long finalDelay = delay;
                scheduler.schedule(() -> {
                    try {
                        rabbitTemplate.convertAndSend(RabbitConfig.DEPLOY_EXCHANGE, RabbitConfig.DEPLOY_ROUTING, retryMsg);
                    } catch (Exception ex) {
                        appendLog(d, "Failed to republish message for retry: " + ex.getMessage());
                    }
                }, finalDelay, TimeUnit.MILLISECONDS);
                return;
            }

            // max retries reached
            appendLog(d, "Max retries reached, marking failed and sending to DLQ");
            d.setStatus("FAILED");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);
            try {
                project.setStatus("FAILED");
                projectRepository.save(project);
            } catch (Exception ex) {
                appendLog(d, "Failed to update project status after failure: " + ex.getMessage());
            }
            try {
                rabbitTemplate.convertAndSend("", RabbitConfig.DEPLOY_QUEUE + "-dlq", new DeploymentQueuedMessage() {{ setDeploymentId(d.getId()); setProjectId(project.getId()); }});
            } catch (Exception rex) {
                appendLog(d, "Failed to publish to DLQ: " + rex.getMessage());
            }
        } finally {
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
            // ensure saved log line fits DB column (varchar(255))
            String prefix = Instant.now().toString() + " ";
            int maxTotal = 255;
            String suffix = "...[truncated]";
            if (masked == null) masked = "";
            int avail = maxTotal - prefix.length();
            String finalMasked = masked;
            if (finalMasked.length() > avail) {
                int keep = Math.max(0, avail - suffix.length());
                finalMasked = finalMasked.substring(0, keep) + suffix;
            }
            List<String> logs = d.getLogs();
            if (logs == null) logs = new ArrayList<>();
            logs.add(prefix + finalMasked);
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
