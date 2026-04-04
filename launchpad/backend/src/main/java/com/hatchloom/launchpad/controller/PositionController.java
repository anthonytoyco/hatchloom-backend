package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.launchpad.dto.request.CreatePositionRequest;
import com.hatchloom.launchpad.dto.request.UpdatePositionStatusRequest;
import com.hatchloom.launchpad.dto.response.PositionResponse;
import com.hatchloom.launchpad.service.PositionService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller for Position lifecycle operations.
 *
 * <p>
 * Also exposes the public Position Status Interface consumed by ConnectHub:
 * {@code GET /positions/{positionId}/status}.
 * </p>
 */
@RestController
@Tag(name = "Position")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @PostMapping("/sidehustles/{sideHustleId}/positions")
    public ResponseEntity<PositionResponse> createPosition(@PathVariable UUID sideHustleId,
            @Valid @RequestBody CreatePositionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID callerId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(positionService.createPosition(sideHustleId, request, callerId));
    }

    @GetMapping("/sidehustles/{sideHustleId}/positions")
    public ResponseEntity<List<PositionResponse>> listPositions(@PathVariable UUID sideHustleId) {
        return ResponseEntity.ok(positionService.listPositions(sideHustleId));
    }

    @PutMapping("/sidehustles/{sideHustleId}/positions/{positionId}/status")
    public ResponseEntity<PositionResponse> updatePositionStatus(@PathVariable UUID sideHustleId,
            @PathVariable UUID positionId,
            @Valid @RequestBody UpdatePositionStatusRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID callerId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(positionService.updatePositionStatus(positionId, request.getStatus(), callerId));
    }

    /**
     * Position Status Interface - public endpoint consumed by ConnectHub.
     * Returns the plain-text status string for a position.
     *
     * @param positionId the position UUID
     * @return status string: "OPEN", "FILLED", or "CLOSED"
     */
    @GetMapping("/positions/{positionId}/status")
    public ResponseEntity<String> getPositionStatus(@PathVariable UUID positionId) {
        return ResponseEntity.ok(positionService.getPositionStatus(positionId));
    }
}
