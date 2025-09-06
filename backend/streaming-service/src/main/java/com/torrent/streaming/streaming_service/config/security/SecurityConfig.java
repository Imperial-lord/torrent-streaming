package com.torrent.streaming.streaming_service.config.security;

import com.oracle.bmc.secrets.SecretsClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static com.torrent.streaming.streaming_service.utils.OciSecretHelper.getSecretValue;

@Configuration
@EnableConfigurationProperties({AppSecurityProperties.class, JwtProperties.class})
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(SecretsClient secretsClient, AppSecurityProperties appSecurityProperties) {
        var manager = new InMemoryUserDetailsManager();
        for (AppSecurityProperties.User u : appSecurityProperties.getUsers()) {
            String username = getSecretValue(secretsClient, u.getUsername());
            String stored = getSecretValue(secretsClient, u.getPassword());
            String encodedPassword = stored.startsWith("{") ? stored : "{noop}" + stored;
            UserDetails user = User
                    .withUsername(username)
                    .password(encodedPassword)
                    .roles(u.getRoles().toArray(String[]::new))
                    .build();
            manager.createUser(user);
        }
        return manager;
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService uds, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(Customizer.withDefaults())
                // Stateless – perfect for Basic Auth APIs
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Turn CSRF off because we are stateless & not using cookies
                .csrf(AbstractHttpConfigurer::disable)
                // All requests require authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/login", "/auth/refresh").permitAll()
                        .requestMatchers("/api/hello").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated())
                // HTTP Basic (challenge handled automatically)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}