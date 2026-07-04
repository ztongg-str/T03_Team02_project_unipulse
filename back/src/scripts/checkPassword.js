import pool from '../config/database.js';
import { comparePassword } from '../utils/password.js';

const run = async () => {
  const [rows] = await pool.query('SELECT id, email, password, role FROM users WHERE id = 15');
  const user = rows[0];
  console.log('User:', user.email);
  console.log('Password hash:', user.password);
  const tests = ['password123', 'password', 'Pass12345', 'Admin@12345', '123456', 'Password1'];
  for (const pwd of tests) {
    const match = await comparePassword(pwd, user.password);
    if (match) {
      console.log('FOUND PASSWORD:', pwd);
      process.exit(0);
    }
  }
  console.log('Password not found in common list');
  process.exit(0);
};
run();
