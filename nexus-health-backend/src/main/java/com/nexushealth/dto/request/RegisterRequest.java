package com.nexushealth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * WHY DTOs instead of using entities directly?
 * 1. Security: You never accidentally expose password_hash or internal IDs
 * 2. Validation: Annotations here validate INPUT; entity annotations validate DB
 * 3. Decoupling: API contract can evolve independently of DB schema
 * 4. Clarity: Frontend devs see exactly what fields to send
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;
}
