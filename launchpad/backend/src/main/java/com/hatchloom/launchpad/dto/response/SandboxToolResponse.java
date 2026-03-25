package com.hatchloom.launchpad.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hatchloom.launchpad.model.SandboxTool;

/** Response body representing a SandboxTool. */
public class SandboxToolResponse {

    private UUID id;
    private UUID sandboxId;
    private String toolType;
    private String data;
    private LocalDateTime createdAt;

    /**
     * Maps a {@link SandboxTool} entity to a {@link SandboxToolResponse}.
     *
     * @param tool the entity to map
     * @return the response DTO
     */
    public static SandboxToolResponse from(SandboxTool tool) {
        SandboxToolResponse r = new SandboxToolResponse();
        r.id = tool.getId();
        r.sandboxId = tool.getSandbox().getId();
        r.toolType = tool.getToolType();
        r.data = tool.getData();
        r.createdAt = tool.getCreatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSandboxId() {
        return sandboxId;
    }

    public String getToolType() {
        return toolType;
    }

    public String getData() {
        return data;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
