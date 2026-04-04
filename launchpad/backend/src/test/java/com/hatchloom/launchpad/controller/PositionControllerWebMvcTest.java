package com.hatchloom.launchpad.controller;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.launchpad.dto.response.PositionResponse;
import com.hatchloom.launchpad.model.enums.PositionStatus;
import com.hatchloom.launchpad.service.PositionService;

@WebMvcTest(PositionController.class)
class PositionControllerWebMvcTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private PositionService positionService;

        @MockitoBean
        private JwtDecoder jwtDecoder;

        @Test
        void updatePositionStatus_validTransition_returnsOk() throws Exception {
                UUID sideHustleId = UUID.randomUUID();
                UUID positionId = UUID.randomUUID();
                UUID callerId = UUID.randomUUID();

                when(positionService.updatePositionStatus(eq(positionId), eq(PositionStatus.FILLED), eq(callerId)))
                                .thenReturn(org.mockito.Mockito.mock(PositionResponse.class));

                mockMvc.perform(put("/sidehustles/{sideHustleId}/positions/{positionId}/status", sideHustleId,
                                positionId)
                                .with(jwt().jwt(jwt -> jwt.subject(callerId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"FILLED\"}"))
                                .andExpect(status().isOk());
        }

        @Test
        void updatePositionStatus_invalidState_returnsBadRequest() throws Exception {
                UUID sideHustleId = UUID.randomUUID();
                UUID positionId = UUID.randomUUID();
                UUID callerId = UUID.randomUUID();

                mockMvc.perform(put("/sidehustles/{sideHustleId}/positions/{positionId}/status", sideHustleId,
                                positionId)
                                .with(jwt().jwt(jwt -> jwt.subject(callerId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"NOT_A_REAL_STATE\"}"))
                                .andExpect(status().isBadRequest());
        }
}
