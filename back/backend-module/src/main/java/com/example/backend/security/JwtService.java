package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final String issuer;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.issuer:teste-integrado}") String issuer
    ) {
        // Secret deve ser >= 32 bytes para HS256
        byte[] bytes = secret.length() >= 32
                ? secret.getBytes()
                : Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(bytes.length >= 32 ? bytes : padTo32(bytes));
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    private byte[] padTo32(byte[] src) {
        byte[] out = new byte[32];
        System.arraycopy(src, 0, out, 0, Math.min(src.length, 32));
        return out;
    }

    public String generate(String username, Map<String, Object> claims) {
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getExpirationMs() { return expirationMs; }
}
