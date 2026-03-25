package com.hatchloom.user.user_service.security;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtTokenProvider implements InitializingBean {

    @Value("${jwt.access-token-expiry-minutes}")
    private int accessTokenExpiryMinutes;

    @Value("${jwt.refresh-token-expiry-days}")
    private int refreshTokenExpiryDays;

    @Value("${jwt.issuer-uri:http://localhost:8081}")
    private String jwtIssuerUri;

    @Value("${jwt.key-id:user-service-rs256}")
    private String jwtKeyId;

    private KeyPair keyPair;

    @Override
    public void afterPropertiesSet() {
        this.keyPair = generateSigningKeyPair();
    }

    public String generateAccessToken(UUID userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("type", "ACCESS");
        return createToken(claims, userId.toString(), getAccessTokenExpiry());
    }

    public String generateRefreshToken(UUID userId, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "REFRESH");
        return createToken(claims, userId.toString(), getRefreshTokenExpiry());
    }

    private String createToken(Map<String, Object> claims, String subject, long expiryMillis) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiryMillis);

        return Jwts.builder()
                .header().keyId(jwtKeyId).and()
                .claims().add(claims).and()
                .issuer(jwtIssuerUri)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getPrivateSigningKey())
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            log.error("Failed to get user ID from token", e);
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return (String) claims.get("role");
        } catch (Exception e) {
            log.error("Failed to get role from token", e);
            return null;
        }
    }

    public String getTokenTypeFromToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return (String) claims.get("type");
        } catch (Exception e) {
            log.error("Failed to get token type from token", e);
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .requireIssuer(jwtIssuerUri)
                    .verifyWith(getPublicVerificationKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    private Claims getClaimsFromToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        if (token.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Token contains 'Bearer ' prefix - should be extracted first");
        }

        return Jwts.parser()
                .requireIssuer(jwtIssuerUri)
                .verifyWith(getPublicVerificationKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getIssuerUri() {
        return jwtIssuerUri;
    }

    public String getKeyId() {
        return jwtKeyId;
    }

    public Map<String, Object> getPublicJwk() {
        RSAPublicKey publicKey = getPublicVerificationKey();
        return Map.of(
                "kty", "RSA",
                "use", "sig",
                "alg", "RS256",
                "kid", jwtKeyId,
                "n", toBase64Url(publicKey.getModulus()),
                "e", toBase64Url(publicKey.getPublicExponent()));
    }

    private RSAPrivateKey getPrivateSigningKey() {
        return (RSAPrivateKey) keyPair.getPrivate();
    }

    private RSAPublicKey getPublicVerificationKey() {
        return (RSAPublicKey) keyPair.getPublic();
    }

    private KeyPair generateSigningKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Unable to generate RSA signing keypair", e);
        }
    }

    private String toBase64Url(BigInteger bigInteger) {
        byte[] bytes = bigInteger.toByteArray();
        if (bytes.length > 1 && bytes[0] == 0) {
            byte[] unsignedBytes = new byte[bytes.length - 1];
            System.arraycopy(bytes, 1, unsignedBytes, 0, unsignedBytes.length);
            bytes = unsignedBytes;
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private long getAccessTokenExpiry() {
        return (long) accessTokenExpiryMinutes * 60 * 1000;
    }

    private long getRefreshTokenExpiry() {
        return (long) refreshTokenExpiryDays * 24 * 60 * 60 * 1000;
    }
}
