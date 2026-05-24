-- Add a boolean flag to track when a patient has joined the video call waiting room
ALTER TABLE appointments ADD COLUMN patient_joined BOOLEAN NOT NULL DEFAULT FALSE;
