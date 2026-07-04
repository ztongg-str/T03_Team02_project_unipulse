import pool from '../config/database.js';

const run = async () => {
  const [rows] = await pool.query("SELECT id, username, email, role FROM users WHERE role IN ('admin','superadmin','developer','coordinator')");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
};
run();
