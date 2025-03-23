package com.andi.rummy.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.andi.rummy.dto.LoginRequest;
import com.andi.rummy.dto.RegisterRequest;
import com.andi.rummy.dto.TokenResponse;
import com.andi.rummy.models.User;
import com.andi.rummy.security.JwtTokenProvider;
import com.andi.rummy.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final UserService userService;
  private final JwtTokenProvider tokenProvider;

  @PostMapping("/register")
  @Operation(summary = "Register a new user")
  public ResponseEntity<TokenResponse> registerUser(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
    User user = userService.registerUser(request.getUsername(), request.getPassword());

    Authentication authentication = authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(request.getUsername(),request.getPassword())
    );

    SecurityContextHolder.getContext().setAuthentication(authentication);
    String accessToken = tokenProvider.generateAccessToken(authentication.getName());
    String refreshToken = tokenProvider.generateRefreshToken(authentication.getName());

    // Set HTTP-Only Cookie for Refresh Token
    Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
    refreshCookie.setHttpOnly(true);
    refreshCookie.setSecure(true); // Use HTTPS in production
    refreshCookie.setPath("/auth/refresh");
    refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
    response.addCookie(refreshCookie);

    return ResponseEntity.ok(new TokenResponse(accessToken, user));
  }

  @PostMapping("/login")
  @Operation(summary = "Authenticate user and get token")
  public ResponseEntity<TokenResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
      HttpServletResponse response) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String accessToken = tokenProvider.generateAccessToken(authentication.getName());
      String refreshToken = tokenProvider.generateRefreshToken(authentication.getName());

      User user = (User) authentication.getPrincipal();

      // Set HTTP-Only Cookie for Refresh Token
      Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
      refreshCookie.setHttpOnly(true);
      refreshCookie.setSecure(true); // Use HTTPS in production
      refreshCookie.setPath("/api/v1/auth");
      refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
      response.addCookie(refreshCookie);

      return ResponseEntity.ok(new TokenResponse(accessToken, user));
    } catch (Exception e) {
      throw new IllegalAccessError("Not found user");
    }
  }

  @PostMapping("/refresh")
  public ResponseEntity<TokenResponse> refresh(
      @CookieValue(value = "refreshToken", required = false) String refreshToken) {
    return getNewAccessToken(refreshToken);
  }

  @GetMapping("/me")
  public ResponseEntity<TokenResponse> getUser(
      @CookieValue(value = "refreshToken", required = false) String refreshToken) {
    return getNewAccessToken(refreshToken);
  }

  private ResponseEntity<TokenResponse> getNewAccessToken(String refreshToken) throws IllegalAccessError {
    if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
      throw new IllegalAccessError("Invalid refresh token");
    }
    String username = tokenProvider.getUsernameFromToken(refreshToken);

    // Load user details manually
    User user = userService.getPlayerByUsername(username);
    String newAccessToken = tokenProvider.generateAccessToken(username);

    return ResponseEntity.ok(new TokenResponse(newAccessToken, user));
  }

  @PostMapping("/logout")
  public ResponseEntity<String> logout(HttpServletResponse response) {
    // Clear the refresh token cookie
    Cookie refreshCookie = new Cookie("refreshToken", "");
    refreshCookie.setHttpOnly(true);
    refreshCookie.setSecure(true);
    refreshCookie.setPath("/auth/refresh");
    refreshCookie.setMaxAge(0);
    response.addCookie(refreshCookie);

    return ResponseEntity.ok().body("Logged out");
  }
}
