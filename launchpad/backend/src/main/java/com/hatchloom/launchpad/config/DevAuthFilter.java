package com.hatchloom.launchpad.config;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Dev-profile-only filter that injects a fixed mock {@link Jwt} as the
 * authenticated principal on every request, bypassing real JWT validation.
 *
 * <p>
 * Controllers can call {@code jwt.getSubject()} normally - they will receive
 * {@link #DEV_USER_ID} as the caller identity.
 * </p>
 *
 * <p>
 * Only active when the {@code dev} Spring profile is enabled.
 * </p>
 */
public class DevAuthFilter extends OncePerRequestFilter {

    /** Fixed UUID used as the caller identity in dev mode. */
    static final UUID DEV_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Jwt mockJwt = Jwt.withTokenValue("dev-token")
                .header("alg", "none")
                .subject(DEV_USER_ID.toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(86400))
                .build();

        JwtAuthenticationToken auth = new JwtAuthenticationToken(mockJwt, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }
}
