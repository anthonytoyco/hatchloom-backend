package com.hatchloom.launchpad.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

        @Value("${CORS_ALLOWED_ORIGINS:http://localhost:4173,http://127.0.0.1:4173,http://localhost:3000}")
        private String corsAllowedOrigins;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.GET, "/positions/*/status")
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

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                                .map(String::trim).collect(Collectors.toList());
                config.setAllowedOrigins(origins);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
                config.setExposedHeaders(List.of("Authorization"));
                config.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
