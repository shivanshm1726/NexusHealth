package com.nexushealth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Doctor registration includes specialization and qualification
 * on top of the standard registration fields.
 */
@Data
public class DoctorRegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String qualification;
    private String bio;
    private BigDecimal consultationFee;
}
