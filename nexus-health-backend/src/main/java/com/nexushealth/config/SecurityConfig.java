package com.nexushealth.config;

import com.nexushealth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central security configuration.
 * 
 * KEY CONCEPTS:
 * - STATELESS session: No server-side session storage. JWT carries all auth info.
 * - Filter chain: JwtAuthFilter runs before UsernamePasswordAuthFilter
 * - @EnableMethodSecurity: Allows @PreAuthorize("hasRole('ADMIN')") on methods
 * - BCrypt: Industry-standard password hashing with built-in salt
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enables @PreAuthorize annotations on controller methods
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS using our CorsConfig bean
            .cors(cors -> {})

            // Disable CSRF: Safe because we use JWT (not cookies) for auth.
            // CSRF attacks exploit cookie-based auth; JWT in Authorization header is immune.
            .csrf(csrf -> csrf.disable())

            // Stateless sessions: Server doesn't store session state.
            // Each request is independently authenticated via JWT.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // URL-based authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no JWT required)
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**", "/ping").permitAll()
                .requestMatchers("/ws/**").permitAll()

                // Role-based endpoint protection
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/receptionist/**").hasAnyRole("RECEPTIONIST", "ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // Return 401 JSON for unauthenticated requests (instead of redirect to login page)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(401);
                    response.getWriter().write(
                        "{\"status\":401,\"message\":\"Authentication required. Please login.\"}");
                })
            )

            // Add our JWT filter before Spring's default username/password filter
            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * BCrypt password encoder with strength 12.
     * WHY 12: Each increment doubles the computation time.
     * 10 = ~100ms, 12 = ~400ms. Good balance between security and UX.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * AuthenticationManager: Spring Security's entry point for authentication.
     * We expose it as a bean so our AuthService can use it programmatically.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
