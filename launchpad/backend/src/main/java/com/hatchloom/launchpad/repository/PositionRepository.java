package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.Position;
import com.hatchloom.launchpad.model.enums.PositionStatus;

/**
 * Repository for {@link Position} entities.
 */
public interface PositionRepository extends JpaRepository<Position, UUID> {

    /**
     * Returns all positions belonging to a given SideHustle.
     *
     * @param sideHustleId the SideHustle's UUID
     * @return list of positions, empty if none found
     */
    List<Position> findAllBySideHustle_Id(UUID sideHustleId);

    /**
     * Checks whether any position with the given status exists for a SideHustle.
     * Used to recalculate {@code SideHustle.hasOpenPositions} after a status
     * change.
     *
     * @param sideHustleId the SideHustle's UUID
     * @param status       the status to check for (typically {@code OPEN})
     * @return {@code true} if at least one matching position exists
     */
    boolean existsBySideHustle_IdAndStatus(UUID sideHustleId, PositionStatus status);
}
