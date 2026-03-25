package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.hatchloom.launchpad.dto.request.CreateSandboxToolRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxToolRequest;
import com.hatchloom.launchpad.dto.response.SandboxToolResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SandboxTool;
import com.hatchloom.launchpad.service.SandboxToolService;

/**
 * Controller-layer unit tests for {@link SandboxToolController}.
 */
@ExtendWith(MockitoExtension.class)
class SandboxToolControllerTest {

    @Mock
    private SandboxToolService sandboxToolService;

    @InjectMocks
    private SandboxToolController controller;

    @Test
    void addTool_delegatesToService_returns201() {
        UUID sandboxId = UUID.randomUUID();
        SandboxTool tool = buildTool(sandboxId, "NOTE", "some data");
        when(sandboxToolService.addTool(eq(sandboxId), any()))
                .thenReturn(SandboxToolResponse.from(tool));

        CreateSandboxToolRequest request = new CreateSandboxToolRequest();
        request.setToolType("NOTE");
        request.setData("some data");

        ResponseEntity<SandboxToolResponse> response = controller.addTool(sandboxId, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(sandboxToolService).addTool(sandboxId, request);
    }

    @Test
    void listTools_delegatesToService_returns200() {
        UUID sandboxId = UUID.randomUUID();
        when(sandboxToolService.listTools(sandboxId)).thenReturn(List.of());

        ResponseEntity<List<SandboxToolResponse>> response = controller.listTools(sandboxId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(sandboxToolService).listTools(sandboxId);
    }

    @Test
    void updateTool_delegatesToService_returns200() {
        UUID sandboxId = UUID.randomUUID();
        UUID toolId = UUID.randomUUID();
        SandboxTool tool = buildTool(sandboxId, "LINK", "http://example.com");
        when(sandboxToolService.updateTool(eq(sandboxId), eq(toolId), any()))
                .thenReturn(SandboxToolResponse.from(tool));

        UpdateSandboxToolRequest request = new UpdateSandboxToolRequest();
        request.setData("http://example.com");

        ResponseEntity<SandboxToolResponse> response = controller.updateTool(sandboxId, toolId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void removeTool_delegatesToService_returns204() {
        UUID sandboxId = UUID.randomUUID();
        UUID toolId = UUID.randomUUID();

        ResponseEntity<Void> response = controller.removeTool(sandboxId, toolId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(sandboxToolService).removeTool(sandboxId, toolId);
    }

    // ---- helper ----

    private SandboxTool buildTool(UUID sandboxId, String toolType, String data) {
        Sandbox sandbox = new Sandbox();
        sandbox.setStudentId(UUID.randomUUID());
        sandbox.setTitle("Parent Sandbox");

        SandboxTool tool = new SandboxTool();
        tool.setSandbox(sandbox);
        tool.setToolType(toolType);
        tool.setData(data);
        return tool;
    }
}
