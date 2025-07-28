package com.torrent.streaming.streaming_service.config.security;

import com.oracle.bmc.secrets.SecretsClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import static com.torrent.streaming.streaming_service.utils.OciSecretHelper.getSecretValue;

@Configuration
@EnableConfigurationProperties(AppSecurityProperties.class)
public class SecurityConfig {
    @Bean
    UserDetailsService userDetailsService(SecretsClient secretsClient, AppSecurityProperties appSecurityProperties) {
        var manager = new InMemoryUserDetailsManager();
        for (AppSecurityProperties.User u : appSecurityProperties.getUsers()) {
            String encodedPassword = "{noop}" + getSecretValue(secretsClient, u.getPassword());
            UserDetails user = User
                    .withUsername(getSecretValue(secretsClient, u.getUsername()))
                    .password(encodedPassword)
                    .roles(u.getRoles().toArray(String[]::new))
                    .build();
            manager.createUser(user);
        }
        return manager;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                // Stateless – perfect for Basic Auth APIs
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Turn CSRF off because we are stateless & not using cookies
                .csrf(AbstractHttpConfigurer::disable)
                // All requests require authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/check").authenticated()
                        .anyRequest().authenticated())
                // HTTP Basic (challenge handled automatically)
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}