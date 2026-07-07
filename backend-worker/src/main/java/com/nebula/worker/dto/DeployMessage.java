package com.nebula.worker.dto;

import java.util.Map;
import java.util.UUID;

public class DeployMessage {
    private UUID deployId;
    private UUID projectId;
    private String repo;
    private String branch;
    private String buildCommand;
    private String runCommand;
    private Map<String,String> env;

    public UUID getDeployId() { return deployId; }
    public void setDeployId(UUID deployId) { this.deployId = deployId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getBuildCommand() { return buildCommand; }
    public void setBuildCommand(String buildCommand) { this.buildCommand = buildCommand; }
    public String getRunCommand() { return runCommand; }
    public void setRunCommand(String runCommand) { this.runCommand = runCommand; }
    public Map<String, String> getEnv() { return env; }
    public void setEnv(Map<String, String> env) { this.env = env; }
}
