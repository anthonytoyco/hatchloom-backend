package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.SandboxTool;

/**
 * Repository for {@link SandboxTool} entities.
 */
public interface SandboxToolRepository extends JpaRepository<SandboxTool, UUID> {

    /**
     * Returns all tools belonging to a given sandbox.
     *
     * @param sandboxId the sandbox's UUID
     * @return list of tools, empty if none found
     */
    List<SandboxTool> findAllBySandbox_Id(UUID sandboxId);

    /**
     * Returns whether a sandbox already has a tool of the given type.
     *
     * @param sandboxId the sandbox UUID
     * @param toolType  the tool type identifier
     * @return true when a tool of the same type already exists
     */
    boolean existsBySandbox_IdAndToolType(UUID sandboxId, String toolType);
}
