package com.nebula.worker.integration;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assumptions;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestcontainersSmokeTest {

    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");

    static RabbitMQContainer rabbitmq = new RabbitMQContainer("rabbitmq:3.11-management-alpine");

    @BeforeAll
    public static void startContainersIfDockerAvailable() {
        try {
            DockerClientFactory.instance().client();
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "Docker not available: " + e.getMessage());
            return;
        }

        postgres.start();
        rabbitmq.start();
    }

    @AfterAll
    public static void stopContainers() {
        if (postgres != null && postgres.isRunning()) postgres.stop();
        if (rabbitmq != null && rabbitmq.isRunning()) rabbitmq.stop();
    }

    @Test
    public void containersStart() {
        assertTrue(postgres.isRunning());
        assertTrue(rabbitmq.isRunning());
    }
}
