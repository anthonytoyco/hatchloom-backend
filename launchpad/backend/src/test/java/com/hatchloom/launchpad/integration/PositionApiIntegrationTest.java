package com.hatchloom.launchpad.integration;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;
import com.hatchloom.launchpad.repository.SideHustleRepository;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("integration")
class PositionApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SideHustleRepository sideHustleRepository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UUID sideHustleId;
    private UUID ownerId;

    @BeforeEach
    void setUpData() {
        sideHustleRepository.deleteAll();

        ownerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);
        sideHustle.setTitle("Tutor Loop");
        sideHustle.setDescription("Peer tutoring matching");
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        sideHustle = sideHustleRepository.save(sideHustle);
        sideHustleId = sideHustle.getId();
    }

    @Test
    void createAdvanceAndRetrievePosition_shouldSucceed() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/sidehustles/{sideHustleId}/positions", sideHustleId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Frontend Intern\",\"description\":\"React + UX\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andReturn();

        JsonNode createJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String positionId = createJson.path("id").asText();
        assertNotNull(positionId);

        mockMvc.perform(put("/sidehustles/{sideHustleId}/positions/{positionId}/status", sideHustleId, positionId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"FILLED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FILLED"));

        mockMvc.perform(get("/positions/{positionId}/status", positionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("FILLED"));
    }

    @Test
    void updatePositionStatus_invalidState_returnsBadRequest() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/sidehustles/{sideHustleId}/positions", sideHustleId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Backend Intern\",\"description\":\"Spring\"}"))
                .andExpect(status().isOk())
                .andReturn();

        String positionId = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("id").asText();

        mockMvc.perform(put("/sidehustles/{sideHustleId}/positions/{positionId}/status", sideHustleId, positionId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"NOT_A_REAL_STATE\"}"))
                .andExpect(status().isBadRequest());
    }
}
