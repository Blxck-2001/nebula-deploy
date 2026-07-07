package com.nebula.backend.model;

import jakarta.persistence.*;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    private User user;

    private String name;
    private String repo;
    private String branch;
    private Integer port;
    private String buildCommand;
    private String runCommand;

    @ElementCollection
    @CollectionTable(name = "project_env")
    @MapKeyColumn(name = "env_key")
    @Column(name = "env_value")
    private Map<String,String> env;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRepo() { return repo; }
    public void setRepo(String repo) { this.repo = repo; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }
    public String getBuildCommand() { return buildCommand; }
    public void setBuildCommand(String buildCommand) { this.buildCommand = buildCommand; }
    public String getRunCommand() { return runCommand; }
    public void setRunCommand(String runCommand) { this.runCommand = runCommand; }
    public Map<String, String> getEnv() { return env; }
    public void setEnv(Map<String, String> env) { this.env = env; }
}
