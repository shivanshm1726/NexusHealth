-- V5: Consultations table for Video Calls

CREATE TABLE consultations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id    UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    start_time        TIMESTAMP,
    end_time          TIMESTAMP,
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes             TEXT,
    prescription      TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_consultation_status CHECK (status IN ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_consultations_appointment ON consultations(appointment_id);
