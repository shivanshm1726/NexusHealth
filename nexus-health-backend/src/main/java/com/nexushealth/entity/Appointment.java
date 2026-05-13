package com.nexushealth.entity;

import com.nexushealth.entity.enums.AppointmentStatus;
import com.nexushealth.entity.enums.AppointmentType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "appointment_date", "time_slot"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booked_by", nullable = false)
    private User bookedBy;

    @Column(name = "appointment_date", nullable = false) private LocalDate appointmentDate;
    @Column(name = "time_slot", nullable = false) private LocalTime timeSlot;

    @Enumerated(EnumType.STRING) @Column(nullable = false) private AppointmentType type;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private AppointmentStatus status;

    @Column(nullable = false, columnDefinition = "TEXT") private String reason;
    private String priority;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(precision = 10, scale = 2) private BigDecimal amount;

    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = AppointmentStatus.PENDING_PAYMENT;
        if (type == null) type = AppointmentType.ONLINE;
        if (priority == null) priority = "NORMAL";
    }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
