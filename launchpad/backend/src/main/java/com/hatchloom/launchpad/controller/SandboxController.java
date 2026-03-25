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

import com.hatchloom.launchpad.dto.request.CreateSandboxRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxRequest;
import com.hatchloom.launchpad.dto.response.SandboxResponse;
import com.hatchloom.launchpad.service.SandboxService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller for Sandbox CRUD operations.
 */
@RestController
@RequestMapping("/launchpad/sandboxes")
@Tag(name = "Sandbox")
public class SandboxController {

    private final SandboxService sandboxService;

    public SandboxController(SandboxService sandboxService) {
        this.sandboxService = sandboxService;
    }

    @PostMapping
    public ResponseEntity<SandboxResponse> createSandbox(@Valid @RequestBody CreateSandboxRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sandboxService.createSandbox(request));
    }

    @GetMapping("/{sandboxId}")
    public ResponseEntity<SandboxResponse> getSandbox(@PathVariable UUID sandboxId) {
        return ResponseEntity.ok(sandboxService.getSandbox(sandboxId));
    }

    @PutMapping("/{sandboxId}")
    public ResponseEntity<SandboxResponse> updateSandbox(@PathVariable UUID sandboxId,
            @Valid @RequestBody UpdateSandboxRequest request) {
        return ResponseEntity.ok(sandboxService.updateSandbox(sandboxId, request));
    }

    @DeleteMapping("/{sandboxId}")
    public ResponseEntity<Void> deleteSandbox(@PathVariable UUID sandboxId) {
        sandboxService.deleteSandbox(sandboxId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SandboxResponse>> listSandboxes(@RequestParam UUID studentId) {
        return ResponseEntity.ok(sandboxService.listByStudent(studentId));
    }
}
