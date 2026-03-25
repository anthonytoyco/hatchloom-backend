package com.hatchloom.launchpad.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request body for adding a tool to a Sandbox. */
public class CreateSandboxToolRequest {

    @NotBlank
    @Size(max = 100)
    private String toolType;

    private String data;

    public String getToolType() {
        return toolType;
    }

    public void setToolType(String toolType) {
        this.toolType = toolType;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
