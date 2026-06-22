// One-time script to create the first System Admin account.
// Admins are never created through public signup — only the System Admin
// (seeded here) or an existing admin (via the Users Management screen) can
// create more admin/organizer accounts.
//
// Usage:
//   cd back
//   node src/scripts/seedAdmin.js
//
// Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_USERNAME / ADMIN_FULLNAME from
// .env if present, otherwise falls back to the defaults below (change the
// password after first login).

import pool from '../config/database.js';
import env from '../config/env.js';
import { hashPassword } from '../utils/password.js';
import logger from '../config/logger.js';

const username = process.env.ADMIN_USERNAME || 'admin';
const email = process.env.ADMIN_EMAIL || 'admin@unipulse.edu';
const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
const fullName = process.env.ADMIN_FULLNAME || 'System Admin';

const run = async () => {
  try {
    // ── Ensure schema supports admin role ──────────────────────────
    await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('student', 'organizer', 'admin') NOT NULL DEFAULT 'student'`);
    logger.info('Migrated: added admin role to users.role enum');

    // Check if status column exists before adding it
    const [colCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'",
      [env.db.name]
    );
    if (colCheck.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN \`status\` ENUM('active', 'suspended') NOT NULL DEFAULT 'active' AFTER role`);
      logger.info('Migrated: added status column to users');
    }

    await pool.query(`ALTER TABLE events MODIFY COLUMN \`status\` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'`);
    logger.info('Migrated: added rejected status to events.status enum');

    const [evColCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events' AND COLUMN_NAME = 'rejectionReason'",
      [env.db.name]
    );
    if (evColCheck.length === 0) {
      await pool.query(`ALTER TABLE events ADD COLUMN rejectionReason VARCHAR(500) DEFAULT NULL AFTER \`status\``);
      await pool.query(`ALTER TABLE events ADD COLUMN verifiedBy INT DEFAULT NULL AFTER organizerId`);
      await pool.query(`ALTER TABLE events ADD COLUMN verifiedAt TIMESTAMP NULL DEFAULT NULL AFTER verifiedBy`);
      logger.info('Migrated: added event verification columns');
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS backups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      type ENUM('full', 'tables', 'rows') NOT NULL DEFAULT 'full',
      scope TEXT DEFAULT NULL,
      sizeBytes BIGINT DEFAULT NULL,
      trigger_type ENUM('manual', 'scheduled') NOT NULL DEFAULT 'manual',
      status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
      errorMessage VARCHAR(500) DEFAULT NULL,
      createdBy INT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    )`);
    logger.info('Migrated: created backups table');

    // ── Seed the admin account ─────────────────────────────────────
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existing.length > 0) {
      logger.info('An admin account already exists. Skipping seed.');
      process.exit(0);
    }

    const [emailTaken] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailTaken.length > 0) {
      logger.error(`Email ${email} is already in use by another account. Aborting.`);
      process.exit(1);
    }

    const hashed = await hashPassword(password);
    await pool.query(
      `INSERT INTO users (username, email, password, fullName, role, status)
       VALUES (?, ?, ?, ?, 'admin', 'active')`,
      [username, email, hashed, fullName]
    );

    logger.info('System Admin account created successfully.');
    logger.info(`  Email:    ${email}`);
    logger.info(`  Password: ${password}`);
    logger.info('Please log in and change this password immediately.');
    process.exit(0);
  } catch (err) {
    logger.error('Failed to seed admin account:', err.message);
    process.exit(1);
  }
};

run();
