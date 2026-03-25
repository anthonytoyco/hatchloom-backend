package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.Sandbox;

/**
 * Repository for {@link Sandbox} entities.
 */
public interface SandboxRepository extends JpaRepository<Sandbox, UUID> {

    /**
     * Returns all sandboxes owned by the given student.
     *
     * @param studentId the student's UUID (from the Auth service)
     * @return list of sandboxes, empty if none found
     */
    List<Sandbox> findAllByStudentId(UUID studentId);
}
