package com.nebula.worker.repo;

import com.nebula.worker.model.Deploy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeployRepository extends JpaRepository<Deploy, UUID> {
}
