package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

import com.hatchloom.launchpad.dto.request.CreatePositionRequest;
import com.hatchloom.launchpad.dto.request.UpdatePositionStatusRequest;
import com.hatchloom.launchpad.dto.response.PositionResponse;
import com.hatchloom.launchpad.model.Position;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.PositionStatus;
import com.hatchloom.launchpad.service.PositionService;

/**
 * Controller-layer unit tests for {@link PositionController}.
 *
 * <p>
 * Covers both the protected SideHustle-scoped endpoints and the
 * public Position Status Interface
 * ({@code GET /launchpad/positions/{id}/status})
 * consumed by ConnectHub.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class PositionControllerTest {

    @Mock
    private PositionService positionService;

    @InjectMocks
    private PositionController controller;

    @Test
    void createPosition_extractsCallerIdFromJwtAndDelegates() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        PositionResponse expected = buildPositionResponse(PositionStatus.OPEN);
        when(positionService.createPosition(eq(sideHustleId), any(), eq(callerId)))
                .thenReturn(expected);

        CreatePositionRequest request = new CreatePositionRequest();
        request.setTitle("Backend Developer");

        ResponseEntity<PositionResponse> response = controller.createPosition(sideHustleId, request, jwt);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(PositionStatus.OPEN, response.getBody().getStatus());
        // Verify callerId derived from JWT subject was passed correctly
        verify(positionService).createPosition(sideHustleId, request, callerId);
    }

    @Test
    void listPositions_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        when(positionService.listPositions(sideHustleId)).thenReturn(List.of());

        ResponseEntity<List<PositionResponse>> response = controller.listPositions(sideHustleId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(positionService).listPositions(sideHustleId);
    }

    @Test
    void updatePositionStatus_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        UUID positionId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);
        PositionResponse expected = buildPositionResponse(PositionStatus.FILLED);
        when(positionService.updatePositionStatus(eq(positionId), eq(PositionStatus.FILLED), eq(callerId)))
                .thenReturn(expected);

        UpdatePositionStatusRequest request = new UpdatePositionStatusRequest();
        request.setStatus(PositionStatus.FILLED);

        ResponseEntity<PositionResponse> response = controller.updatePositionStatus(sideHustleId, positionId, request,
                jwt);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(PositionStatus.FILLED, response.getBody().getStatus());
    }

    /**
     * Position Status Interface - public endpoint consumed by ConnectHub.
     * Verifies the controller returns the raw status string.
     */
    @Test
    void getPositionStatus_returnsStatusString() {
        UUID positionId = UUID.randomUUID();
        when(positionService.getPositionStatus(positionId)).thenReturn("OPEN");

        ResponseEntity<String> response = controller.getPositionStatus(positionId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("OPEN", response.getBody());
        verify(positionService).getPositionStatus(positionId);
    }

    @Test
    void createPosition_callerNotOwner_propagates403() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        when(positionService.createPosition(any(), any(), eq(callerId)))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN,
                        "You do not own this SideHustle"));

        CreatePositionRequest request = new CreatePositionRequest();
        request.setTitle("Role");

        org.springframework.web.server.ResponseStatusException ex = assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> controller.createPosition(sideHustleId, request, jwt));
        assertEquals(HttpStatus.FORBIDDEN.value(), ex.getStatusCode().value());
    }

    // ---- helpers ----

    private Jwt buildJwt(UUID subject) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject.toString())
                .build();
    }

    private PositionResponse buildPositionResponse(PositionStatus status) {
        SideHustle sh = new SideHustle();
        sh.setStudentId(UUID.randomUUID());
        sh.setTitle("Parent Hustle");

        Position position = new Position();
        position.setSideHustle(sh);
        position.setTitle("Test Position");
        position.setStatus(status);
        return PositionResponse.from(position);
    }
}
