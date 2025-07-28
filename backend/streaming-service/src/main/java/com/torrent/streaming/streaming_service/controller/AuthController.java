package com.torrent.streaming.streaming_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
public class AuthController {
    @GetMapping("/auth/check")
    public Map<String, Object> check(Authentication auth) {
        return Map.of(
                "username", auth.getName(),
                "roles", auth.getAuthorities()
        );
    }
}
