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

import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;
import com.hatchloom.launchpad.repository.BusinessModelCanvasRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("integration")
class BMCApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SideHustleRepository sideHustleRepository;

    @Autowired
    private BusinessModelCanvasRepository bmcRepository;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private UUID sideHustleId;
    private UUID ownerId;

    @BeforeEach
    void setUpData() {
        bmcRepository.deleteAll();
        sideHustleRepository.deleteAll();

        ownerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);
        sideHustle.setTitle("Campus Cart");
        sideHustle.setDescription("On-campus micro-logistics");
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        sideHustle = sideHustleRepository.save(sideHustle);
        sideHustleId = sideHustle.getId();

        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(sideHustle);
        bmc.setKeyPartners("Student orgs");
        bmcRepository.save(bmc);
    }

    @Test
    void editBmcSection_validPayload_returnsOkAndUpdatedData() throws Exception {
        mockMvc.perform(patch("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"section\":\"channels\",\"content\":\"discord\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sideHustleId").value(sideHustleId.toString()))
                .andExpect(jsonPath("$.channels").value("discord"));
    }

    @Test
    void getBmc_existingSideHustle_returnsOk() throws Exception {
        mockMvc.perform(get("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sideHustleId").value(sideHustleId.toString()));
    }

    @Test
    void editBmcSection_invalidPayload_returnsBadRequest() throws Exception {
        mockMvc.perform(patch("/sidehustles/{sideHustleId}/bmc", sideHustleId)
                .with(jwt().jwt(j -> j.subject(ownerId.toString())))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"missing section\"}"))
                .andExpect(status().isBadRequest());
    }
}
