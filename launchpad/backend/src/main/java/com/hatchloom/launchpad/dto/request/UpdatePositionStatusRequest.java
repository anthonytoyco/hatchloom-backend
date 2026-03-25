package com.hatchloom.launchpad.dto.request;

import com.hatchloom.launchpad.model.enums.PositionStatus;

import jakarta.validation.constraints.NotNull;

/** Request body for transitioning a Position to a new status. */
public class UpdatePositionStatusRequest {

    @NotNull
    private PositionStatus status;

    public PositionStatus getStatus() {
        return status;
    }

    public void setStatus(PositionStatus status) {
        this.status = status;
    }
}
