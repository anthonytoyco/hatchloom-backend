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

import com.hatchloom.launchpad.dto.request.CreateSideHustleRequest;
import com.hatchloom.launchpad.dto.request.UpdateSideHustleRequest;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;
import com.hatchloom.launchpad.service.SideHustleService;

/**
 * Controller-layer unit tests for {@link SideHustleController}.
 */
@ExtendWith(MockitoExtension.class)
class SideHustleControllerTest {

    @Mock
    private SideHustleService sideHustleService;

    @InjectMocks
    private SideHustleController controller;

    @Test
    void createSideHustle_delegatesToService_returns201() {
        SideHustleResponse expected = buildResponse(SideHustleStatus.IN_THE_LAB);
        when(sideHustleService.createSideHustle(any())).thenReturn(expected);

        CreateSideHustleRequest request = new CreateSideHustleRequest();
        request.setStudentId(UUID.randomUUID());
        request.setSandboxId(UUID.randomUUID());
        request.setTitle("My Hustle");
        request.setType(SideHustleStatus.IN_THE_LAB);

        ResponseEntity<SideHustleResponse> response = controller.createSideHustle(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(SideHustleStatus.IN_THE_LAB, response.getBody().getStatus());
        verify(sideHustleService).createSideHustle(request);
    }

    @Test
    void getSideHustle_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        when(sideHustleService.getSideHustle(sideHustleId)).thenReturn(buildResponse(SideHustleStatus.IN_THE_LAB));

        ResponseEntity<SideHustleResponse> response = controller.getSideHustle(sideHustleId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getSideHustle_notFound_propagates404() {
        UUID sideHustleId = UUID.randomUUID();
        when(sideHustleService.getSideHustle(sideHustleId))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Not found"));

        assertThrows(ResponseStatusException.class, () -> controller.getSideHustle(sideHustleId));
    }

    @Test
    void updateSideHustle_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        when(sideHustleService.updateSideHustle(eq(sideHustleId), any()))
                .thenReturn(buildResponse(SideHustleStatus.LIVE_VENTURE));

        UpdateSideHustleRequest request = new UpdateSideHustleRequest();
        request.setTitle("Updated Title");

        ResponseEntity<SideHustleResponse> response = controller.updateSideHustle(sideHustleId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteSideHustle_delegatesToService_returns204() {
        UUID sideHustleId = UUID.randomUUID();

        ResponseEntity<Void> response = controller.deleteSideHustle(sideHustleId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(sideHustleService).deleteSideHustle(sideHustleId);
    }

    @Test
    void listSideHustles_delegatesToService_returns200() {
        UUID studentId = UUID.randomUUID();
        when(sideHustleService.listByStudent(studentId)).thenReturn(List.of());

        ResponseEntity<List<SideHustleResponse>> response = controller.listSideHustles(studentId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(sideHustleService).listByStudent(studentId);
    }

    // ---- helper ----

    private SideHustleResponse buildResponse(SideHustleStatus status) {
        SideHustle sh = new SideHustle();
        sh.setStudentId(UUID.randomUUID());
        sh.setTitle("Test Hustle");
        sh.setStatus(status);
        sh.setHasOpenPositions(false);
        return SideHustleResponse.from(sh);
    }
}
