package com.nebula.backend.controller;

import com.nebula.backend.config.RabbitConfig;
import com.nebula.backend.dto.DeployMessage;
import com.nebula.backend.model.Deploy;
import com.nebula.backend.model.Project;
import com.nebula.backend.model.User;
import com.nebula.backend.repo.DeployRepository;
import com.nebula.backend.repo.ProjectRepository;
import com.nebula.backend.repo.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
public class DeployController {
    private final ProjectRepository projectRepository;
    private final DeployRepository deployRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    public DeployController(ProjectRepository projectRepository, DeployRepository deployRepository, UserRepository userRepository, RabbitTemplate rabbitTemplate) {
        this.projectRepository = projectRepository;
        this.deployRepository = deployRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @PostMapping("/projects/{id}/deploy")
    public ResponseEntity<?> trigger(@PathVariable UUID id, @RequestBody(required = false) Map<String,Object> body) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project p = opt.get();
        if (!p.getUser().getUsername().equals(currentUser().getUsername())) return ResponseEntity.status(403).build();

        Deploy d = new Deploy();
        d.setProject(p);
        d.setStatus("queued");
        d.setCreatedAt(Instant.now());
        deployRepository.save(d);

        DeployMessage msg = new DeployMessage();
        msg.setDeployId(d.getId());
        msg.setProjectId(p.getId());
        msg.setRepo(p.getRepo());
        msg.setBranch(p.getBranch());
        msg.setBuildCommand(p.getBuildCommand());
        msg.setRunCommand(p.getRunCommand());
        msg.setEnv(p.getEnv());

        rabbitTemplate.convertAndSend(RabbitConfig.DEPLOY_EXCHANGE, RabbitConfig.DEPLOY_ROUTING, msg, message -> {
            message.getMessageProperties().setContentType("application/json");
            return message;
        });

        return ResponseEntity.ok(Map.of("message","deploy queued","deploy",d));
    }
}
