package com.nexushealth.controller;

import com.nexushealth.dto.response.DoctorResponse;
import com.nexushealth.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    public DoctorController(DoctorService ds) { this.doctorService = ds; }

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> listDoctors() {
        return ResponseEntity.ok(doctorService.getApprovedDoctors());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DoctorResponse> getDoctor(@PathVariable UUID userId) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userId));
    }

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<List<Map<String, Object>>> getSlots(@PathVariable UUID doctorId, @RequestParam String date) {
        return ResponseEntity.ok(doctorService.getAvailableSlots(doctorId, LocalDate.parse(date)));
    }

    @PutMapping("/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, String>> saveSchedule(Authentication auth, @RequestBody Map<String, Object> body) {
        var user = ((org.springframework.security.core.userdetails.User) auth.getPrincipal());
        var userEntity = doctorService.getApprovedDoctors().stream()
                .filter(d -> d.getEmail().equals(user.getUsername())).findFirst();
        // Get user ID from repo
        int slotDuration = body.get("slotDuration") != null ? (int) body.get("slotDuration") : 30;
        @SuppressWarnings("unchecked")
        var schedules = (List<Map<String, Object>>) body.get("schedules");
        // We need the user ID, so let's get it from the doctor service
        var doc = doctorService.getApprovedDoctors().stream().filter(d -> d.getEmail().equals(user.getUsername())).findFirst();
        if (doc.isPresent()) {
            doctorService.saveSchedule(doc.get().getUserId(), slotDuration, schedules);
        }
        return ResponseEntity.ok(Map.of("message", "Schedule saved"));
    }
}
