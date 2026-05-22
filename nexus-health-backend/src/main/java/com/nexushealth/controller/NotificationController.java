package com.nexushealth.controller;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AppointmentRepository appointmentRepository;

    @Data
    public static class WaitingRoomNotification {
        private UUID appointmentId;
        private String patientName;
        private String message;
        private String type;
    }

    @PostMapping("/{id}/notify-doctor")
    public ResponseEntity<?> notifyDoctorPatientJoined(@PathVariable UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();

        WaitingRoomNotification notification = new WaitingRoomNotification();
        notification.setAppointmentId(appointment.getId());
        notification.setPatientName(patient.getFullName());
        notification.setMessage("Patient " + patient.getFullName() + " has joined the virtual waiting room.");
        notification.setType("WAITING_ROOM_JOIN");

        // Send to doctor: User destinations are routed via username (email)
        messagingTemplate.convertAndSendToUser(
                doctor.getEmail(),
                "/queue/notifications",
                notification
        );

        return ResponseEntity.ok(Map.of("success", true, "message", "Doctor notified"));
    }
}
