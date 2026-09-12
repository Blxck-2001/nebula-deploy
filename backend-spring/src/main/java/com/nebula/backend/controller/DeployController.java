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
import java.util.List;

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
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(principal).orElseThrow();
    }

    @PostMapping("/projects/{id}/deploy")
    public ResponseEntity<?> trigger(@PathVariable UUID id, @RequestBody(required = false) Map<String,Object> body) {
        Optional<Project> opt = projectRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Project p = opt.get();
        if (!p.getUser().getEmail().equals(currentUser().getEmail())) return ResponseEntity.status(403).build();

        // Prevent concurrent deploys
        var runningStatuses = List.of("PENDING","RUNNING","queued","processing");
        if (deployRepository.existsByProjectIdAndStatusIn(p.getId(), runningStatuses)) {
            return ResponseEntity.status(409).body(Map.of("error","a deploy is already running for this project"));
        }

        Deploy d = new Deploy();
        d.setProject(p);
        if (body != null && body.containsKey("commit")) d.setCommit((String)body.get("commit"));
        d.setStatus("PENDING");
        d.setCreatedAt(Instant.now());
        deployRepository.save(d);

        // publish minimal message; worker will load project details from DB
        com.nebula.backend.dto.DeploymentQueuedMessage msg = new com.nebula.backend.dto.DeploymentQueuedMessage();
        msg.setDeploymentId(d.getId());
        msg.setProjectId(p.getId());

        rabbitTemplate.convertAndSend(RabbitConfig.DEPLOY_EXCHANGE, RabbitConfig.DEPLOY_ROUTING, msg, message -> {
            message.getMessageProperties().setContentType("application/json");
            return message;
        });

        return ResponseEntity.accepted().body(Map.of("message","deployment queued","deploymentId",d.getId()));
    }
}
