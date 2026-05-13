package com.nexushealth.security;

import com.nexushealth.entity.User;
import com.nexushealth.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Bridge between our User entity and Spring Security's UserDetails.
 * 
 * WHY this class: Spring Security doesn't know about our User entity.
 * It expects a UserDetails object. This service loads our User from DB
 * and wraps it in a UserDetails implementation that Spring Security understands.
 * 
 * Called automatically by Spring Security's authentication manager
 * when processing login requests.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Spring Security calls this with the "username" (we use email).
     * Must return a UserDetails with: username, password, authorities.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + email));

        // Convert our Role enum to Spring Security's GrantedAuthority
        // Prefix with "ROLE_" is Spring Security convention for hasRole() checks
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.getIsActive(),     // enabled
                true,                   // accountNonExpired
                true,                   // credentialsNonExpired
                true,                   // accountNonLocked
                authorities
        );
    }
}
