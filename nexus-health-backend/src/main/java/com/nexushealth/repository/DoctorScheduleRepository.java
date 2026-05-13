package com.nexushealth.repository;

import com.nexushealth.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {
    List<DoctorSchedule> findByDoctorIdAndIsActiveTrue(UUID doctorId);
    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(UUID doctorId, String dayOfWeek);
    void deleteByDoctorId(UUID doctorId);
}
