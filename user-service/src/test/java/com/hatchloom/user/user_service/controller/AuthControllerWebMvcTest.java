package com.hatchloom.user.user_service.controller;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.user.user_service.dto.LoginResponse;
import com.hatchloom.user.user_service.dto.RegisterResponse;
import com.hatchloom.user.user_service.security.JwtAuthenticationFilter;
import com.hatchloom.user.user_service.service.AuthService;
import com.hatchloom.user.user_service.service.ParentStudentLinkService;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private AuthService authService;

        @MockitoBean
        private ParentStudentLinkService parentStudentLinkService;

        @MockitoBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Test
        void register_missingUsername_returnsBadRequest() throws Exception {
                when(authService.register(any()))
                                .thenReturn(RegisterResponse.builder().message("Invalid registration request").build());

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"test@example.com\",\"password\":\"secret\",\"role\":\"STUDENT\"}"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void register_missingPassword_returnsBadRequest() throws Exception {
                when(authService.register(any()))
                                .thenReturn(RegisterResponse.builder().message("Invalid registration request").build());

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"user\",\"email\":\"test@example.com\",\"role\":\"STUDENT\"}"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void login_withMissingFields_returnsUnauthorized() throws Exception {
                when(authService.login(any()))
                                .thenReturn(LoginResponse.builder().message("Invalid credentials").build());

                mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isUnauthorized());
        }
}
