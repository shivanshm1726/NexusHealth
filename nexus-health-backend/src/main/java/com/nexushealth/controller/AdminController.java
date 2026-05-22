package com.nexushealth.controller;

import com.nexushealth.dto.response.DoctorResponse;
import com.nexushealth.dto.response.UserResponse;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import com.nexushealth.service.DoctorService;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;

    public AdminController(
        UserRepository ur,
        AppointmentRepository ar,
        DoctorService ds
    ) {
        this.userRepository = ur;
        this.appointmentRepository = ar;
        this.doctorService = ds;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(
            Map.of(
                "users",
                userRepository.count(),
                "doctors",
                doctorService.getApprovedDoctors().size(),
                "appointments",
                appointmentRepository.count(),
                "revenue",
                appointmentRepository.getTotalRevenue()
            )
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(
            userRepository
                .findAll()
                .stream()
                .map(u ->
                    UserResponse.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .isActive(u.getIsActive())
                        .build()
                )
                .toList()
        );
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete associated appointments first to avoid FK constraints
        if (user.getRole() == com.nexushealth.entity.enums.Role.PATIENT) {
            appointmentRepository.deleteAll(appointmentRepository.findByPatientId(id));
        } else if (user.getRole() == com.nexushealth.entity.enums.Role.DOCTOR) {
            appointmentRepository.deleteAll(appointmentRepository.findByDoctorId(id));
        }
        
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User and associated records deleted successfully"));
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<DoctorResponse>> getPendingDoctors() {
        return ResponseEntity.ok(doctorService.getPendingDoctors());
    }

    @PatchMapping("/doctors/{id}/approve")
    public ResponseEntity<Map<String, String>> approveDoctor(
        @PathVariable UUID id
    ) {
        doctorService.approveDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor approved"));
    }

    @PatchMapping("/doctors/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectDoctor(
        @PathVariable UUID id
    ) {
        doctorService.rejectDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor rejected"));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Map<String, String>> deleteDoctor(
        @PathVariable UUID id
    ) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor deleted"));
    }
}
