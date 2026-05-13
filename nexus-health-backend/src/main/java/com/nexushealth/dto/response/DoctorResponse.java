package com.nexushealth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class DoctorResponse {

    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private String qualification;
    private String bio;
    private BigDecimal consultationFee;
    private Boolean isAvailableOnline;
    private Boolean isApproved;
}
