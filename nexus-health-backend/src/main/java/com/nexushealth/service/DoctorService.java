package com.nexushealth.service;

import com.nexushealth.dto.response.DoctorResponse;
import com.nexushealth.entity.DoctorProfile;
import com.nexushealth.entity.DoctorSchedule;
import com.nexushealth.entity.User;
import com.nexushealth.entity.enums.AppointmentStatus;
import com.nexushealth.exception.ResourceNotFoundException;
import com.nexushealth.repository.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public DoctorService(
        DoctorProfileRepository dpr,
        DoctorScheduleRepository dsr,
        AppointmentRepository ar,
        UserRepository ur
    ) {
        this.doctorProfileRepository = dpr;
        this.scheduleRepository = dsr;
        this.appointmentRepository = ar;
        this.userRepository = ur;
    }

    public List<DoctorResponse> getApprovedDoctors() {
        return doctorProfileRepository
            .findAllApprovedDoctors()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public DoctorResponse getDoctorByUserId(UUID userId) {
        DoctorProfile dp = doctorProfileRepository
            .findByUserId(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "userId", userId)
            );
        return toResponse(dp);
    }

    public List<Map<String, Object>> getAvailableSlots(
        UUID doctorId,
        LocalDate date
    ) {
        String day = date
            .getDayOfWeek()
            .getDisplayName(TextStyle.FULL, Locale.ENGLISH)
            .toUpperCase();
        Optional<DoctorSchedule> scheduleOpt =
            scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, day);
        if (
            scheduleOpt.isEmpty() || !scheduleOpt.get().getIsActive()
        ) return Collections.emptyList();

        DoctorSchedule schedule = scheduleOpt.get();
        List<Map<String, Object>> slots = new ArrayList<>();
        LocalTime current = schedule.getStartTime();
        LocalTime end = schedule.getEndTime();

        // Get booked slots for this doctor on this date
        var booked =
            appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusNot(
                doctorId,
                date,
                AppointmentStatus.CANCELLED
            );
        Set<LocalTime> bookedTimes = new HashSet<>();
        booked.forEach(a -> bookedTimes.add(a.getTimeSlot()));

        while (current.isBefore(end)) {
            Map<String, Object> slot = new HashMap<>();
            slot.put("time", current.toString());
            slot.put("available", !bookedTimes.contains(current));
            slots.add(slot);
            current = current.plusMinutes(schedule.getSlotDurationMinutes());
        }
        return slots;
    }

    @Transactional
    public void saveSchedule(
        UUID doctorId,
        int slotDuration,
        List<Map<String, Object>> schedules
    ) {
        User doctor = userRepository
            .findById(doctorId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "id", doctorId)
            );
        scheduleRepository.deleteByDoctorId(doctorId);
        scheduleRepository.flush(); // ensure DELETE is sent to DB before INSERT to avoid unique-constraint violation

        for (Map<String, Object> s : schedules) {
            DoctorSchedule ds = DoctorSchedule.builder()
                .doctor(doctor)
                .dayOfWeek((String) s.get("dayOfWeek"))
                .startTime(LocalTime.parse((String) s.get("startTime")))
                .endTime(LocalTime.parse((String) s.get("endTime")))
                .slotDurationMinutes(slotDuration)
                .isActive(true)
                .build();
            scheduleRepository.save(ds);
        }
    }

    public List<DoctorResponse> getPendingDoctors() {
        return doctorProfileRepository
            .findByIsApprovedFalse()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public void approveDoctor(UUID profileId) {
        DoctorProfile dp = doctorProfileRepository
            .findById(profileId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "id", profileId)
            );
        dp.setIsApproved(true);
        doctorProfileRepository.save(dp);
    }

    /** Reject a pending doctor: removes their doctor profile. User account stays intact. */
    @Transactional
    public void rejectDoctor(UUID profileId) {
        DoctorProfile dp = doctorProfileRepository
            .findById(profileId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "id", profileId)
            );
        doctorProfileRepository.delete(dp);
    }

    /** Soft-delete an approved doctor: deactivates the user account so they cannot log in
     *  and no longer appear in the approved doctors list. Preserves appointment history. */
    @Transactional
    public void deleteDoctor(UUID profileId) {
        DoctorProfile dp = doctorProfileRepository
            .findById(profileId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Doctor", "id", profileId)
            );
        User user = dp.getUser();
        user.setIsActive(false);
        userRepository.save(user);
    }

    private DoctorResponse toResponse(DoctorProfile dp) {
        User u = dp.getUser();
        return DoctorResponse.builder()
            .id(dp.getId())
            .userId(u.getId())
            .fullName(u.getFullName())
            .email(u.getEmail())
            .phone(u.getPhone())
            .specialization(dp.getSpecialization())
            .qualification(dp.getQualification())
            .bio(dp.getBio())
            .consultationFee(dp.getConsultationFee())
            .isAvailableOnline(dp.getIsAvailableOnline())
            .isApproved(dp.getIsApproved())
            .build();
    }
}
