import pool from '../config/database.js';

const run = async () => {
  try {
    await pool.query("ALTER TABLE events MODIFY COLUMN status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    console.log('Done - status column updated');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
};

run();
