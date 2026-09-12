package com.nebula.worker.service;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class DockerService {
    private final CommandRunner commandRunner;

    public DockerService(CommandRunner commandRunner) {
        this.commandRunner = commandRunner;
    }

    public void buildImage(Path workDir, String imageTag, String dockerfilePath, java.util.function.Consumer<String> logSink) throws Exception {
        // Determine Dockerfile path: prefer provided path, otherwise search for a Dockerfile
        String df = dockerfilePath == null ? "Dockerfile" : dockerfilePath;
        Path dfPath = workDir.resolve(df);
        boolean dockerfileFound = Files.exists(dfPath);
        if (!dockerfileFound) {
            try (Stream<Path> s = Files.find(workDir, 3, (p, attr) -> p.getFileName().toString().equals("Dockerfile"))) {
                Optional<Path> found = s.findFirst();
                if (found.isPresent()) {
                    dfPath = found.get();
                    dockerfileFound = true;
                }
            }
        }

        Path contextDir = workDir;
        if (dfPath.getParent() != null && Files.exists(dfPath.getParent())) {
            // if Dockerfile is in a subfolder, use that folder as build context
            contextDir = dfPath.getParent();
        }

        if (dockerfileFound) {
            List<String> cmd = List.of("docker","build","-t", imageTag, "-f", dfPath.toString(), contextDir.toString());
            String cmdLine = String.join(" ", cmd);
            System.out.println("Running command: " + cmdLine);
            if (logSink != null) logSink.accept("Running command: " + cmdLine);
            commandRunner.execute(cmd, workDir, null, 600, line -> {
                System.out.println(line);
                if (logSink != null) logSink.accept(line);
            });
        } else {
            // No Dockerfile found: attempt to build using Cloud Native Buildpacks via `pack`
            List<String> packCmd = List.of("pack","build", imageTag, "--path", contextDir.toString(), "--builder", "paketobuildpacks/builder:base");
            String cmdLine = String.join(" ", packCmd);
            System.out.println("No Dockerfile found; attempting Buildpacks: " + cmdLine);
            if (logSink != null) logSink.accept("No Dockerfile found; attempting Buildpacks: " + cmdLine);
            try {
                // Pack builds can take longer; allow extended timeout (30 minutes)
                commandRunner.execute(packCmd, workDir, null, 1800, line -> {
                    System.out.println(line);
                    if (logSink != null) logSink.accept(line);
                });
            } catch (Exception ex) {
                String msg = "Buildpacks build failed. Ensure the `pack` CLI is installed in the worker runtime. Original error: " + ex.getMessage();
                if (logSink != null) logSink.accept(msg);
                throw new RuntimeException(msg, ex);
            }
        }
    }

    public void stopAndRemoveContainer(String containerName) throws Exception {
        // Force remove container if exists (works cross-platform)
        commandRunner.execute(List.of("docker","rm","-f",containerName), null, null, 60, line -> {});
    }

    public void runContainer(String containerName, String imageTag, int port, Map<String,String> env) throws Exception {
        // build docker run command and inject environment variables from project
        List<String> cmd = new java.util.ArrayList<>();
        cmd.add("docker");
        cmd.add("run");
        cmd.add("-d");
        cmd.add("--name");
        cmd.add(containerName);
        if (env != null) {
            for (Map.Entry<String,String> e : env.entrySet()) {
                if (e.getKey() == null || e.getKey().isBlank()) continue;
                String val = e.getValue() == null ? "" : e.getValue();
                cmd.add("-e");
                cmd.add(e.getKey() + "=" + val);
            }
        }
        // attach container to the compose network so it can reach other services by name
        String network = System.getenv().getOrDefault("DOCKER_NETWORK", "nebula-deploy_default");
        cmd.add("--network");
        cmd.add(network);
        cmd.add("-p");
        cmd.add(String.valueOf(port) + ":" + String.valueOf(port));
        cmd.add(imageTag);
        commandRunner.execute(cmd, null, null, 60, line -> {});
    }

    public boolean verifyContainerRunning(String containerName) throws Exception {
        // check container status
        // return true if running
        // this is a simple implementation using docker inspect
        try {
            StringBuilder out = new StringBuilder();
            commandRunner.execute(List.of("docker","inspect","-f","{{.State.Running}}", containerName), null, null, 10, line -> out.append(line));
            String s = out.toString().trim();
            if (s.equalsIgnoreCase("true")) return true;
            // try health status if present
            out.setLength(0);
            commandRunner.execute(List.of("docker","inspect","-f","{{if .State.Health}}{{.State.Health.Status}}{{end}}", containerName), null, null, 5, line -> out.append(line));
            String health = out.toString().trim();
            return health.isEmpty() ? false : "healthy".equalsIgnoreCase(health);
        } catch (Exception e) {
            return false;
        }
    }
}
