package com.hatchloom.user.user_service.integration;

import java.util.UUID;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hatchloom.user.user_service.dto.LoginRequest;
import com.hatchloom.user.user_service.dto.RegisterRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("integration")
class ProfileApiIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

        @Test
        void getProfile_authenticated_returnsProfileData() throws Exception {
                UserSession userSession = registerAndLoginStudent();

                mockMvc.perform(get("/profile/{userId}", userSession.userId())
                                .header("Authorization", "Bearer " + userSession.accessToken()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.userId").value(userSession.userId()))
                                .andExpect(jsonPath("$.username").value(userSession.username()));
        }

        @Test
        void getProfile_withoutToken_returnsUnauthorized() throws Exception {
                UserSession userSession = registerAndLoginStudent();

                mockMvc.perform(get("/profile/{userId}", userSession.userId()))
                                .andExpect(status().isForbidden());
        }

        @Test
        void updateProfile_thenRefetch_returnsPersistedValue() throws Exception {
                UserSession userSession = registerAndLoginStudent();

                mockMvc.perform(put("/profile/{userId}", userSession.userId())
                                .header("Authorization", "Bearer " + userSession.accessToken())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bio\":\"building products after class\"}"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.bio").value("building products after class"));

                mockMvc.perform(get("/profile/{userId}", userSession.userId())
                                .header("Authorization", "Bearer " + userSession.accessToken()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.bio").value("building products after class"));
        }

        private UserSession registerAndLoginStudent() throws Exception {
                String suffix = UUID.randomUUID().toString().substring(0, 8);
                String username = "profile_" + suffix;
                String email = "profile_" + suffix + "@example.com";
                String password = "Password123";

                RegisterRequest registerRequest = RegisterRequest.builder()
                                .username(username)
                                .email(email)
                                .password(password)
                                .role("STUDENT")
                                .schoolId(UUID.randomUUID().toString())
                                .age(16)
                                .build();

                MvcResult registerResult = mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerRequest)))
                                .andExpect(status().isCreated())
                                .andReturn();

                String userId = readJson(registerResult).path("userId").asText();

                LoginRequest loginRequest = LoginRequest.builder()
                                .username(username)
                                .password(password)
                                .build();

                MvcResult loginResult = mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk())
                                .andReturn();

                String accessToken = readJson(loginResult).path("accessToken").asText();
                assertThat(accessToken).isNotBlank();

                return new UserSession(userId, username, accessToken);
        }

        private JsonNode readJson(MvcResult result) throws Exception {
                return objectMapper.readTree(result.getResponse().getContentAsString());
        }

        private record UserSession(String userId, String username, String accessToken) {
        }
}
