package com.nexushealth.controller;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import com.nexushealth.service.AgoraTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final AgoraTokenService agoraTokenService;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @GetMapping("/video-token/{appointmentId}")
    public ResponseEntity<?> getVideoToken(@PathVariable UUID appointmentId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));


        // Security Check: Only the assigned patient or doctor can generate a token for this room
        if (!appointment.getPatient().getId().equals(user.getId()) && 
            !appointment.getDoctor().getId().equals(user.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You do not have permission to join this consultation."));
        }

        // We can add a check here to ensure the appointment is close to the start time
        // if (!"CONFIRMED".equals(appointment.getStatus())) {
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Appointment is not confirmed."));
        // }

        String channelName = appointmentId.toString();
        // Generate a numeric UID from the user's UUID (just using hashcode, making sure it's positive)
        int uid = Math.abs(user.getId().hashCode());
        if (uid == 0) uid = 1;

        String token = agoraTokenService.generateToken(channelName, uid);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "channelName", channelName,
                "uid", uid
        ));
    }
}
