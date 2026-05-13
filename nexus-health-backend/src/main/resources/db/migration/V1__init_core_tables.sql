-- V1: Core tables — users, doctor_profiles, patient_profiles
-- Using VARCHAR for enum columns instead of PostgreSQL custom types.
-- WHY: JPA's @Enumerated(STRING) sends strings, which PostgreSQL custom enums
-- reject without explicit casting. VARCHAR is simpler and more portable.

-- ============================================================
-- USERS TABLE
-- Central auth table. Kept lean — only auth + identity fields.
-- Role-specific data lives in profile extension tables.
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20)  NOT NULL DEFAULT 'PATIENT',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    -- Enforce valid role values at DB level
    CONSTRAINT chk_user_role CHECK (role IN ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'))
);

-- Index on email for fast login lookups
CREATE INDEX idx_users_email ON users(email);
-- Index on role for filtering (e.g., "get all doctors")
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- DOCTOR_PROFILES TABLE
-- Extension of users for role=DOCTOR.
-- 1:1 relationship with users table.
-- WHY separate? Avoids nullable columns in users table.
-- ============================================================
CREATE TABLE doctor_profiles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization        VARCHAR(255) NOT NULL,
    qualification         VARCHAR(500),
    bio                   TEXT,
    consultation_fee      DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    is_available_online   BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_profiles_specialization ON doctor_profiles(specialization);

-- ============================================================
-- PATIENT_PROFILES TABLE
-- Extension of users for role=PATIENT.
-- ============================================================
CREATE TABLE patient_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth     DATE,
    gender            VARCHAR(10),
    address           TEXT,
    blood_group       VARCHAR(5),
    medical_history   TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER') OR gender IS NULL)
);

CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);

-- ============================================================
-- REFRESH_TOKENS TABLE
-- Stores refresh tokens for JWT rotation.
-- WHY in DB? Allows server-side revocation (e.g., logout, compromised token).
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Seed a default admin user (password: Admin@123, BCrypt-12 hashed)
INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
VALUES ('admin@nexushealth.com', '$2a$12$LJ3a4FKHEQl9xqM5sBPPxOzQwTR5a/MWj6qXUkX5YxKxkqzHVZWHm', 'System Admin', '9999999999', 'ADMIN', TRUE);
