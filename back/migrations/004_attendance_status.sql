ALTER TABLE registrations
ADD COLUMN status ENUM('Registered', 'Attended', 'Missing') NOT NULL DEFAULT 'Registered' AFTER eventId,
ADD COLUMN attended_at TIMESTAMP NULL DEFAULT NULL AFTER status;
