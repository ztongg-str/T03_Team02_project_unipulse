import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM activity_logs WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
    [userId]
  );
  return rows;
};

export const create = async (userId, action, details) => {
  await pool.query(
    'INSERT INTO activity_logs (userId, action, details) VALUES (?, ?, ?)',
    [userId, action, details || null]
  );
};
