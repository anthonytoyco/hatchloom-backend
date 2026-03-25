package com.hatchloom.launchpad.service;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSideHustleRequest;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.factory.SideHustleFactoryProvider;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;
import com.hatchloom.launchpad.repository.BusinessModelCanvasRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;
import com.hatchloom.launchpad.repository.TeamRepository;

/**
 * TC-Q2-001 - Create SideHustle (Factory Method)
 *
 * <p>
 * Requirements Coverage: HL-SideHustle-Created-Success
 * </p>
 *
 * <p>
 * Verifies that
 * {@link SideHustleService#createSideHustle(CreateSideHustleRequest)} uses
 * the Factory Method pattern to select the correct factory based on the
 * {@code type} field,
 * initialises the domain fields correctly, and auto-creates an empty BMC and
 * Team.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class SideHustleServiceTest {

    @Mock
    private SideHustleRepository sideHustleRepository;
    @Mock
    private BusinessModelCanvasRepository bmcRepository;
    @Mock
    private TeamRepository teamRepository;
    @Spy
    private SideHustleFactoryProvider factoryProvider;
    @Mock
    private SandboxService sandboxService;

    @InjectMocks
    private SideHustleService sideHustleService;

    /**
     * TC-Q2-001 main path: creates an IN_THE_LAB SideHustle, asserts the Factory
     * Method
     * selects {@code InTheLabSideHustleFactory}, and verifies BMC + Team
     * auto-creation.
     */
    @Test
    void createSideHustle_inTheLab_usesFactoryAndSetsCorrectDomainFields() {
        UUID studentId = UUID.randomUUID();
        UUID sandboxId = UUID.randomUUID();

        Sandbox sandbox = new Sandbox();
        when(sandboxService.findOrThrow(sandboxId)).thenReturn(sandbox);
        when(sideHustleRepository.save(any(SideHustle.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bmcRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(teamRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateSideHustleRequest request = new CreateSideHustleRequest();
        request.setStudentId(studentId);
        request.setSandboxId(sandboxId);
        request.setTitle("My Hustle");
        request.setDescription("Building something cool");
        request.setType(SideHustleStatus.IN_THE_LAB);

        SideHustleResponse response = sideHustleService.createSideHustle(request);

        assertNotNull(response);
        assertEquals(SideHustleStatus.IN_THE_LAB, response.getStatus());
        assertFalse(response.isHasOpenPositions());
        assertEquals("My Hustle", response.getTitle());

        // BMC and Team must be auto-created exactly once each
        verify(bmcRepository, times(1)).save(any());
        verify(teamRepository, times(1)).save(any());
    }

    /**
     * Factory Method must select {@code LiveVentureSideHustleFactory} when type is
     * LIVE_VENTURE.
     */
    @Test
    void createSideHustle_liveVenture_setsLiveVentureStatus() {
        UUID sandboxId = UUID.randomUUID();
        Sandbox sandbox = new Sandbox();
        when(sandboxService.findOrThrow(sandboxId)).thenReturn(sandbox);
        when(sideHustleRepository.save(any(SideHustle.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bmcRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(teamRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateSideHustleRequest request = new CreateSideHustleRequest();
        request.setStudentId(UUID.randomUUID());
        request.setSandboxId(sandboxId);
        request.setTitle("Live Venture");
        request.setType(SideHustleStatus.LIVE_VENTURE);

        SideHustleResponse response = sideHustleService.createSideHustle(request);

        assertEquals(SideHustleStatus.LIVE_VENTURE, response.getStatus());
        assertFalse(response.isHasOpenPositions());
    }

    /**
     * Creation must fail with 400 Bad Request when no Sandbox ID is provided.
     * TC-Q2-001 Notes: "creation must fail with 400 if no valid Sandbox ID is
     * provided."
     */
    @Test
    void createSideHustle_missingSandboxId_returns400() {
        CreateSideHustleRequest request = new CreateSideHustleRequest();
        request.setStudentId(UUID.randomUUID());
        request.setTitle("No Sandbox");
        request.setType(SideHustleStatus.IN_THE_LAB);
        // sandboxId intentionally null

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> sideHustleService.createSideHustle(request));
        assertEquals(400, ex.getStatusCode().value());
    }
}
