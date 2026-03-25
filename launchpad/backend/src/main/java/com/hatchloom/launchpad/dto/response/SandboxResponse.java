package com.hatchloom.launchpad.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hatchloom.launchpad.model.Sandbox;

/** Response body representing a Sandbox. */
public class SandboxResponse {

    private UUID id;
    private UUID studentId;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Maps a {@link Sandbox} entity to a {@link SandboxResponse}.
     *
     * @param sandbox the entity to map
     * @return the response DTO
     */
    public static SandboxResponse from(Sandbox sandbox) {
        SandboxResponse r = new SandboxResponse();
        r.id = sandbox.getId();
        r.studentId = sandbox.getStudentId();
        r.title = sandbox.getTitle();
        r.description = sandbox.getDescription();
        r.createdAt = sandbox.getCreatedAt();
        r.updatedAt = sandbox.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
