package com.nebula.worker.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public interface CommandRunner {
    void execute(List<String> command, Path dir, Map<String,String> extraEnv, long timeoutSeconds, Consumer<String> outputLine) throws IOException, InterruptedException;
}
