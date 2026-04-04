package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.launchpad.dto.request.CreateSideHustleRequest;
import com.hatchloom.launchpad.dto.request.UpdateSideHustleRequest;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.service.SideHustleService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller for SideHustle CRUD operations.
 */
@RestController
@RequestMapping("/sidehustles")
@Tag(name = "SideHustle")
public class SideHustleController {

    private final SideHustleService sideHustleService;

    public SideHustleController(SideHustleService sideHustleService) {
        this.sideHustleService = sideHustleService;
    }

    @PostMapping
    public ResponseEntity<SideHustleResponse> createSideHustle(@Valid @RequestBody CreateSideHustleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sideHustleService.createSideHustle(request));
    }

    @GetMapping("/{sideHustleId}")
    public ResponseEntity<SideHustleResponse> getSideHustle(@PathVariable UUID sideHustleId) {
        return ResponseEntity.ok(sideHustleService.getSideHustle(sideHustleId));
    }

    @PutMapping("/{sideHustleId}")
    public ResponseEntity<SideHustleResponse> updateSideHustle(@PathVariable UUID sideHustleId,
            @Valid @RequestBody UpdateSideHustleRequest request) {
        return ResponseEntity.ok(sideHustleService.updateSideHustle(sideHustleId, request));
    }

    @DeleteMapping("/{sideHustleId}")
    public ResponseEntity<Void> deleteSideHustle(@PathVariable UUID sideHustleId) {
        sideHustleService.deleteSideHustle(sideHustleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SideHustleResponse>> listSideHustles(@RequestParam UUID studentId) {
        return ResponseEntity.ok(sideHustleService.listByStudent(studentId));
    }
}
