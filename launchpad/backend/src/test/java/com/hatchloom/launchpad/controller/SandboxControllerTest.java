package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSandboxRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxRequest;
import com.hatchloom.launchpad.dto.response.SandboxResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.service.SandboxService;

/**
 * Controller-layer unit tests for {@link SandboxController}.
 *
 * <p>
 * Tests invoke controller methods directly to verify HTTP status codes and
 * service delegation without requiring a running Spring context.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class SandboxControllerTest {

    @Mock
    private SandboxService sandboxService;

    @InjectMocks
    private SandboxController controller;

    @Test
    void createSandbox_delegatesToService_returns201() {
        Sandbox sandbox = new Sandbox();
        sandbox.setTitle("My Sandbox");
        sandbox.setStudentId(UUID.randomUUID());
        SandboxResponse expected = SandboxResponse.from(sandbox);
        when(sandboxService.createSandbox(any())).thenReturn(expected);

        CreateSandboxRequest request = new CreateSandboxRequest();
        request.setStudentId(UUID.randomUUID());
        request.setTitle("My Sandbox");

        ResponseEntity<SandboxResponse> response = controller.createSandbox(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(sandboxService).createSandbox(request);
    }

    @Test
    void getSandbox_delegatesToService_returns200() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();
        sandbox.setTitle("Existing Sandbox");
        when(sandboxService.getSandbox(sandboxId)).thenReturn(SandboxResponse.from(sandbox));

        ResponseEntity<SandboxResponse> response = controller.getSandbox(sandboxId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getSandbox_notFound_propagates404() {
        UUID sandboxId = UUID.randomUUID();
        when(sandboxService.getSandbox(sandboxId))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND,
                        "Sandbox not found"));

        assertThrows(ResponseStatusException.class, () -> controller.getSandbox(sandboxId));
    }

    @Test
    void updateSandbox_delegatesToService_returns200() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();
        sandbox.setTitle("Updated Title");
        when(sandboxService.updateSandbox(eq(sandboxId), any()))
                .thenReturn(SandboxResponse.from(sandbox));

        UpdateSandboxRequest request = new UpdateSandboxRequest();
        request.setTitle("Updated Title");

        ResponseEntity<SandboxResponse> response = controller.updateSandbox(sandboxId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteSandbox_delegatesToService_returns204() {
        UUID sandboxId = UUID.randomUUID();

        ResponseEntity<Void> response = controller.deleteSandbox(sandboxId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(sandboxService).deleteSandbox(sandboxId);
    }

    @Test
    void listSandboxes_delegatesToService_returns200() {
        UUID studentId = UUID.randomUUID();
        when(sandboxService.listByStudent(studentId)).thenReturn(List.of());

        ResponseEntity<List<SandboxResponse>> response = controller.listSandboxes(studentId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(sandboxService).listByStudent(studentId);
    }
}
