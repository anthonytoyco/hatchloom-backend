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
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.launchpad.dto.request.CreateSandboxToolRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxToolRequest;
import com.hatchloom.launchpad.dto.response.SandboxToolResponse;
import com.hatchloom.launchpad.service.SandboxToolService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Controller for SandboxTool CRUD operations nested under a Sandbox.
 */
@RestController
@RequestMapping("/sandboxes/{sandboxId}/tools")
@Tag(name = "Sandbox Tools")
public class SandboxToolController {

    private final SandboxToolService sandboxToolService;

    public SandboxToolController(SandboxToolService sandboxToolService) {
        this.sandboxToolService = sandboxToolService;
    }

    @PostMapping
    public ResponseEntity<SandboxToolResponse> addTool(@PathVariable UUID sandboxId,
            @Valid @RequestBody CreateSandboxToolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sandboxToolService.addTool(sandboxId, request));
    }

    @GetMapping
    public ResponseEntity<List<SandboxToolResponse>> listTools(@PathVariable UUID sandboxId) {
        return ResponseEntity.ok(sandboxToolService.listTools(sandboxId));
    }

    @PutMapping("/{toolId}")
    public ResponseEntity<SandboxToolResponse> updateTool(@PathVariable UUID sandboxId,
            @PathVariable UUID toolId,
            @RequestBody UpdateSandboxToolRequest request) {
        return ResponseEntity.ok(sandboxToolService.updateTool(sandboxId, toolId, request));
    }

    @DeleteMapping("/{toolId}")
    public ResponseEntity<Void> removeTool(@PathVariable UUID sandboxId,
            @PathVariable UUID toolId) {
        sandboxToolService.removeTool(sandboxId, toolId);
        return ResponseEntity.noContent().build();
    }
}
