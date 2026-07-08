package com.nebula.worker.service;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Component
public class DefaultCommandRunner implements CommandRunner {
    @Override
    public void execute(List<String> command, Path dir, Map<String, String> extraEnv, long timeoutSeconds, Consumer<String> outputLine) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        if (dir != null) pb.directory(dir.toFile());
        if (extraEnv != null && !extraEnv.isEmpty()) {
            try { pb.environment().putAll(extraEnv); } catch (Exception ignored) {}
        }
        pb.redirectErrorStream(true);
        Process p = pb.start();

        Thread reader = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) {
                    outputLine.accept(line);
                }
            } catch (IOException ioe) {
                outputLine.accept("Error reading process output: " + ioe.getMessage());
            }
        });
        reader.setDaemon(true);
        reader.start();

        boolean finished = p.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            p.destroyForcibly();
            throw new RuntimeException("Command timed out after " + timeoutSeconds + " seconds");
        }
        int exit = p.exitValue();
        outputLine.accept("Exit code: " + exit);
        if (exit != 0) throw new RuntimeException("Command failed with exit " + exit);
    }
}
