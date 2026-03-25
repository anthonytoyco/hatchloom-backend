package com.hatchloom.launchpad.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/** Request body for adding a member to a SideHustle team. */
public class AddTeamMemberRequest {

    @NotNull
    private UUID userId;

    private String role;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
