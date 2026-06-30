-- Migration: Admin Module (Users Management, Event Verification, Backup & Recovery)
-- Run this once against the existing `unipulse` database:
--   mysql -h <host> -P <port> -u <user> -p unipulse < migrations/001_admin_module.sql
-- Safe to run on an existing populated database — only adds columns/tables, does not drop data.

USE unipulse_db;

-- 1. Add 'admin' role and an account status (for suspend/activate) to users
ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'organizer', 'admin') NOT NULL DEFAULT 'student';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status ENUM('active', 'suspended') NOT NULL DEFAULT 'active' AFTER role;

-- 2. Event verification: allow 'rejected' status + track who verified it and why
ALTER TABLE events
  MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS rejectionReason VARCHAR(500) DEFAULT NULL AFTER status,
  ADD COLUMN IF NOT EXISTS verifiedBy INT DEFAULT NULL AFTER organizerId,
  ADD COLUMN IF NOT EXISTS verifiedAt TIMESTAMP NULL DEFAULT NULL AFTER verifiedBy,
  ADD CONSTRAINT fk_events_verifiedBy FOREIGN KEY (verifiedBy) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Backup history (tracks both manual and scheduled backups)
CREATE TABLE IF NOT EXISTS backups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  type ENUM('full', 'tables', 'rows') NOT NULL DEFAULT 'full',
  scope TEXT DEFAULT NULL COMMENT 'JSON description of what was backed up (table names / row ids)',
  sizeBytes BIGINT DEFAULT NULL,
  trigger_type ENUM('manual', 'scheduled') NOT NULL DEFAULT 'manual',
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  errorMessage VARCHAR(500) DEFAULT NULL,
  createdBy INT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_backups_createdAt ON backups(createdAt);
