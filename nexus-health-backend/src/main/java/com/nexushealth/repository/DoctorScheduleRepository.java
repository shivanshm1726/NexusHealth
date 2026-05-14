package com.nexushealth.repository;

import com.nexushealth.entity.DoctorSchedule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorScheduleRepository
    extends JpaRepository<DoctorSchedule, UUID>
{
    List<DoctorSchedule> findByDoctorIdAndIsActiveTrue(UUID doctorId);
    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(
        UUID doctorId,
        String dayOfWeek
    );

    @Modifying
    @Query("DELETE FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId")
    void deleteByDoctorId(UUID doctorId);
}
