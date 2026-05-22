package com.nexushealth.service;

import com.nexushealth.dto.request.DoctorRegisterRequest;
import com.nexushealth.dto.request.LoginRequest;
import com.nexushealth.dto.request.RegisterRequest;
import com.nexushealth.dto.response.AuthResponse;
import com.nexushealth.dto.response.UserResponse;
import com.nexushealth.entity.DoctorProfile;
import com.nexushealth.entity.PatientProfile;
import com.nexushealth.entity.RefreshToken;
import com.nexushealth.entity.User;
import com.nexushealth.entity.enums.Role;
import com.nexushealth.exception.BadRequestException;
import com.nexushealth.exception.ResourceNotFoundException;
import com.nexushealth.exception.UnauthorizedException;
import com.nexushealth.repository.DoctorProfileRepository;
import com.nexushealth.repository.PatientProfileRepository;
import com.nexushealth.repository.RefreshTokenRepository;
import com.nexushealth.repository.UserRepository;
import com.nexushealth.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AuthService handles all authentication business logic.
 * 
 * WHY service layer: Controllers should NOT contain business logic.
 * They handle HTTP concerns (parsing requests, sending responses).
 * Services contain the actual logic (validation, DB operations, token generation).
 * This separation means you can reuse AuthService from WebSocket handlers,
 * scheduled tasks, or CLI tools — not just REST controllers.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       DoctorProfileRepository doctorProfileRepository,
                       PatientProfileRepository patientProfileRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new patient.
     * 
     * WHY @Transactional: We're creating TWO records (user + patient_profile).
     * If the second insert fails, @Transactional rolls back the first one too.
     * Without it, you'd have orphaned user records with no profile.
     */
    @Transactional
    public AuthResponse registerPatient(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Create user entity
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.PATIENT)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Create empty patient profile (user can fill in details later)
        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .build();
        patientProfileRepository.save(profile);

        // Generate tokens
        return buildAuthResponse(user);
    }

    /**
     * Register a new doctor.
     * Doctor accounts start as unapproved — admin must approve before
     * the doctor can appear in search results or accept appointments.
     */
    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.DOCTOR)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .bio(request.getBio())
                .consultationFee(request.getConsultationFee() != null
                        ? request.getConsultationFee()
                        : BigDecimal.valueOf(500.00))
                .isAvailableOnline(true)
                .isApproved(false)  // Requires admin approval
                .build();
        doctorProfileRepository.save(profile);

        return buildAuthResponse(user);
    }

    /**
     * Login with email + password.
     * 
     * HOW: AuthenticationManager delegates to CustomUserDetailsService
     * which loads the user, then compares passwords using BCrypt.
     * If credentials are invalid, Spring throws BadCredentialsException
     * which our GlobalExceptionHandler catches.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // This line does the heavy lifting — validates credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Check if doctor is approved
        if (user.getRole() == Role.DOCTOR) {
            DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            if (!profile.getIsApproved()) {
                throw new UnauthorizedException("Your account is pending admin approval");
            }
        }

        return buildAuthResponse(user);
    }

    /**
     * Login or Register with Google OAuth2.
     */
    @Transactional
    public AuthResponse googleLogin(String idTokenString) {
        try {
            com.google.api.client.http.javanet.NetHttpTransport transport = new com.google.api.client.http.javanet.NetHttpTransport();
            com.google.api.client.json.gson.GsonFactory jsonFactory = new com.google.api.client.json.gson.GsonFactory();
            
            // Note: In production, verify the audience matches your actual client ID
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = 
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                // .setAudience(Collections.singletonList("YOUR_GOOGLE_CLIENT_ID"))
                .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new UnauthorizedException("Invalid Google ID token");
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Auto-register new PATIENT user
                user = User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                        .fullName(name != null ? name : "Google User")
                        .role(Role.PATIENT)
                        .isActive(true)
                        .build();
                user = userRepository.save(user);

                PatientProfile profile = PatientProfile.builder()
                        .user(user)
                        .build();
                patientProfileRepository.save(profile);
            }

            // Check if doctor is approved (if logging in as an existing doctor)
            if (user.getRole() == Role.DOCTOR) {
                DoctorProfile profile = doctorProfileRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
                if (!profile.getIsApproved()) {
                    throw new UnauthorizedException("Your account is pending admin approval");
                }
            }

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new UnauthorizedException("Google authentication failed: " + e.getMessage());
        }
    }

    /**
     * Refresh access token using a valid refresh token.
     * 
     * WHY: Access tokens expire in 15 minutes. Instead of making users
     * log in again, the frontend sends the refresh token to get a new
     * access token silently.
     */
    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        User user = refreshToken.getUser();

        // Delete old refresh token and create a new one (token rotation)
        // WHY rotation: If a refresh token is stolen, the real user's next
        // refresh will fail (old token deleted), alerting them to compromise.
        refreshTokenRepository.delete(refreshToken);

        return buildAuthResponse(user);
    }

    /**
     * Logout — delete all refresh tokens for this user.
     */
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    /**
     * Get current user profile.
     */
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken();

        // Persist refresh token in DB
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtTokenProvider.getRefreshTokenExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
