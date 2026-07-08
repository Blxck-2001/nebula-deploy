package com.nebula.worker.integration;

import com.nebula.worker.model.Deploy;
import com.nebula.worker.repo.DeployRepository;
import com.nebula.worker.service.CommandRunner;
import com.nebula.worker.dto.DeployMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.utility.DockerImageName;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class WorkerE2ETest {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:15-alpine"))
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    static RabbitMQContainer rabbitmq = new RabbitMQContainer(DockerImageName.parse("rabbitmq:3.11-management-alpine"));

    @BeforeAll
    public static void startIfDocker() {
        try {
            DockerClientFactory.instance().client();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "Docker not available: " + e.getMessage());
        }
        postgres.start();
        rabbitmq.start();
    }

    @AfterAll
    public static void stopAll() {
        if (postgres != null && postgres.isRunning()) postgres.stop();
        if (rabbitmq != null && rabbitmq.isRunning()) rabbitmq.stop();
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> postgres.getJdbcUrl());
        r.add("spring.datasource.username", () -> postgres.getUsername());
        r.add("spring.datasource.password", () -> postgres.getPassword());
        r.add("spring.rabbitmq.host", () -> rabbitmq.getHost());
        r.add("spring.rabbitmq.port", () -> rabbitmq.getAmqpPort());
    }

    @Autowired
    DeployRepository deployRepository;

    @Autowired
    RabbitTemplate rabbitTemplate;

    @TestConfiguration
    static class TestCfg {
        @Bean
        public CommandRunner commandRunner() {
            return (command, dir, extraEnv, timeoutSeconds, outputLine) -> {
                outputLine.accept("[simulated] " + String.join(" ", command));
                outputLine.accept("Exit code: 0");
            };
        }
    }

    @Test
    public void publishConsumePersist() {
        UUID id = UUID.randomUUID();
        Deploy d = new Deploy();
        d.setId(id);
        d.setProjectId(UUID.randomUUID());
        d.setStatus("queued");
        d.setCreatedAt(Instant.now());
        deployRepository.save(d);

        DeployMessage msg = new DeployMessage();
        msg.setDeployId(id);
        msg.setRepo("https://github.com/nebuladev/empty-repo");
        msg.setBuildCommand("echo build");
        msg.setRunCommand("echo run");
        msg.setEnv(new HashMap<>());

        rabbitTemplate.convertAndSend("deploys-exchange", "deploy.new", msg);

        await().atMost(30, TimeUnit.SECONDS).pollInterval(1, TimeUnit.SECONDS).untilAsserted(() -> {
            Deploy updated = deployRepository.findById(id).orElseThrow();
            assertEquals("success", updated.getStatus());
        });
    }
}
