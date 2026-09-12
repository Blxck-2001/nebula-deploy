package com.nebula.worker.dto;

import java.util.UUID;

public class DeploymentQueuedMessage {
    private UUID deploymentId;
    private UUID deployId;
    private UUID projectId;

    public UUID getDeploymentId() { return deploymentId; }
    public void setDeploymentId(UUID deploymentId) { this.deploymentId = deploymentId; }
    public UUID getDeployId() { return deployId; }
    public void setDeployId(UUID deployId) { this.deployId = deployId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
}
