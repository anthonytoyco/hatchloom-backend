package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.repository.SandboxRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;

@ExtendWith(MockitoExtension.class)
class SandboxServiceTest {

    @Mock
    private SandboxRepository sandboxRepository;

    @Mock
    private SideHustleRepository sideHustleRepository;

    @InjectMocks
    private SandboxService sandboxService;

    @Test
    void deleteSandbox_withLinkedSideHustles_deletesSideHustlesThenSandbox() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();

        SideHustle first = new SideHustle();
        SideHustle second = new SideHustle();
        List<SideHustle> linked = List.of(first, second);

        when(sandboxRepository.findById(sandboxId)).thenReturn(Optional.of(sandbox));
        when(sideHustleRepository.findAllBySandbox_Id(sandboxId)).thenReturn(linked);

        sandboxService.deleteSandbox(sandboxId);

        verify(sideHustleRepository).deleteAll(linked);
        verify(sandboxRepository).delete(sandbox);
    }

    @Test
    void deleteSandbox_withNoLinkedSideHustles_deletesSandboxOnly() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();

        when(sandboxRepository.findById(sandboxId)).thenReturn(Optional.of(sandbox));
        when(sideHustleRepository.findAllBySandbox_Id(sandboxId)).thenReturn(List.of());

        sandboxService.deleteSandbox(sandboxId);

        verify(sideHustleRepository, never()).deleteAll(anyList());
        verify(sandboxRepository).delete(sandbox);
    }

    @Test
    void deleteSandbox_notFound_throws404() {
        UUID sandboxId = UUID.randomUUID();
        when(sandboxRepository.findById(sandboxId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> sandboxService.deleteSandbox(sandboxId));

        assertEquals(404, ex.getStatusCode().value());
    }
}
