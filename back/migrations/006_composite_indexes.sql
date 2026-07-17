-- Composite Index for Common Event Queries
--
-- WHAT THIS DOES:
-- Creates a composite index on events(status, date).
-- A composite index covers TWO columns at once, like a phonebook
-- sorted by (LastName, FirstName).
--
-- WHY WE NEED IT:
-- The most common query in the app is:
--   SELECT * FROM events WHERE status = 'approved' AND date >= NOW()
-- Without this index, MySQL can only use ONE of the separate indexes
-- (idx_events_status OR idx_events_date). With this composite index,
-- it uses both columns together for much faster lookups.

CREATE INDEX idx_events_status_date ON events(status, date);
