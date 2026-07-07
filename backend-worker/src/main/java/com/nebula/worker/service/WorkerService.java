package com.nebula.worker.service;

import com.nebula.worker.config.RabbitConfig;
import com.nebula.worker.dto.DeployMessage;
import com.nebula.worker.model.Deploy;
import com.nebula.worker.repo.DeployRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkerService {
    private final DeployRepository deployRepository;

    public WorkerService(DeployRepository deployRepository) {
        this.deployRepository = deployRepository;
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
            Files.createDirectories(baseDir);
            Path work = Files.createTempDirectory(baseDir, "deploy-");
            // clone
            runCommandAndLog(d, List.of("git","clone","--depth","1","--branch",msg.getBranch(),msg.getRepo(),work.toString()));
            // run build command in work dir
            runShellAndLog(d, msg.getBuildCommand(), work);
            // run run command in work dir
            runShellAndLog(d, msg.getRunCommand(), work);

            d.setStatus("success");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);
        } catch (Exception e) {
            e.printStackTrace();
            appendLog(d, "Error: " + e.getMessage());
            d.setStatus("failed");
            d.setFinishedAt(Instant.now());
            deployRepository.save(d);
        }
    }

    private void runShellAndLog(Deploy d, String cmd, Path dir) throws IOException, InterruptedException {
        if (cmd == null || cmd.isBlank()) return;
        List<String> command = List.of("/bin/sh","-c",cmd);
        runCommandAndLog(d, command, dir);
    }

    private void runCommandAndLog(Deploy d, List<String> command) throws IOException, InterruptedException {
        runCommandAndLog(d, command, null);
    }

    private void runCommandAndLog(Deploy d, List<String> command, Path dir) throws IOException, InterruptedException {
        appendLog(d, "Running: " + String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        if (dir != null) pb.directory(dir.toFile());
        pb.redirectErrorStream(true);
        Process p = pb.start();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = r.readLine()) != null) {
                appendLog(d, line);
            }
        }
        int exit = p.waitFor();
        appendLog(d, "Exit code: " + exit);
        if (exit != 0) throw new RuntimeException("Command failed with exit " + exit);
    }

    private void appendLog(Deploy d, String line) {
        try {
            List<String> logs = d.getLogs();
            if (logs == null) logs = new ArrayList<>();
            logs.add(Instant.now().toString() + " " + line);
            d.setLogs(logs);
            deployRepository.save(d);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
