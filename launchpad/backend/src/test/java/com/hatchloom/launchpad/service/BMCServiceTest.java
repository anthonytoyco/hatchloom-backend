package com.hatchloom.launchpad.service;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.response.BMCResponse;
import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.repository.BusinessModelCanvasRepository;

/**
 * TC-Q2-002 - Update BMC Section
 *
 * <p>
 * Requirements Coverage: HL-BMC-Update-Success
 * </p>
 *
 * <p>
 * Verifies that {@link BMCService#editSection} updates only the requested BMC
 * section,
 * leaves all other sections unchanged, rejects unknown section keys with 400,
 * and
 * enforces ownership with 403.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class BMCServiceTest {

    @Mock
    private BusinessModelCanvasRepository bmcRepository;
    @Mock
    private SideHustleService sideHustleService;

    @InjectMocks
    private BMCService bmcService;

    /**
     * TC-Q2-002 main path: editing "value_propositions" updates only that field.
     */
    @Test
    void editSection_valuePropositions_updatesOnlyThatSection() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);

        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(sideHustle);
        bmc.setKeyPartners("existing partners content");
        when(bmcRepository.findBySideHustle_Id(sideHustleId)).thenReturn(Optional.of(bmc));
        when(bmcRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BMCResponse response = bmcService.editSection(
                sideHustleId, "value_propositions", "unique differentiation", callerId);

        assertEquals("unique differentiation", response.getValuePropositions());
        // Other sections must remain unchanged
        assertNull(response.getKeyActivities());
        assertNull(response.getKeyResources());
        assertNull(response.getChannels());
    }

    /**
     * All nine section keys must be accepted (smoke test a few).
     */
    @Test
    void editSection_allValidKeys_doNotThrow() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);

        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(sideHustle);
        when(bmcRepository.findBySideHustle_Id(sideHustleId)).thenReturn(Optional.of(bmc));
        when(bmcRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String[] validKeys = {
                "key_partners", "key_activities", "key_resources",
                "value_propositions", "customer_relationships", "channels",
                "customer_segments", "cost_structure", "revenue_streams"
        };
        for (String key : validKeys) {
            assertDoesNotThrow(() -> bmcService.editSection(sideHustleId, key, "content", callerId),
                    "Expected no exception for section key: " + key);
        }
    }

    /**
     * TC-Q2-002 Notes: "Unknown section keys must return 400 Bad Request."
     */
    @Test
    void editSection_unknownSectionKey_returns400() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(callerId);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> bmcService.editSection(sideHustleId, "not_a_real_section", "value", callerId));
        assertEquals(400, ex.getStatusCode().value());
    }

    /**
     * Editing a BMC section belonging to another student must return 403.
     */
    @Test
    void editSection_callerNotOwner_returns403() {
        UUID sideHustleId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);
        when(sideHustleService.findOrThrow(sideHustleId)).thenReturn(sideHustle);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> bmcService.editSection(sideHustleId, "key_partners", "value", callerId));
        assertEquals(403, ex.getStatusCode().value());
    }
}
