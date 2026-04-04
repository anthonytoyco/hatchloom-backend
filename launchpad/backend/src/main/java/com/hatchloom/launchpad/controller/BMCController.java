package com.hatchloom.launchpad.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.launchpad.dto.request.EditBMCRequest;
import com.hatchloom.launchpad.dto.response.BMCResponse;
import com.hatchloom.launchpad.service.BMCService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller for Business Model Canvas operations.
 *
 * <p>
 * PATCH validates that the caller owns the parent SideHustle via the JWT
 * subject.
 * </p>
 */
@RestController
@RequestMapping("/sidehustles/{sideHustleId}/bmc")
@Tag(name = "Business Model Canvas")
public class BMCController {

    private final BMCService bmcService;

    public BMCController(BMCService bmcService) {
        this.bmcService = bmcService;
    }

    @GetMapping
    public ResponseEntity<BMCResponse> getBMC(@PathVariable UUID sideHustleId) {
        return ResponseEntity.ok(bmcService.getBMC(sideHustleId));
    }

    @PatchMapping
    public ResponseEntity<BMCResponse> editSection(@PathVariable UUID sideHustleId,
            @Valid @RequestBody EditBMCRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID callerId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(bmcService.editSection(sideHustleId, request.getSection(),
                request.getContent(), callerId));
    }
}
