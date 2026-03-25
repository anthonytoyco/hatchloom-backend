package com.hatchloom.launchpad.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the LaunchPad service.
 *
 * Allows a small set of read-only endpoints publicly (Position Status
 * Interface,
 * health/info probes, and OpenAPI docs), while requiring JWT authentication for
 * all other routes.
 *
 * <p>
 * Not active under the {@code dev} profile - see {@link DevSecurityConfig}.
 * </p>
 */
@Profile("!dev")
@Configuration
@EnableWebSecurity
public class SecurityConfig {

        /**
         * Security filter chain with explicit public routes and JWT protection for all
         * remaining endpoints.
         *
         * @param http the {@link HttpSecurity} to configure
         * @return the configured {@link SecurityFilterChain}
         * @throws Exception if configuration fails
         */
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.GET, "/launchpad/positions/*/status")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**",
                                                                "/v3/api-docs",
                                                                "/v3/api-docs/**")
                                                .permitAll()
                                                .requestMatchers("/error").permitAll()
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {
                                }));

                return http.build();
        }
}
