package com.nexushealth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response.
 * 
 * WHY standardize errors: Every error from the API follows the same
 * JSON structure. The frontend can parse errors consistently instead
 * of handling different shapes for different endpoints.
 */
@Data
@Builder
@AllArgsConstructor
public class ApiErrorResponse {

    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> errors;  // Field-level validation errors
}
