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

        // keep the last N lines in memory for error reporting
        final int MAX_LINES = 200;
        java.util.Deque<String> tail = new java.util.ArrayDeque<>(MAX_LINES + 1);

        Thread reader = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) {
                    // store tail
                    if (tail.size() >= MAX_LINES) tail.removeFirst();
                    tail.addLast(line);
                    try { outputLine.accept(line); } catch (Exception ignored) {}
                }
            } catch (IOException ioe) {
                try { outputLine.accept("Error reading process output: " + ioe.getMessage()); } catch (Exception ignored) {}
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
        try { outputLine.accept("Exit code: " + exit); } catch (Exception ignored) {}
        if (exit != 0) {
            StringBuilder sb = new StringBuilder();
            sb.append("Command failed with exit ").append(exit).append(". Last output:\n");
            for (String l : tail) {
                sb.append(l).append('\n');
            }
            throw new RuntimeException(sb.toString());
        }
    }
}
