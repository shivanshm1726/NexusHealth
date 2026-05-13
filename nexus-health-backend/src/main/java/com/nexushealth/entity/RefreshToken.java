package com.nexushealth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Refresh token entity for JWT rotation.
 * 
 * WHY store in DB: Unlike access tokens (which are stateless),
 * refresh tokens need server-side tracking so we can:
 * 1. Revoke them on logout
 * 2. Detect token reuse (potential theft)
 * 3. Enforce single-session or limited-session policies
 */
@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * WHY @PrePersist instead of @CreationTimestamp with @Builder:
     * Lombok's @Builder sets all fields (including createdAt) in the constructor.
     * @CreationTimestamp only works if the field is null when Hibernate persists.
     * @PrePersist is a JPA lifecycle callback that fires right before INSERT,
     * guaranteeing the timestamp is set regardless of how the object was constructed.
     */
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
}
