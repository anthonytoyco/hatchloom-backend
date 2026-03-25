package com.hatchloom.launchpad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.BusinessModelCanvas;

/**
 * Repository for {@link BusinessModelCanvas} entities.
 */
public interface BusinessModelCanvasRepository extends JpaRepository<BusinessModelCanvas, UUID> {

    /**
     * Returns the BMC for the given SideHustle, if it exists.
     *
     * @param sideHustleId the SideHustle's UUID
     * @return the BMC wrapped in Optional, or empty if not found
     */
    Optional<BusinessModelCanvas> findBySideHustle_Id(UUID sideHustleId);
}
