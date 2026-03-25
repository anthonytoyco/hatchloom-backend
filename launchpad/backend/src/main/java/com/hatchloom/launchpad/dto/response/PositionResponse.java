package com.hatchloom.launchpad.dto.response;

import java.util.UUID;

import com.hatchloom.launchpad.model.Position;
import com.hatchloom.launchpad.model.enums.PositionStatus;

/** Response body representing a Position. */
public class PositionResponse {

    private UUID id;
    private UUID sideHustleId;
    private String title;
    private String description;
    private PositionStatus status;

    /**
     * Maps a {@link Position} entity to a {@link PositionResponse}.
     *
     * @param position the entity to map
     * @return the response DTO
     */
    public static PositionResponse from(Position position) {
        PositionResponse r = new PositionResponse();
        r.id = position.getId();
        r.sideHustleId = position.getSideHustle().getId();
        r.title = position.getTitle();
        r.description = position.getDescription();
        r.status = position.getStatus();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSideHustleId() {
        return sideHustleId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public PositionStatus getStatus() {
        return status;
    }
}
