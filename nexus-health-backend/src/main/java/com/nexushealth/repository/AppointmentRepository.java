package com.nexushealth.repository;

import com.nexushealth.entity.Appointment;
import com.nexushealth.entity.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
    List<Appointment> findByDoctorId(UUID doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(UUID doctorId, LocalDate date, AppointmentStatus status);
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(UUID doctorId, LocalDate date, LocalTime slot, AppointmentStatus status);
}
