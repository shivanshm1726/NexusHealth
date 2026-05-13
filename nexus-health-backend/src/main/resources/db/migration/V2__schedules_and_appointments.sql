-- V2: Doctor schedules and appointments tables

CREATE TABLE doctor_schedules (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week           VARCHAR(10) NOT NULL,
    start_time            TIME NOT NULL,
    end_time              TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_day CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
    CONSTRAINT uq_doctor_day UNIQUE (doctor_id, day_of_week)
);

CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);

CREATE TABLE appointments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES users(id),
    doctor_id         UUID NOT NULL REFERENCES users(id),
    booked_by         UUID NOT NULL REFERENCES users(id),
    appointment_date  DATE NOT NULL,
    time_slot         TIME NOT NULL,
    type              VARCHAR(10) NOT NULL DEFAULT 'ONLINE',
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    reason            TEXT NOT NULL,
    priority          VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    notes             TEXT,
    amount            DECIMAL(10,2),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_apt_type CHECK (type IN ('ONLINE', 'OFFLINE')),
    CONSTRAINT chk_apt_status CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW')),
    CONSTRAINT chk_apt_priority CHECK (priority IN ('NORMAL', 'URGENT')),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, time_slot)
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
