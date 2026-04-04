package com.hatchloom.connecthub.connecthub_service.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtUtilTest {
    private static final String SECRET = loadJwtSecret();

    private static String loadJwtSecret() {
        Properties properties = new Properties();
        InputStream input = JwtUtilTest.class.getClassLoader().getResourceAsStream("application-test.properties");
        if (input == null) {
            input = JwtUtilTest.class.getClassLoader().getResourceAsStream("application.properties");
        }

        try (InputStream stream = input) {
            if (stream == null) {
                throw new IllegalStateException("Missing test application properties on classpath");
            }
            properties.load(stream);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load test application properties", ex);
        }

        String secret = properties.getProperty("jwt.secret");
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Property jwt.secret must be configured for tests");
        }
        return secret;
    }

    public static String generateTestToken(UUID userId) {
        SecretKey k = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("userId", userId.toString())
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(k, Jwts.SIG.HS256)
                .compact();
    }
}
