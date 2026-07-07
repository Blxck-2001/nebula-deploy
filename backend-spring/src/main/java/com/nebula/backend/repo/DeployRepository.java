package com.nebula.backend.repo;

import com.nebula.backend.model.Deploy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeployRepository extends JpaRepository<Deploy, UUID> {
    List<Deploy> findByProjectId(UUID projectId);
}
