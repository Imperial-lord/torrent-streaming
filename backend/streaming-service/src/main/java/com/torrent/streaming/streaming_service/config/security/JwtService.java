package com.torrent.streaming.streaming_service.config.security;

import com.oracle.bmc.secrets.SecretsClient;
import com.torrent.streaming.streaming_service.utils.OciSecretHelper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties props;
    private final SecretsClient secretsClient;
    private SecretKey key;

    @PostConstruct
    void init() {
        String ocid = props.getSecretOcid();
        if (!StringUtils.hasText(ocid)) {
            throw new IllegalStateException(
                    "Missing JWT secret OCID: set 'app.security.jwt.secret-ocid' (or secretOcid) in application.properties");
        }

        String secretValue = OciSecretHelper.getSecretValue(secretsClient, ocid);
        if (!StringUtils.hasText(secretValue)) {
            throw new IllegalStateException("Vault secret value for JWT signing key is empty");
        }

        // Accept Base64 or raw text; build a 256-bit+ key
        byte[] keyBytes;
        try {
            // Try Base64 first
            keyBytes = Decoders.BASE64.decode(secretValue.trim());
        } catch (IllegalArgumentException ignore) {
            // Not Base64 → treat as raw UTF-8
            keyBytes = secretValue.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }

        if (keyBytes.length < 32) { // 256 bits minimum for HS256
            throw new IllegalStateException(
                    "JWT signing key too short (<256 bits). Provide a 32+ byte secret or Base64-encoded key via Vault.");
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(props.getIssuer())
                .setSubject(user.getUsername())
                .claim("roles", user.getAuthorities().stream().map(Object::toString).toList())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(props.getAccessMinutes(), ChronoUnit.MINUTES)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setIssuer(props.getIssuer())
                .setSubject(username)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(props.getRefreshDays(), ChronoUnit.DAYS)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String jwt) {
        return Jwts.parserBuilder()
                .requireIssuer(props.getIssuer())
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt);
    }

    public String getUsername(String jwt) {
        return parse(jwt).getBody().getSubject();
    }

    public boolean isExpired(String jwt) {
        return parse(jwt).getBody().getExpiration().before(new Date());
    }
}