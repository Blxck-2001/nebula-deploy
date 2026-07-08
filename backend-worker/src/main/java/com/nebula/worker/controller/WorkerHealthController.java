package com.nebula.worker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.Map;

@RestController
public class WorkerHealthController {
    private final Instant started = Instant.now();

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "startedAt", started.toString(),
            "now", Instant.now().toString()
        );
    }
}
