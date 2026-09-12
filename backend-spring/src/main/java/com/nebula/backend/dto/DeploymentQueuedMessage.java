package com.nebula.backend.dto;

import java.util.UUID;

public class DeploymentQueuedMessage {
    private UUID deploymentId;
    private UUID projectId;

    public UUID getDeploymentId() { return deploymentId; }
    public void setDeploymentId(UUID deploymentId) { this.deploymentId = deploymentId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
}
