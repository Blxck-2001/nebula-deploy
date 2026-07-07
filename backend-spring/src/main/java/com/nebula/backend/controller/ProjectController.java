package com.nebula.backend.controller;

import com.nebula.backend.model.Project;
import com.nebula.backend.model.User;
import com.nebula.backend.repo.ProjectRepository;
import com.nebula.backend.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public List<Project> list() {
        User u = currentUser();
        return projectRepository.findByUserId(u.getId());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String,Object> body) {
        User u = currentUser();
        Project p = new Project();
        p.setUser(u);
        p.setName((String)body.get("name"));
        p.setRepo((String)body.get("repo"));
        p.setBranch((String)body.getOrDefault("branch","main"));
        p.setPort((Integer)body.getOrDefault("port",3000));
        p.setBuildCommand((String)body.getOrDefault("buildCommand","docker build ."));
        p.setRunCommand((String)body.getOrDefault("runCommand","docker run"));
        projectRepository.save(p);
        return ResponseEntity.ok(Map.of("project",p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Map<String,Object> body) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project p = opt.get();
        if (!p.getUser().getUsername().equals(currentUser().getUsername())) return ResponseEntity.status(403).build();
        if (body.containsKey("name")) p.setName((String)body.get("name"));
        if (body.containsKey("repo")) p.setRepo((String)body.get("repo"));
        projectRepository.save(p);
        return ResponseEntity.ok(Map.of("project",p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project p = opt.get();
        if (!p.getUser().getUsername().equals(currentUser().getUsername())) return ResponseEntity.status(403).build();
        projectRepository.delete(p);
        return ResponseEntity.ok(Map.of("message","deleted"));
    }
}
