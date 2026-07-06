import pool from '../config/database.js';

const sql = `CREATE TABLE IF NOT EXISTS admin_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
)`;

try {
  await pool.query(sql);
  console.log('admin_credentials table created');
} catch (e) {
  console.error('Failed:', e.message);
}
process.exit(0);
