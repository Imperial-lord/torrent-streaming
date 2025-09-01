package com.torrent.streaming.streaming_service.config.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
@Getter
@Setter
public class JwtProperties {
    private String secretOcid;
    private String issuer;
    private int accessMinutes;
    private int refreshDays;
}