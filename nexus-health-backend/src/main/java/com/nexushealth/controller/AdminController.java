package com.nexushealth.controller;

import com.nexushealth.dto.response.DoctorResponse;
import com.nexushealth.dto.response.UserResponse;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import com.nexushealth.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;

    public AdminController(UserRepository ur, AppointmentRepository ar, DoctorService ds) {
        this.userRepository = ur; this.appointmentRepository = ar; this.doctorService = ds;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "users", userRepository.count(),
                "doctors", doctorService.getApprovedDoctors().size(),
                "appointments", appointmentRepository.count()
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(u -> UserResponse.builder().id(u.getId()).email(u.getEmail()).fullName(u.getFullName())
                        .phone(u.getPhone()).role(u.getRole()).isActive(u.getIsActive()).build())
                .toList());
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<DoctorResponse>> getPendingDoctors() {
        return ResponseEntity.ok(doctorService.getPendingDoctors());
    }

    @PatchMapping("/doctors/{id}/approve")
    public ResponseEntity<Map<String, String>> approveDoctor(@PathVariable UUID id) {
        doctorService.approveDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor approved"));
    }
}
