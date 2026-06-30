import pool from '../../config/database.js';

export const findAll = async (userId) => {
  const [rows] = await pool.query(
    `SELECT se.id as savedId, se.createdAt as savedAt,
            e.*, u.fullName as organizerName
     FROM saved_events se
     JOIN events e ON se.eventId = e.id
     JOIN users u ON e.organizerId = u.id
     WHERE se.userId = ?
     ORDER BY se.createdAt DESC`,
    [userId]
  );
  return rows;
};

export const findByUserAndEvent = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT * FROM saved_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
  return rows[0] || null;
};

export const create = async (userId, eventId) => {
  const [result] = await pool.query(
    'INSERT INTO saved_events (userId, eventId) VALUES (?, ?)',
    [userId, eventId]
  );
  return result.insertId;
};

export const remove = async (userId, eventId) => {
  await pool.query(
    'DELETE FROM saved_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
};
