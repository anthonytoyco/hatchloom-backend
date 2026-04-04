package com.hatchloom.user.user_service.integration;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hatchloom.user.user_service.dto.LoginRequest;
import com.hatchloom.user.user_service.dto.RefreshTokenRequest;
import com.hatchloom.user.user_service.dto.RegisterRequest;

@SpringBootTest
@ActiveProfiles("test")
@Tag("integration")
class AuthApiIntegrationTest {

        @Autowired
        private WebApplicationContext webApplicationContext;

        private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

        @BeforeEach
        void setUpMockMvc() {
                mockMvc = webAppContextSetup(webApplicationContext).build();
        }

        @Test
        void registerLoginValidateRefresh_shouldWorkWithInMemoryDb() throws Exception {
                String suffix = UUID.randomUUID().toString().substring(0, 8);
                String username = "student_" + suffix;
                String email = "student_" + suffix + "@example.com";
                String password = "Password123";

                registerStudent(username, email, password)
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.message").value("Registration successful"))
                                .andExpect(jsonPath("$.userId").isNotEmpty())
                                .andExpect(jsonPath("$.role").value("STUDENT"));

                MvcResult loginResult = login(username, password)
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Login successful"))
                                .andReturn();

                JsonNode loginJson = readJson(loginResult);
                String accessToken = loginJson.path("accessToken").asText();
                String refreshToken = loginJson.path("refreshToken").asText();

                assertFalse(accessToken.isBlank());
                assertFalse(refreshToken.isBlank());

                mockMvc.perform(get("/auth/validate")
                                .header("Authorization", "Bearer " + accessToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.valid").value(true))
                                .andExpect(jsonPath("$.message").value("Token is valid"))
                                .andExpect(jsonPath("$.role").value("STUDENT"));

                MvcResult refreshResult = refresh(refreshToken)
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                                .andReturn();

                JsonNode refreshJson = readJson(refreshResult);
                assertFalse(refreshJson.path("accessToken").asText().isBlank());
                assertFalse(refreshJson.path("refreshToken").asText().isBlank());
        }

        @Test
        void refresh_withInvalidToken_shouldReturnUnauthorized() throws Exception {
                refresh("not-a-real-refresh-token")
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void registerWithDuplicateEmail_shouldReturnBadRequest() throws Exception {
                String suffix = UUID.randomUUID().toString().substring(0, 8);
                String email = "duplicate_" + suffix + "@example.com";

                registerStudent("first_" + suffix, email, "Password123")
                                .andExpect(status().isCreated());

                registerStudent("second_" + suffix, email, "Password123")
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Invalid registration request"));
        }

        @Test
        void protectedProfileWithoutToken_shouldReturnUnauthorized() throws Exception {
                mockMvc.perform(get("/profile/" + UUID.randomUUID()))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void studentCannotListAllProfiles_shouldReturnForbidden() throws Exception {
                String suffix = UUID.randomUUID().toString().substring(0, 8);
                String username = "student_list_" + suffix;
                String email = "student_list_" + suffix + "@example.com";
                String password = "Password123";

                registerStudent(username, email, password)
                                .andExpect(status().isCreated());

                MvcResult loginResult = login(username, password)
                                .andExpect(status().isOk())
                                .andReturn();

                String accessToken = readJson(loginResult).path("accessToken").asText();
                assertNotNull(accessToken);
                assertFalse(accessToken.isBlank());

                mockMvc.perform(get("/profile")
                                .param("page", "0")
                                .param("size", "10")
                                .header("Authorization", "Bearer " + accessToken))
                                .andExpect(status().isForbidden());
        }

        private org.springframework.test.web.servlet.ResultActions registerStudent(String username, String email,
                        String password)
                        throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username(username)
                                .email(email)
                                .password(password)
                                .role("STUDENT")
                                .schoolId(UUID.randomUUID().toString())
                                .age(16)
                                .build();

                return mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)));
        }

        private org.springframework.test.web.servlet.ResultActions login(String username, String password)
                        throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username(username)
                                .password(password)
                                .build();

                return mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)));
        }

        private org.springframework.test.web.servlet.ResultActions refresh(String refreshToken) throws Exception {
                RefreshTokenRequest request = RefreshTokenRequest.builder()
                                .refreshToken(refreshToken)
                                .build();

                return mockMvc.perform(post("/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)));
        }

        private JsonNode readJson(MvcResult result) throws Exception {
                JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
                assertNotNull(jsonNode);
                return jsonNode;
        }
}
