package com.hatchloom.user.user_service.controller;

import java.util.Map;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.user.user_service.security.JwtAuthenticationFilter;
import com.hatchloom.user.user_service.security.JwtTokenProvider;

@WebMvcTest(OidcController.class)
@AutoConfigureMockMvc(addFilters = false)
class OidcControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void openidConfiguration_returnsIssuerAndJwksUri() throws Exception {
        when(jwtTokenProvider.getIssuerUri()).thenReturn("http://localhost:8081");

        mockMvc.perform(get("/.well-known/openid-configuration"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.issuer").value("http://localhost:8081"))
                .andExpect(jsonPath("$.jwks_uri")
                        .value("http://localhost:8081/.well-known/jwks.json"))
                .andExpect(jsonPath("$.id_token_signing_alg_values_supported[0]").value("RS256"))
                .andExpect(jsonPath("$.subject_types_supported[0]").value("public"));
    }

    @Test
    void jwks_returnsPublicKeySetFromTokenProvider() throws Exception {
        when(jwtTokenProvider.getPublicJwk()).thenReturn(Map.of(
                "kty", "RSA",
                "alg", "RS256",
                "kid", "test-key-id"));

        mockMvc.perform(get("/.well-known/jwks.json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.keys").isArray())
                .andExpect(jsonPath("$.keys.length()").value(1))
                .andExpect(jsonPath("$.keys[0].kty").value("RSA"))
                .andExpect(jsonPath("$.keys[0].alg").value("RS256"))
                .andExpect(jsonPath("$.keys[0].kid").value("test-key-id"));
    }
}
