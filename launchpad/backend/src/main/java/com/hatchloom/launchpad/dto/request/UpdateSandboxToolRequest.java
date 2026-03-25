package com.hatchloom.launchpad.dto.request;

/** Request body for updating a SandboxTool's data payload. */
public class UpdateSandboxToolRequest {

    private String data;

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }
}
