package com.nexushealth.controller;

import com.nexushealth.dto.response.DoctorResponse;
import com.nexushealth.dto.response.UserResponse;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import com.nexushealth.service.AppointmentService;
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
    private final AppointmentService appointmentService;

    public AdminController(
        UserRepository ur,
        AppointmentRepository ar,
        DoctorService ds,
        AppointmentService as
    ) {
        this.userRepository = ur;
        this.appointmentRepository = ar;
        this.doctorService = ds;
        this.appointmentService = as;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        List<Map<String, Object>> revenueByDoctor = new ArrayList<>();
        for (Object[] row : appointmentRepository.getRevenueByDoctorRaw()) {
            revenueByDoctor.add(Map.of("doctorName", row[0], "revenue", row[1]));
        }

        return ResponseEntity.ok(
            Map.of(
                "users", userRepository.count(),
                "doctors", doctorService.getApprovedDoctors().size(),
                "appointments", appointmentRepository.count(),
                "revenue", appointmentRepository.getTotalRevenue(),
                "revenueByDoctor", revenueByDoctor
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

    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PatchMapping("/appointments/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully"));
    }

    @PatchMapping("/appointments/{id}/reassign")
    public ResponseEntity<Map<String, String>> reassignAppointment(
        @PathVariable UUID id,
        @RequestBody Map<String, UUID> request
    ) {
        UUID newDoctorId = request.get("doctorId");
        appointmentService.reassignAppointment(id, newDoctorId);
        return ResponseEntity.ok(Map.of("message", "Appointment reassigned successfully"));
    }
}
