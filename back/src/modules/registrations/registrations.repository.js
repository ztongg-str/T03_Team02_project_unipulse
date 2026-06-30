import pool from '../../config/database.js';

export const findByUserAndEvent = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT * FROM registrations WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
  return rows[0] || null;
};

export const countByEvent = async (eventId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM registrations WHERE eventId = ?',
    [eventId]
  );
  return rows[0].count;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, e.title as eventTitle, u.fullName as userName
     FROM registrations r JOIN events e ON r.eventId = e.id JOIN users u ON r.userId = u.id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const create = async (userId, eventId) => {
  const [result] = await pool.query(
    'INSERT INTO registrations (userId, eventId) VALUES (?, ?)',
    [userId, eventId]
  );
  return result.insertId;
};

export const remove = async (id) => {
  await pool.query('DELETE FROM registrations WHERE id = ?', [id]);
};

export const removeByUserAndEvent = async (userId, eventId) => {
  await pool.query('DELETE FROM registrations WHERE userId = ? AND eventId = ?', [userId, eventId]);
};

export const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.*, e.title as eventTitle, e.date, e.location, e.category
     FROM registrations r JOIN events e ON r.eventId = e.id
     WHERE r.userId = ? ORDER BY r.createdAt DESC`,
    [userId]
  );
  return rows;
};

export const findByEvent = async (eventId) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.fullName, u.username, u.email
     FROM registrations r JOIN users u ON r.userId = u.id
     WHERE r.eventId = ? ORDER BY r.createdAt ASC`,
    [eventId]
  );
  return rows;
};
