package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSandboxToolRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxToolRequest;
import com.hatchloom.launchpad.dto.response.SandboxToolResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SandboxTool;
import com.hatchloom.launchpad.repository.SandboxToolRepository;

/**
 * Service for SandboxTool CRUD operations.
 */
@Service
public class SandboxToolService {

    private final SandboxToolRepository sandboxToolRepository;
    private final SandboxService sandboxService;

    public SandboxToolService(SandboxToolRepository sandboxToolRepository,
            SandboxService sandboxService) {
        this.sandboxToolRepository = sandboxToolRepository;
        this.sandboxService = sandboxService;
    }

    /**
     * Adds a tool to a sandbox.
     *
     * @param sandboxId the sandbox UUID
     * @param request   the tool creation request
     * @return the created {@link SandboxToolResponse}
     */
    @Transactional
    public SandboxToolResponse addTool(UUID sandboxId, CreateSandboxToolRequest request) {
        Sandbox sandbox = sandboxService.findOrThrow(sandboxId);
        SandboxTool tool = new SandboxTool();
        tool.setSandbox(sandbox);
        tool.setToolType(request.getToolType());
        tool.setData(request.getData());
        return SandboxToolResponse.from(sandboxToolRepository.save(tool));
    }

    /**
     * Lists all tools in a sandbox.
     *
     * @param sandboxId the sandbox UUID
     * @return list of {@link SandboxToolResponse}
     */
    @Transactional(readOnly = true)
    public List<SandboxToolResponse> listTools(UUID sandboxId) {
        sandboxService.findOrThrow(sandboxId);
        return sandboxToolRepository.findAllBySandbox_Id(sandboxId)
                .stream()
                .map(SandboxToolResponse::from)
                .toList();
    }

    /**
     * Updates a tool's data payload. Validates the tool belongs to the sandbox.
     *
     * @param sandboxId the sandbox UUID
     * @param toolId    the tool UUID
     * @param request   the update request
     * @return the updated {@link SandboxToolResponse}
     */
    @Transactional
    public SandboxToolResponse updateTool(UUID sandboxId, UUID toolId,
            UpdateSandboxToolRequest request) {
        SandboxTool tool = findToolInSandbox(sandboxId, toolId);
        tool.setData(request.getData());
        return SandboxToolResponse.from(sandboxToolRepository.save(tool));
    }

    /**
     * Removes a tool from a sandbox. Validates the tool belongs to the sandbox.
     *
     * @param sandboxId the sandbox UUID
     * @param toolId    the tool UUID
     */
    @Transactional
    public void removeTool(UUID sandboxId, UUID toolId) {
        SandboxTool tool = findToolInSandbox(sandboxId, toolId);
        sandboxToolRepository.delete(tool);
    }

    private SandboxTool findToolInSandbox(UUID sandboxId, UUID toolId) {
        SandboxTool tool = sandboxToolRepository.findById(toolId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tool not found: " + toolId));
        if (!tool.getSandbox().getId().equals(sandboxId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Tool " + toolId + " does not belong to sandbox " + sandboxId);
        }
        return tool;
    }
}
