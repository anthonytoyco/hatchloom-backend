package com.hatchloom.launchpad.controller;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.response.BMCResponse;
import com.hatchloom.launchpad.service.BMCService;

@WebMvcTest(BMCController.class)
class BMCControllerWebMvcTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private BMCService bmcService;

        @MockitoBean
        private JwtDecoder jwtDecoder;

        @Test
        void editSection_withJwtAndValidBody_returnsOk() throws Exception {
                UUID sideHustleId = UUID.randomUUID();
                UUID callerId = UUID.randomUUID();

                when(bmcService.editSection(any(), any(), any(), any()))
                                .thenReturn(org.mockito.Mockito.mock(BMCResponse.class));

                mockMvc.perform(patch("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                                .with(jwt().jwt(jwt -> jwt.subject(callerId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"section\":\"channels\",\"content\":\"direct\"}"))
                                .andExpect(status().isOk());
        }

        @Test
        void editSection_withoutJwt_returnsForbidden() throws Exception {
                UUID sideHustleId = UUID.randomUUID();

                mockMvc.perform(patch("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"section\":\"channels\",\"content\":\"direct\"}"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void editSection_insufficientRolePath_returnsForbidden() throws Exception {
                UUID sideHustleId = UUID.randomUUID();
                UUID callerId = UUID.randomUUID();

                when(bmcService.editSection(any(), any(), any(), any()))
                                .thenThrow(new ResponseStatusException(FORBIDDEN, "Forbidden"));

                mockMvc.perform(patch("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                                .with(jwt().jwt(jwt -> jwt.subject(callerId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"section\":\"channels\",\"content\":\"direct\"}"))
                                .andExpect(status().isForbidden());
        }
}
