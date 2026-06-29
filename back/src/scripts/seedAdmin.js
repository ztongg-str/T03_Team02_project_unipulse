// One-time script to create the initial admin accounts.
// Admins are never created through public signup — only seeded here or
// created by a superadmin via the Users Management screen.
//
// Usage:
//   cd back
//   node src/scripts/seedAdmin.js
//
// Reads env vars for credentials, or falls back to defaults below.
// Change passwords after first login!

import pool from '../config/database.js';
import env from '../config/env.js';
import { hashPassword } from '../utils/password.js';
import logger from '../config/logger.js';

const accounts = [
  {
    username:  process.env.SUPERADMIN_USERNAME || 'superadmin',
    email:     process.env.SUPERADMIN_EMAIL    || 'superadmin@unipulse.edu',
    password:  process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
    fullName:  process.env.SUPERADMIN_FULLNAME || 'System Super Admin',
    role:      'superadmin',
  },
  {
    username:  process.env.DEV_USERNAME || 'developer',
    email:     process.env.DEV_EMAIL    || 'developer@unipulse.edu',
    password:  process.env.DEV_PASSWORD || 'Developer@123',
    fullName:  process.env.DEV_FULLNAME || 'System Developer',
    role:      'developer',
  },
  {
    username:  process.env.COORD_USERNAME || 'coordinator',
    email:     process.env.COORD_EMAIL    || 'coordinator@unipulse.edu',
    password:  process.env.COORD_PASSWORD || 'Coordinator@123',
    fullName:  process.env.COORD_FULLNAME || 'Event Co-Ordinator',
    role:      'coordinator',
  },
];

const run = async () => {
  try {
    // ── Ensure schema supports all admin sub-roles ──────────────────────────
    await pool.query(
      `ALTER TABLE users MODIFY COLUMN role
       ENUM('student','organizer','superadmin','developer','coordinator')
       NOT NULL DEFAULT 'student'`
    );
    logger.info('Migrated: ensured admin sub-roles in users.role enum');

    // status column
    const [colCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'",
      [env.db.name]
    );
    if (colCheck.length === 0) {
      await pool.query(
        `ALTER TABLE users ADD COLUMN \`status\` ENUM('active','suspended') NOT NULL DEFAULT 'active' AFTER role`
      );
      logger.info('Migrated: added status column to users');
    }

    // events columns
    await pool.query(
      `ALTER TABLE events MODIFY COLUMN \`status\` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`
    );
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

    // backups table
    await pool.query(`CREATE TABLE IF NOT EXISTS backups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      type ENUM('full','tables','rows') NOT NULL DEFAULT 'full',
      scope TEXT DEFAULT NULL,
      sizeBytes BIGINT DEFAULT NULL,
      trigger_type ENUM('manual','scheduled') NOT NULL DEFAULT 'manual',
      status ENUM('success','failed') NOT NULL DEFAULT 'success',
      errorMessage VARCHAR(500) DEFAULT NULL,
      createdBy INT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // query_logs table
    await pool.query(`CREATE TABLE IF NOT EXISTS query_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      adminId INT NOT NULL,
      query_text TEXT NOT NULL,
      affected INT DEFAULT NULL,
      status ENUM('success','error') NOT NULL DEFAULT 'success',
      errorMsg TEXT DEFAULT NULL,
      executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
    )`);
    logger.info('Migrated: ensured backups + query_logs tables');

    // ── Seed each account if not already present ────────────────────────────
    for (const acct of accounts) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [acct.email, acct.username]
      );
      if (existing.length > 0) {
        logger.info(`Account already exists — skipping: ${acct.email} (${acct.role})`);
        continue;
      }
      const hashed = await hashPassword(acct.password);
      await pool.query(
        `INSERT INTO users (username, email, password, fullName, role, status) VALUES (?, ?, ?, ?, ?, 'active')`,
        [acct.username, acct.email, hashed, acct.fullName, acct.role]
      );
      logger.info(`Created ${acct.role} account:`);
      logger.info(`  Email:    ${acct.email}`);
      logger.info(`  Password: ${acct.password}`);
    }

    logger.info('Seed complete. Change default passwords after first login!');
    process.exit(0);
  } catch (err) {
    logger.error('Seed failed:', err.message);
    process.exit(1);
  }
};

run();
