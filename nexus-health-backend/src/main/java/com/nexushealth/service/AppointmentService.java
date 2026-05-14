package com.nexushealth.service;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.User;
import com.nexushealth.entity.enums.AppointmentStatus;
import com.nexushealth.entity.enums.AppointmentType;
import com.nexushealth.exception.BadRequestException;
import com.nexushealth.exception.ResourceNotFoundException;
import com.nexushealth.repository.AppointmentRepository;
import com.nexushealth.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository ar, UserRepository ur) {
        this.appointmentRepository = ar;
        this.userRepository = ur;
    }

    @Transactional
    public Map<String, Object> createAppointment(
        String patientEmail,
        UUID doctorId,
        LocalDate date,
        String timeSlot,
        String reason,
        String type,
        BigDecimal amount
    ) {
        User patient = userRepository
            .findByEmail(patientEmail)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "email", patientEmail)
            );
        User doctor = userRepository
            .findById(doctorId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "id", doctorId)
            );
        LocalTime slot = LocalTime.parse(timeSlot);

        if (
            appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                doctorId,
                date,
                slot,
                AppointmentStatus.CANCELLED
            )
        ) {
            throw new BadRequestException("This slot is already booked");
        }

        Appointment apt = Appointment.builder()
            .patient(patient)
            .doctor(doctor)
            .bookedBy(patient)
            .appointmentDate(date)
            .timeSlot(slot)
            .reason(reason)
            .type(AppointmentType.valueOf(type))
            .status(AppointmentStatus.PENDING_PAYMENT)
            .amount(amount != null ? amount : BigDecimal.valueOf(500))
            .build();
        apt = appointmentRepository.save(apt);

        return Map.of(
            "id",
            apt.getId(),
            "status",
            apt.getStatus(),
            "appointmentDate",
            apt.getAppointmentDate(),
            "timeSlot",
            apt.getTimeSlot(),
            "type",
            apt.getType(),
            "reason",
            apt.getReason(),
            "amount",
            apt.getAmount()
        );
    }

    public List<Map<String, Object>> getMyAppointments(String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new ResourceNotFoundException("User", "email", email)
            );
        List<Appointment> apts = switch (user.getRole()) {
            case DOCTOR -> appointmentRepository.findByDoctorId(user.getId());
            case PATIENT -> appointmentRepository.findByPatientId(user.getId());
            default -> appointmentRepository.findAll();
        };
        return apts.stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getAllAppointments() {
        return appointmentRepository
            .findAll()
            .stream()
            .map(this::toMap)
            .toList();
    }

    @Transactional
    public void updateStatus(UUID id, String status) {
        Appointment apt = appointmentRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Appointment", "id", id)
            );
        apt.setStatus(AppointmentStatus.valueOf(status));
        appointmentRepository.save(apt);
    }

    @Transactional
    public void cancelAppointment(UUID id) {
        Appointment apt = appointmentRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Appointment", "id", id)
            );
        apt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(apt);
    }

    private Map<String, Object> toMap(Appointment a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("patientId", a.getPatient().getId());
        m.put("doctorId", a.getDoctor().getId());
        m.put("patientName", a.getPatient().getFullName());
        m.put("appointmentDate", a.getAppointmentDate());
        m.put("timeSlot", a.getTimeSlot());
        m.put("type", a.getType());
        m.put("status", a.getStatus());
        m.put("reason", a.getReason());
        m.put("amount", a.getAmount());
        m.put("priority", a.getPriority());
        return m;
    }
}
