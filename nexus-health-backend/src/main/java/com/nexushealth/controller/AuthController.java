package com.nexushealth.controller;

import com.nexushealth.dto.request.DoctorRegisterRequest;
import com.nexushealth.dto.request.LoginRequest;
import com.nexushealth.dto.request.RefreshTokenRequest;
import com.nexushealth.dto.request.RegisterRequest;
import com.nexushealth.dto.response.AuthResponse;
import com.nexushealth.dto.response.UserResponse;
import com.nexushealth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication REST controller.
 * 
 * WHY controllers are thin: Notice how every method just delegates to AuthService.
 * The controller's ONLY job is:
 * 1. Accept HTTP request
 * 2. Validate input (@Valid)
 * 3. Call service
 * 4. Return HTTP response with appropriate status code
 * 
 * All business logic lives in AuthService.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Register a new patient account.
     * Returns 201 CREATED with JWT tokens.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerPatient(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerPatient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/auth/register/doctor
     * Register a new doctor account (requires admin approval).
     */
    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(@Valid @RequestBody DoctorRegisterRequest request) {
        AuthResponse response = authService.registerDoctor(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/auth/login
     * Login with email + password. Returns JWT tokens.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/google
     * Login or register with Google OAuth2 ID Token.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        AuthResponse response = authService.googleLogin(token);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/refresh
     * Get new access token using refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/logout
     * Invalidate all refresh tokens for the current user.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * GET /api/auth/me
     * Get current authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
