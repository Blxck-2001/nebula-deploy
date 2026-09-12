package com.nebula.backend.controller;

import com.nebula.backend.model.Deploy;
import com.nebula.backend.model.Project;
import com.nebula.backend.repo.DeployRepository;
import com.nebula.backend.repo.ProjectRepository;
import com.nebula.backend.repo.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping
public class OverviewController {
    private final DeployRepository deployRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public OverviewController(DeployRepository deployRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.deployRepository = deployRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @DeleteMapping("/deploys/{id}/logs")
    public ResponseEntity<?> deleteDeployLogs(@org.springframework.web.bind.annotation.PathVariable UUID id) {
        Optional<Deploy> opt = deployRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Deploy d = opt.get();

        // verify ownership: only project owner can delete logs
        if (d.getProject() == null || d.getProject().getUser() == null) return ResponseEntity.status(403).build();
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        if (principal == null) return ResponseEntity.status(403).build();
        // Resolve the authenticated user via repository and compare ids to ensure
        // ownership check works whether the stored "username" column contains an
        // email or legacy username value.
        var optUser = userRepository.findByEmail(principal);
        if (optUser.isEmpty()) return ResponseEntity.status(403).build();
        var authUser = optUser.get();
        if (d.getProject().getUser().getId() == null || !d.getProject().getUser().getId().equals(authUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        try {
            d.setLogs(Collections.emptyList());
            deployRepository.save(d);
            return ResponseEntity.ok(Map.of("message","logs deleted"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/deploys")
    public List<Map<String,Object>> listDeploys() {
        List<Deploy> ds = deployRepository.findAll();
        return ds.stream().map(d -> {
            Map<String,Object> m = new HashMap<>();
            m.put("id", d.getId());
            Project p = d.getProject();
            m.put("projectId", p != null ? p.getId() : null);
            m.put("projectName", p != null ? p.getName() : null);
            m.put("status", d.getStatus());
            // frontend expects a human-friendly `time` field and branch/commit
            m.put("time", d.getCreatedAt() != null ? d.getCreatedAt().toString() : null);
            m.put("branch", p != null ? p.getBranch() : null);
            // commit is not tracked currently; leave null
            m.put("commit", null);
            m.put("createdAt", d.getCreatedAt());
            m.put("startedAt", d.getStartedAt());
            m.put("finishedAt", d.getFinishedAt());
            m.put("logsPreview", d.getLogs() != null && !d.getLogs().isEmpty() ? d.getLogs().subList(Math.max(0,d.getLogs().size()-5), d.getLogs().size()) : Collections.emptyList());
            return m;
        }).collect(Collectors.toList());
    }

    @GetMapping("/stats")
    public List<Map<String,String>> stats() {
        // Scope stats to the authenticated user
        String principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var optUser = userRepository.findByEmail(principal);
        if (optUser.isEmpty()) return Collections.emptyList();
        var user = optUser.get();

        List<Project> projectsList = projectRepository.findByUserId(user.getId());
        long projects = projectsList.size();

        List<com.nebula.backend.model.Deploy> userDeploys = new ArrayList<>();
        for (Project p : projectsList) {
            userDeploys.addAll(deployRepository.findByProjectId(p.getId()));
        }

        long deploys = userDeploys.size();
        long queued = userDeploys.stream().filter(d -> "queued".equalsIgnoreCase(d.getStatus())).count();
        long processing = userDeploys.stream().filter(d -> "processing".equalsIgnoreCase(d.getStatus())).count();
        long success = userDeploys.stream().filter(d -> "success".equalsIgnoreCase(d.getStatus())).count();
        long failed = userDeploys.stream().filter(d -> "failed".equalsIgnoreCase(d.getStatus())).count();

        List<Map<String,String>> cards = new ArrayList<>();
        cards.add(Map.of("title","Projetos","value",String.valueOf(projects),"trend","","icon","folder"));
        cards.add(Map.of("title","Deploys","value",String.valueOf(deploys),"trend","","icon","check"));
        cards.add(Map.of("title","Deploys na fila","value",String.valueOf(queued),"trend","","icon","clock"));
        cards.add(Map.of("title","Deploys com sucesso","value",String.valueOf(success),"trend","","icon","check"));
        return cards;
    }

    @GetMapping("/activity")
    public List<Map<String,Object>> activity() {
        // Return recent deploy events as activity
        List<Deploy> ds = deployRepository.findAll();
        return ds.stream()
                .sorted(Comparator.comparing(Deploy::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .map(d -> {
                    Map<String,Object> e = new HashMap<>();
                    Project p = d.getProject();
                    e.put("type", "deploy");
                    e.put("projectId", p!=null? p.getId(): null);
                    e.put("projectName", p!=null? p.getName(): null);
                    e.put("status", d.getStatus());
                    e.put("time", d.getCreatedAt() != null ? d.getCreatedAt().toString() : null);
                    e.put("message", "Deploy " + (d.getStatus()!=null? d.getStatus(): "queued") + " para projeto " + (p!=null? p.getName(): "?"));
                    return e;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/resources")
    public List<Map<String,Object>> resources() {
        // Placeholder timeseries: last 24 hours hourly points
        List<Map<String,Object>> series = new ArrayList<>();
        Instant now = Instant.now().truncatedTo(ChronoUnit.HOURS);
        Random rnd = new Random(42);
        for (int i=23;i>=0;i--) {
            Instant t = now.minus(i, ChronoUnit.HOURS);
            Map<String,Object> point = new HashMap<>();
            point.put("time", t.toString());
            point.put("cpu", 10 + rnd.nextInt(40));
            point.put("memory", 300 + rnd.nextInt(500));
            series.add(point);
        }
        return series;
    }

    @GetMapping("/deploys/{id}/logs")
    public List<String> deployLogs(@org.springframework.web.bind.annotation.PathVariable UUID id) {
        Optional<Deploy> opt = deployRepository.findById(id);
        if (opt.isEmpty()) return Collections.emptyList();
        Deploy d = opt.get();
        return d.getLogs() != null ? d.getLogs() : Collections.emptyList();
    }

    @GetMapping("/deploys/{id}/logs/stream")
    public SseEmitter streamDeployLogs(@org.springframework.web.bind.annotation.PathVariable UUID id) {
        SseEmitter emitter = new SseEmitter(0L);
        ScheduledExecutorService exec = Executors.newSingleThreadScheduledExecutor();
        AtomicInteger lastIndex = new AtomicInteger(0);

        Runnable task = () -> {
            try {
                Optional<Deploy> opt = deployRepository.findById(id);
                if (opt.isEmpty()) {
                    try { emitter.send(SseEmitter.event().name("end").data("not_found")); } catch (Exception ignore) {}
                    emitter.complete();
                    exec.shutdown();
                    return;
                }
                Deploy d = opt.get();
                List<String> logs = d.getLogs() != null ? d.getLogs() : Collections.emptyList();
                int size = logs.size();
                int from = lastIndex.get();
                for (int i = from; i < size; i++) {
                    try { emitter.send(SseEmitter.event().name("log").data(logs.get(i))); } catch (Exception e) { emitter.completeWithError(e); exec.shutdown(); return; }
                }
                lastIndex.set(size);
                if (d.getStatus() != null && (d.getStatus().equalsIgnoreCase("success") || d.getStatus().equalsIgnoreCase("failed"))) {
                    try { emitter.send(SseEmitter.event().name("end").data(d.getStatus())); } catch (Exception ignore) {}
                    emitter.complete();
                    exec.shutdown();
                }
            } catch (Exception e) {
                try { emitter.completeWithError(e); } catch (Exception ignore) {}
                exec.shutdown();
            }
        };

        exec.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS);

        emitter.onCompletion(exec::shutdown);
        emitter.onTimeout(exec::shutdown);

        return emitter;
    }
}
