import pool from '../config/database.js';

const run = async () => {
  try {
    await pool.query("ALTER TABLE friends ADD COLUMN status ENUM('pending','accepted') DEFAULT 'pending' AFTER friendId");
    console.log('Done - added status column to friends table');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Status column already exists');
    } else {
      console.error('Error:', err.message);
    }
  }
  process.exit(0);
};

run();
