package com.nexushealth.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS configuration.
 *
 * WHY: Browser enforces Same-Origin Policy. Our frontend (localhost:3000)
 * and backend (localhost:8080) are different origins. Without CORS headers,
 * the browser blocks frontend requests to the backend.
 *
 * In production, set the FRONTEND_URL environment variable to your Vercel
 * deployment URL (e.g. https://nexus-health.vercel.app) and it will be
 * automatically added to the allowed origins list.
 */
@Configuration
public class CorsConfig {

    /** Optional production frontend URL — set via FRONTEND_URL env var on Railway. */
    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = new ArrayList<>(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002"
        ));

        // Add production Vercel URL if provided
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            origins.add(frontendUrl);
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
