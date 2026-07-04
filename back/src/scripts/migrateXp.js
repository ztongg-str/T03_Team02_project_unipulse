import pool from '../config/database.js';

const run = async () => {
  try {
    const [colCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = (SELECT DATABASE()) AND TABLE_NAME = 'users' AND COLUMN_NAME = 'xp'"
    );
    if (colCheck.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN xp INT NOT NULL DEFAULT 0 AFTER bio");
      console.log('Added xp column to users');
    } else {
      console.log('xp column already exists');
    }

    const [levelCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = (SELECT DATABASE()) AND TABLE_NAME = 'users' AND COLUMN_NAME = 'level'"
    );
    if (levelCheck.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN level INT NOT NULL DEFAULT 1 AFTER xp");
      console.log('Added level column to users');
    } else {
      console.log('level column already exists');
    }

    const [pastCheck] = await pool.query(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = (SELECT DATABASE()) AND TABLE_NAME = 'past_event_history' AND COLUMN_NAME = 'xpEarned'"
    );
    if (pastCheck.length === 0) {
      await pool.query("ALTER TABLE past_event_history ADD COLUMN xpEarned INT NOT NULL DEFAULT 0");
      console.log('Added xpEarned column to past_event_history');
    } else {
      console.log('xpEarned column already exists');
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

run();
