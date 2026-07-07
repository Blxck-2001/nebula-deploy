package com.nebula.worker.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "deploys")
public class Deploy {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "project_id", columnDefinition = "uuid")
    private UUID projectId;

    private String status;

    @ElementCollection
    @CollectionTable(name = "deploy_logs", joinColumns = @JoinColumn(name = "deploy_id"))
    @Column(name = "log_line")
    private List<String> logs;

    private Instant createdAt;
    private Instant startedAt;
    private Instant finishedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getLogs() { return logs; }
    public void setLogs(List<String> logs) { this.logs = logs; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
}
