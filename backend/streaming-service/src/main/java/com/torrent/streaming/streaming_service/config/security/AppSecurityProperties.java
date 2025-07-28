package com.torrent.streaming.streaming_service.config.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.security")
@Getter
@Setter
public class AppSecurityProperties {
    private List<User> users;

    @Getter
    @Setter
    public static class User {
        private String username;
        private String password;
        private List<String> roles;
    }
}
