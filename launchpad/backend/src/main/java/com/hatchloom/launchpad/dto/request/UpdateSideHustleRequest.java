package com.hatchloom.launchpad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for updating a SideHustle's metadata (title and description
 * only).
 */
public class UpdateSideHustleRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

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
}
