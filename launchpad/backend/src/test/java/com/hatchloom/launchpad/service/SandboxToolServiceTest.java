package com.hatchloom.launchpad.service;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSandboxToolRequest;
import com.hatchloom.launchpad.dto.response.SandboxToolResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SandboxTool;
import com.hatchloom.launchpad.repository.SandboxToolRepository;

@ExtendWith(MockitoExtension.class)
class SandboxToolServiceTest {

    @Mock
    private SandboxToolRepository sandboxToolRepository;

    @Mock
    private SandboxService sandboxService;

    @InjectMocks
    private SandboxToolService sandboxToolService;

    @Test
    void addTool_withUniqueType_savesTool() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();
        CreateSandboxToolRequest request = new CreateSandboxToolRequest();
        request.setToolType("postit");
        request.setData("{}{}");

        when(sandboxService.findOrThrow(sandboxId)).thenReturn(sandbox);
        when(sandboxToolRepository.existsBySandbox_IdAndToolType(sandboxId, "POSTIT"))
                .thenReturn(false);
        when(sandboxToolRepository.save(any(SandboxTool.class))).thenAnswer(inv -> inv.getArgument(0));

        SandboxToolResponse response = sandboxToolService.addTool(sandboxId, request);

        assertEquals("POSTIT", response.getToolType());
        assertEquals("{}{}", response.getData());
        verify(sandboxToolRepository).save(any(SandboxTool.class));
    }

    @Test
    void addTool_withDuplicateType_throws409() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();
        CreateSandboxToolRequest request = new CreateSandboxToolRequest();
        request.setToolType("GUIDED_QA");

        when(sandboxService.findOrThrow(sandboxId)).thenReturn(sandbox);
        when(sandboxToolRepository.existsBySandbox_IdAndToolType(sandboxId, "GUIDED_QA"))
                .thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> sandboxToolService.addTool(sandboxId, request));

        assertEquals(409, ex.getStatusCode().value());
        assertEquals("You can only have one Guided Q&A in your sandbox", ex.getReason());
        verify(sandboxToolRepository, never()).save(any(SandboxTool.class));
    }
}