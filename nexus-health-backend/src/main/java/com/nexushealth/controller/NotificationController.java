package com.nexushealth.controller;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.User;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class NotificationController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    /**
     * Called by the patient's browser when they join the video call.
     * Sets patientJoined=true on the appointment so the doctor can detect it via polling.
     */
    @PostMapping("/{id}/notify-doctor")
    @Transactional
    public ResponseEntity<?> notifyDoctorPatientJoined(@PathVariable UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setPatientJoined(true);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of("success", true, "message", "Doctor notified"));
    }

    /**
     * Polling endpoint: Doctor's browser calls this every few seconds.
     * Returns a list of appointment IDs where patients have joined the waiting room.
     */
    @GetMapping("/waiting-patients")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getWaitingPatients(@AuthenticationPrincipal UserDetails userDetails) {
        User doctor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Appointment> waitingAppointments = appointmentRepository
                .findByDoctorIdAndPatientJoinedTrue(doctor.getId())
                .stream()
                .filter(a -> a.getStatus() != com.nexushealth.entity.enums.AppointmentStatus.COMPLETED 
                          && a.getStatus() != com.nexushealth.entity.enums.AppointmentStatus.CANCELLED)
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Appointment apt : waitingAppointments) {
            result.add(Map.of(
                    "appointmentId", apt.getId(),
                    "patientName", apt.getPatient().getFullName(),
                    "message", "Patient " + apt.getPatient().getFullName() + " has joined the virtual waiting room."
            ));
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Called when doctor acknowledges / joins the call — resets the flag.
     */
    @PostMapping("/{id}/clear-waiting")
    @Transactional
    public ResponseEntity<?> clearWaiting(@PathVariable UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setPatientJoined(false);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
