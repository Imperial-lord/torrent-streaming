package com.torrent.streaming.streaming_service.controller;

import com.torrent.streaming.streaming_service.config.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        var user = userDetailsService.loadUserByUsername(req.getUsername());
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user.getUsername());
        return Map.of(
                "accessToken", access,
                "refreshToken", refresh,
                "username", user.getUsername(),
                "roles", user.getAuthorities()
        );
    }

    @PostMapping("/refresh")
    public Map<String, Object> refresh(@RequestBody RefreshRequest req) {
        String username = jwtService.getUsername(req.getRefreshToken()); // throws if invalid/expired
        var user = userDetailsService.loadUserByUsername(username);
        String newAccess = jwtService.generateAccessToken(user);
        return Map.of(
                "accessToken", newAccess,
                "username", user.getUsername(),
                "roles", user.getAuthorities()
        );
    }

    @GetMapping("/check")
    public Map<String, Object> check(Authentication auth) {
        return Map.of(
                "username", auth.getName(),
                "roles", auth.getAuthorities()
        );
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RefreshRequest {
        private String refreshToken;
    }
}