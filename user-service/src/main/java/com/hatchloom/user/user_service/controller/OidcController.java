package com.hatchloom.user.user_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.user.user_service.security.JwtTokenProvider;

@RestController
public class OidcController {

    private final JwtTokenProvider jwtTokenProvider;

    public OidcController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/.well-known/openid-configuration")
    public Map<String, Object> openIdConfiguration() {
        String issuer = jwtTokenProvider.getIssuerUri();
        String jwksUri = issuer + "/.well-known/jwks.json";

        return Map.of(
                "issuer", issuer,
                "jwks_uri", jwksUri,
                "id_token_signing_alg_values_supported", List.of("RS256"),
                "subject_types_supported", List.of("public"));
    }

    @GetMapping("/.well-known/jwks.json")
    public Map<String, Object> jwks() {
        return Map.of("keys", List.of(jwtTokenProvider.getPublicJwk()));
    }
}
