package com.andi.rummy.security;

import java.security.Key;
import java.util.Date;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.token.secret-key}")
    private String jwtSecret;

    private Key getSigningKey() {
      return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    private Logger log;

    private final long ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
    private final long REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

    public String generateAccessToken(String username) {
      Date now = new Date();
      Date expiryDate = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY);

      return Jwts.builder()
          .setSubject(username)
          .setIssuedAt(now)
          .setExpiration(expiryDate)
          .signWith(this.getSigningKey())
          .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(this.getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(this.getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
      try {
        Jwts.parserBuilder().setSigningKey(this.getSigningKey()).build().parseClaimsJws(token);
        return true;
      } catch (ExpiredJwtException e) {
        log.warning("Token expired: {}");
        return false;
      } catch (JwtException e) {
        log.warning("Invalid JWT: {}");
        return false;
      } catch (Exception e) {
          return false;
      }
    }
}