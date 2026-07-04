ALTER TABLE events
ADD COLUMN checkin_code VARCHAR(6) DEFAULT NULL AFTER organizerId,
ADD INDEX idx_events_checkin_code (checkin_code);

-- Generate unique check-in codes for existing events using their IDs
UPDATE events SET checkin_code = RIGHT(CONCAT('000000', id), 6) WHERE checkin_code IS NULL;

ALTER TABLE events MODIFY COLUMN checkin_code VARCHAR(6) NOT NULL,
ADD UNIQUE INDEX uq_events_checkin_code (checkin_code);
