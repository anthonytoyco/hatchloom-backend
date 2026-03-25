package com.hatchloom.launchpad.dto.request;

import java.util.UUID;

import com.hatchloom.launchpad.model.enums.SideHustleStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating a new SideHustle.
 *
 * <p>
 * {@code type} determines which factory is used: {@code IN_THE_LAB} or
 * {@code LIVE_VENTURE}. {@code sandboxId} is required - creation fails with
 * 400 if no valid Sandbox ID is provided (per TC-Q2-001 notes).
 * </p>
 */
public class CreateSideHustleRequest {

    @NotNull
    private UUID studentId;

    @NotNull
    private UUID sandboxId;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull
    private SideHustleStatus type;

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public UUID getSandboxId() {
        return sandboxId;
    }

    public void setSandboxId(UUID sandboxId) {
        this.sandboxId = sandboxId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SideHustleStatus getType() {
        return type;
    }

    public void setType(SideHustleStatus type) {
        this.type = type;
    }
}
