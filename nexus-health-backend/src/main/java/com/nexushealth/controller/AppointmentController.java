package com.nexushealth.controller;

import com.nexushealth.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    public AppointmentController(AppointmentService as) { this.appointmentService = as; }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Authentication auth, @RequestBody Map<String, Object> body) {
        String email = auth.getName();
        UUID doctorId = UUID.fromString((String) body.get("doctorId"));
        LocalDate date = LocalDate.parse((String) body.get("appointmentDate"));
        String timeSlot = (String) body.get("timeSlot");
        String reason = (String) body.get("reason");
        String type = (String) body.getOrDefault("type", "ONLINE");
        BigDecimal amount = body.get("amount") != null ? new BigDecimal(body.get("amount").toString()) : null;

        Map<String, Object> result = appointmentService.createAppointment(email, doctorId, date, timeSlot, reason, type, amount);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyAppointments(Authentication auth) {
        return ResponseEntity.ok(appointmentService.getMyAppointments(auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        appointmentService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(Map.of("message", "Cancelled"));
    }
}
