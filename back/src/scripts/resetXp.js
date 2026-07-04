import pool from '../config/database.js';

const run = async () => {
  const userId = 74;
  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);
  console.log('xptest user reset to xp=0, level=1');
  process.exit(0);
};
run();
