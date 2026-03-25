package com.hatchloom.connecthub.connecthub_service.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

public class JwtUtilTest {
    private static final String SECRET = "your-secret-key-change-this-in-production-at-least-256-bits-long-for-security";

    public static String generateTestToken(UUID userId) {
        SecretKey k = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("userId", userId.toString())
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(k)
                .compact();
    }
}
