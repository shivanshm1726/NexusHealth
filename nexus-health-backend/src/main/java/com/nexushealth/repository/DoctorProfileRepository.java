package com.nexushealth.repository;

import com.nexushealth.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {

    Optional<DoctorProfile> findByUserId(UUID userId);

    /**
     * WHY custom query with JOIN FETCH: Fetching approved doctors
     * requires data from both users and doctor_profiles tables.
     * JOIN FETCH avoids N+1 query problem (loading user data separately
     * for each doctor profile).
     */
    @Query("SELECT dp FROM DoctorProfile dp JOIN FETCH dp.user u " +
           "WHERE dp.isApproved = true AND u.isActive = true")
    List<DoctorProfile> findAllApprovedDoctors();

    List<DoctorProfile> findByIsApprovedFalse();

    List<DoctorProfile> findBySpecializationIgnoreCase(String specialization);
}
