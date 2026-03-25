package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.SideHustle;

/**
 * Repository for {@link SideHustle} entities.
 */
public interface SideHustleRepository extends JpaRepository<SideHustle, UUID> {

    /**
     * Returns all SideHustles owned by the given student.
     *
     * @param studentId the student's UUID (from the Auth service)
     * @return list of SideHustles, empty if none found
     */
    List<SideHustle> findAllByStudentId(UUID studentId);

    /**
     * Returns all SideHustles linked to a sandbox.
     *
     * @param sandboxId the sandbox UUID
     * @return list of SideHustles, empty if none linked
     */
    List<SideHustle> findAllBySandbox_Id(UUID sandboxId);
}
