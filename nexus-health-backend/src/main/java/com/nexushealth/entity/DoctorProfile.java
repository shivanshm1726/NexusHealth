package com.nexushealth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Doctor-specific profile data.
 * Only created when a user registers as a doctor.
 */
@Entity
@Table(name = "doctor_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String specialization;

    private String qualification;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(name = "is_available_online", nullable = false)
    private Boolean isAvailableOnline;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.consultationFee == null) this.consultationFee = BigDecimal.valueOf(500.00);
        if (this.isAvailableOnline == null) this.isAvailableOnline = true;
        if (this.isApproved == null) this.isApproved = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
