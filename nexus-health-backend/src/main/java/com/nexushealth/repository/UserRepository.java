package com.nexushealth.repository;

import com.nexushealth.entity.User;
import com.nexushealth.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA auto-generates the SQL for these method signatures.
 * 
 * WHY interface-only: Spring creates a proxy implementation at runtime
 * based on method names. findByEmail → SELECT * FROM users WHERE email = ?
 * No boilerplate SQL needed.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndIsActiveTrue(Role role);
}
