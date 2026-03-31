package com.hatchloom.launchpad.aggregator.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hatchloom.launchpad.dto.response.SandboxResponse;

/**
 * Lightweight summary of a {@link SandboxResponse} used in the LaunchPad home
 * view.
 */
public class SandboxSummary {

    private UUID id;
    private String title;
    private String description;
    private LocalDateTime createdAt;

    /**
     * Maps a {@link SandboxResponse} to a {@link SandboxSummary}.
     *
     * @param sandbox the response DTO to map
     * @return the summary DTO
     */
    public static SandboxSummary from(SandboxResponse sandbox) {
        SandboxSummary s = new SandboxSummary();
        s.id = sandbox.getId();
        s.title = sandbox.getTitle();
        s.description = sandbox.getDescription();
        s.createdAt = sandbox.getCreatedAt();
        return s;
    }

    public UUID getId() {
        return id;
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
}
