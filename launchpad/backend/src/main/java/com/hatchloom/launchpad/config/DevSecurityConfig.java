package com.hatchloom.launchpad.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration active only under the {@code dev} Spring profile.
 *
 * <p>
 * Replaces {@link SecurityConfig}: permits all requests and injects a fixed
 * mock caller identity via {@link DevAuthFilter} so that controllers can call
 * {@code jwt.getSubject()} without a real auth service running.
 * </p>
 *
 * <p>
 * <strong>Never enable the {@code dev} profile in production.</strong>
 * </p>
 */
@Profile("dev")
@Configuration
@EnableWebSecurity
public class DevSecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(DevSecurityConfig.class);

    @Bean
    public SecurityFilterChain devSecurityFilterChain(HttpSecurity http) throws Exception {
        log.warn("==========================================================");
        log.warn("  DEV PROFILE ACTIVE - JWT authentication is DISABLED");
        log.warn("  All requests authenticated as dev user: {}", DevAuthFilter.DEV_USER_ID);
        log.warn("  DO NOT run this profile in production!");
        log.warn("==========================================================");

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .addFilterBefore(new DevAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
