import pool from '../config/database.js';

const run = async () => {
  const [result] = await pool.query("UPDATE friends SET status = 'accepted' WHERE status = 'pending'");
  console.log('Updated ' + result.affectedRows + ' existing rows to accepted');
  process.exit(0);
};

run();
