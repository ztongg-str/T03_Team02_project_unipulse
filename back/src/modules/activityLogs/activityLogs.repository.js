import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT al.*, e.title AS eventTitle
     FROM activity_logs al
     LEFT JOIN events e ON e.id = JSON_EXTRACT(al.details, '$.eventId')
     WHERE al.userId = ?
     ORDER BY al.createdAt DESC LIMIT 50`,
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
