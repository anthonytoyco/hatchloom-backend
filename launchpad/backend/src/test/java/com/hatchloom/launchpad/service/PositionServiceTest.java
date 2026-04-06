package com.hatchloom.launchpad.service;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
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
 * TC-Q2-003 - Create Open Position
 *
 * <p>
 * Requirements Coverage: HL-Position-Created-Success
 * </p>
 *
 * <p>
 * Verifies that {@link PositionService#createPosition} creates a Position with
 * {@code status = OPEN}, sets {@code SideHustle.hasOpenPositions = true}, and
 * that the
 * State pattern correctly enforces and rejects status transitions.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class PositionServiceTest {

    @Mock
    private PositionRepository positionRepository;
    @Mock
    private SideHustleRepository sideHustleRepository;
    @Mock
    private SideHustleService sideHustleService;
    @Spy
    private PositionStateContext positionStateContext;

    @InjectMocks
    private PositionService positionService;

    @Test
    void stateContext_isInitialized() {
        assertNotNull(positionStateContext);
    }

    /**
     * TC-Q2-003 main path: position is created with OPEN status and the parent
     * SideHustle's {@code hasOpenPositions} flag is set to {@code true}.
     */
    @Test
    void createPosition_setsStatusOpenAndUpdatesHasOpenPositionsFlag() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        sideHustle.setHasOpenPositions(false);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);
        when(positionRepository.save(any(Position.class))).thenAnswer(inv -> inv.getArgument(0));
        when(sideHustleRepository.save(any(SideHustle.class))).thenAnswer(inv -> inv.getArgument(0));

        CreatePositionRequest request = new CreatePositionRequest();
        request.setTitle("Backend Developer");
        request.setDescription("Work on the API");

        PositionResponse response = positionService.createPosition(sideHustleId, request, callerId);

        assertEquals(PositionStatus.OPEN, response.getStatus());
        assertEquals("Backend Developer", response.getTitle());
        // Parent flag must be updated
        assertTrue(sideHustle.isHasOpenPositions());
        verify(sideHustleRepository).save(sideHustle);
    }

    /**
     * TC-Q2-003: position status is OPEN so ConnectHub can read it via the
     * Position Status Interface.
     */
    @Test
    void createPosition_positionStatusIsImmediatelyReadableAsOpen() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);

        Position savedPosition = new Position();
        savedPosition.setSideHustle(sideHustle);
        savedPosition.setTitle("Frontend Dev");
        savedPosition.setStatus(PositionStatus.OPEN);
        when(positionRepository.save(any())).thenReturn(savedPosition);
        when(sideHustleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreatePositionRequest request = new CreatePositionRequest();
        request.setTitle("Frontend Dev");

        PositionResponse response = positionService.createPosition(sideHustleId, request, callerId);

        assertEquals(PositionStatus.OPEN, response.getStatus());
    }

    /**
     * Creating a position for a SideHustle owned by another student must return
     * 403.
     */
    @Test
    void createPosition_callerNotOwner_returns403() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(UUID.randomUUID());
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this SideHustle"))
                .when(sideHustleService).checkOwnership(any(), eq(callerId));

        CreatePositionRequest request = new CreatePositionRequest();
        request.setTitle("Some Role");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> positionService.createPosition(sideHustleId, request, callerId));
        assertEquals(403, ex.getStatusCode().value());
    }

    /**
     * State pattern: OPEN → FILLED is a valid transition;
     * {@code hasOpenPositions} is recalculated after the transition.
     */
    @Test
    void updatePositionStatus_openToFilled_transitionsViaStatePattern() {
        UUID positionId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        sideHustle.setHasOpenPositions(true);

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setStatus(PositionStatus.OPEN);

        when(positionRepository.findById(positionId)).thenReturn(Optional.of(position));
        when(positionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(positionRepository.existsBySideHustle_IdAndStatus(any(), eq(PositionStatus.OPEN)))
                .thenReturn(false);
        when(sideHustleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PositionResponse response = positionService.updatePositionStatus(positionId, PositionStatus.FILLED, callerId);

        assertEquals(PositionStatus.FILLED, response.getStatus());
        assertFalse(sideHustle.isHasOpenPositions());
    }

    /**
     * State pattern: FILLED is a terminal state - transitioning to FILLED again
     * must
     * throw {@link IllegalStateException} per {@code FilledState}.
     */
    @Test
    void updatePositionStatus_filledToFilled_throwsIllegalState() {
        UUID positionId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setStatus(PositionStatus.FILLED);

        when(positionRepository.findById(positionId)).thenReturn(Optional.of(position));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> positionService.updatePositionStatus(positionId, PositionStatus.FILLED, callerId));
        assertNotNull(ex.getMessage());
    }

    /**
     * State pattern: OPEN is never a valid target - {@code PositionStateContext}
     * must
     * throw {@link IllegalArgumentException} for unsupported target states.
     */
    @Test
    void updatePositionStatus_targetIsOpen_throwsIllegalArgument() {
        UUID positionId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setStatus(PositionStatus.OPEN);

        when(positionRepository.findById(positionId)).thenReturn(Optional.of(position));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> positionService.updatePositionStatus(positionId, PositionStatus.OPEN, callerId));
        assertNotNull(ex.getMessage());
    }

    @Test
    void updatePositionStatus_callerNotOwner_returns403() {
        UUID positionId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setStatus(PositionStatus.OPEN);

        when(positionRepository.findById(positionId)).thenReturn(Optional.of(position));
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this SideHustle"))
                .when(sideHustleService).checkOwnership(any(), eq(callerId));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> positionService.updatePositionStatus(positionId, PositionStatus.FILLED, callerId));
        assertEquals(403, ex.getStatusCode().value());
    }
}
