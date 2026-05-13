package com.nexushealth.dto.response;

import com.nexushealth.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * WHY separate from User entity:
 * - Never exposes passwordHash
 * - Includes JWT tokens which don't exist on the entity
 * - Frontend gets exactly what it needs, nothing more
 */
@Data
@Builder
@AllArgsConstructor
public class AuthResponse {

    private UUID id;
    private String email;
    private String fullName;
    private Role role;
    private String accessToken;
    private String refreshToken;
}
