package com.hatchloom.launchpad.controller;

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
import org.springframework.security.oauth2.jwt.Jwt;

import com.hatchloom.launchpad.dto.request.EditBMCRequest;
import com.hatchloom.launchpad.dto.response.BMCResponse;
import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.service.BMCService;

/**
 * Controller-layer unit tests for {@link BMCController}.
 *
 * <p>
 * Verifies that the controller extracts the caller UUID from the JWT subject
 * and delegates to {@link BMCService} with the correct arguments.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class BMCControllerTest {

    @Mock
    private BMCService bmcService;

    @InjectMocks
    private BMCController controller;

    @Test
    void getBMC_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        when(bmcService.getBMC(sideHustleId)).thenReturn(buildBmcResponse(sideHustleId));

        ResponseEntity<BMCResponse> response = controller.getBMC(sideHustleId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(bmcService).getBMC(sideHustleId);
    }

    @Test
    void editSection_extractsCallerIdFromJwtAndDelegates() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        when(bmcService.editSection(eq(sideHustleId), eq("key_partners"), eq("our partners"), eq(callerId)))
                .thenReturn(buildBmcResponse(sideHustleId));

        EditBMCRequest request = new EditBMCRequest();
        request.setSection("key_partners");
        request.setContent("our partners");

        ResponseEntity<BMCResponse> response = controller.editSection(sideHustleId, request, jwt);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Verify callerId from JWT subject was passed to the service
        verify(bmcService).editSection(sideHustleId, "key_partners", "our partners", callerId);
    }

    @Test
    void editSection_wrongOwner_propagates403() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        when(bmcService.editSection(any(), any(), any(), eq(callerId)))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN, "You do not own this SideHustle"));

        EditBMCRequest request = new EditBMCRequest();
        request.setSection("channels");
        request.setContent("direct sales");

        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> controller.editSection(sideHustleId, request, jwt));
    }

    // ---- helpers ----

    private Jwt buildJwt(UUID subject) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject.toString())
                .build();
    }

    private BMCResponse buildBmcResponse(UUID sideHustleId) {
        SideHustle sh = new SideHustle();
        sh.setStudentId(UUID.randomUUID());
        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(sh);
        return BMCResponse.from(bmc);
    }
}
