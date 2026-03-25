package com.hatchloom.launchpad.aggregator.dto;

import java.util.UUID;

import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/**
 * Lightweight summary of a {@link SideHustleResponse} used in the LaunchPad
 * home view.
 * Includes the {@code hasOpenPositions} flag so the UI can show a badge.
 */
public class SideHustleSummary {

    private UUID id;
    private String title;
    private SideHustleStatus status;
    private boolean hasOpenPositions;

    /**
     * Maps a {@link SideHustleResponse} to a {@link SideHustleSummary}.
     *
     * @param sh the response DTO to map
     * @return the summary DTO
     */
    public static SideHustleSummary from(SideHustleResponse sh) {
        SideHustleSummary s = new SideHustleSummary();
        s.id = sh.getId();
        s.title = sh.getTitle();
        s.status = sh.getStatus();
        s.hasOpenPositions = sh.isHasOpenPositions();
        return s;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public SideHustleStatus getStatus() {
        return status;
    }

    public boolean isHasOpenPositions() {
        return hasOpenPositions;
    }
}
