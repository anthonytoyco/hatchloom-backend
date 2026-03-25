package com.hatchloom.launchpad.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/** Response body representing a SideHustle. */
public class SideHustleResponse {

    private UUID id;
    private UUID studentId;
    private UUID sandboxId;
    private String title;
    private String description;
    private SideHustleStatus status;
    private boolean hasOpenPositions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Maps a {@link SideHustle} entity to a {@link SideHustleResponse}.
     *
     * @param sh the entity to map
     * @return the response DTO
     */
    public static SideHustleResponse from(SideHustle sh) {
        SideHustleResponse r = new SideHustleResponse();
        r.id = sh.getId();
        r.studentId = sh.getStudentId();
        r.sandboxId = sh.getSandbox() != null ? sh.getSandbox().getId() : null;
        r.title = sh.getTitle();
        r.description = sh.getDescription();
        r.status = sh.getStatus();
        r.hasOpenPositions = sh.isHasOpenPositions();
        r.createdAt = sh.getCreatedAt();
        r.updatedAt = sh.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public UUID getSandboxId() {
        return sandboxId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public SideHustleStatus getStatus() {
        return status;
    }

    public boolean isHasOpenPositions() {
        return hasOpenPositions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
