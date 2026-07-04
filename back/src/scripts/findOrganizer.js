import pool from '../config/database.js';

const run = async () => {
  const [rows] = await pool.query('SELECT id, username, email, fullName, role FROM users WHERE id = 15');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
};
run();
