import pool from '../config/database.js';

const run = async () => {
  try {
    console.log('Adding interests column to users table...');
    await pool.query(`ALTER TABLE users
      ADD COLUMN interests JSON DEFAULT NULL AFTER bio`);
    console.log('Column added. Setting default values...');
    await pool.query(`UPDATE users SET interests = JSON_ARRAY() WHERE interests IS NULL`);
    console.log('Done!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists — skipping.');
    } else {
      console.error('Migration failed:', err.message);
    }
  }
  process.exit(0);
};

run();
