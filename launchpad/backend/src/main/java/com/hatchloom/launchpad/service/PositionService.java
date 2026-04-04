package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreatePositionRequest;
import com.hatchloom.launchpad.dto.response.PositionResponse;
import com.hatchloom.launchpad.model.Position;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.PositionStatus;
import com.hatchloom.launchpad.repository.PositionRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;
import com.hatchloom.launchpad.state.PositionStateContext;

/**
 * Service for Position lifecycle operations.
 *
 * <p>
 * Uses the State pattern (via {@link PositionStateContext}) to enforce valid
 * status transitions. Maintains the {@code SideHustle.hasOpenPositions} flag
 * after every create and status-change operation.
 * </p>
 */
@Service
public class PositionService {

    private static final Logger log = LoggerFactory.getLogger(PositionService.class);

    private final PositionRepository positionRepository;
    private final SideHustleRepository sideHustleRepository;
    private final SideHustleService sideHustleService;
    private final PositionStateContext positionStateContext;

    public PositionService(PositionRepository positionRepository,
            SideHustleRepository sideHustleRepository,
            SideHustleService sideHustleService,
            PositionStateContext positionStateContext) {
        this.positionRepository = positionRepository;
        this.sideHustleRepository = sideHustleRepository;
        this.sideHustleService = sideHustleService;
        this.positionStateContext = positionStateContext;
    }

    /**
     * Creates a new OPEN position for a SideHustle and sets
     * {@code hasOpenPositions = true} on the parent.
     *
     * @param sideHustleId the SideHustle UUID
     * @param request      the position creation request
     * @param callerId     the authenticated student's UUID (must own the
     *                     SideHustle)
     * @return the created {@link PositionResponse}
     */
    @Transactional
    public PositionResponse createPosition(UUID sideHustleId, CreatePositionRequest request,
            UUID callerId) {
        SideHustle sideHustle = sideHustleService.findOrThrow(sideHustleId);
        if (!sideHustle.getStudentId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own this SideHustle");
        }

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setTitle(request.getTitle());
        position.setDescription(request.getDescription());
        position.setStatus(PositionStatus.OPEN);
        Position saved = positionRepository.save(position);

        sideHustle.setHasOpenPositions(true);
        sideHustleRepository.save(sideHustle);

        log.debug("Created OPEN position {} for SideHustle {}", saved.getId(), sideHustleId);
        return PositionResponse.from(saved);
    }

    /**
     * Transitions a position to a new status using the State pattern.
     * Recalculates {@code hasOpenPositions} on the parent SideHustle afterward.
     *
     * @param positionId   the position UUID
     * @param targetStatus the desired new status
     * @param callerId     the authenticated student's UUID (must own the
     *                     SideHustle)
     * @return the updated {@link PositionResponse}
     * @throws IllegalStateException if the transition is invalid for the current
     *                               state
     */
    @Transactional
    public PositionResponse updatePositionStatus(UUID positionId, PositionStatus targetStatus,
            UUID callerId) {
        Position position = findOrThrow(positionId);
        SideHustle sideHustle = position.getSideHustle();
        if (!sideHustle.getStudentId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own this SideHustle");
        }

        PositionStatus newStatus = positionStateContext.transition(position.getStatus(), targetStatus);
        position.setStatus(newStatus);
        Position saved = positionRepository.save(position);

        // Recalculate the open-positions flag on the parent SideHustle
        boolean stillOpen = positionRepository.existsBySideHustle_IdAndStatus(
                sideHustle.getId(), PositionStatus.OPEN);
        sideHustle.setHasOpenPositions(stillOpen);
        sideHustleRepository.save(sideHustle);

        log.debug("Position {} transitioned to {}", positionId, newStatus);
        return PositionResponse.from(saved);
    }

    /**
     * Returns the raw status string for a position (Position Status Interface).
     * Used by {@code GET /positions/{id}/status} for ConnectHub.
     *
     * @param positionId the position UUID
     * @return the status name string (e.g. {@code "OPEN"})
     */
    @Transactional(readOnly = true)
    public String getPositionStatus(UUID positionId) {
        return findOrThrow(positionId).getStatus().name();
    }

    /**
     * Lists all positions for a SideHustle.
     *
     * @param sideHustleId the SideHustle UUID
     * @return list of {@link PositionResponse}
     */
    @Transactional(readOnly = true)
    public List<PositionResponse> listPositions(UUID sideHustleId) {
        sideHustleService.findOrThrow(sideHustleId);
        return positionRepository.findAllBySideHustle_Id(sideHustleId)
                .stream()
                .map(PositionResponse::from)
                .toList();
    }

    private Position findOrThrow(UUID positionId) {
        return positionRepository.findById(positionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Position not found: " + positionId));
    }
}
