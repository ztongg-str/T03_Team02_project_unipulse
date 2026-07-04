import pool from '../../config/database.js';

export const findByUserAndEvent = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT * FROM registrations WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
  return rows[0] || null;
};

export const updateStatus = async (userId, eventId) => {
  const [result] = await pool.query(
    `UPDATE registrations SET status = 'Attended', attended_at = NOW() WHERE userId = ? AND eventId = ?`,
    [userId, eventId]
  );
  return result.affectedRows;
};

export const findEventById = async (eventId) => {
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
  return rows[0] || null;
};

export const findPastHistory = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT * FROM past_event_history WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
  return rows[0] || null;
};

export const createPastHistory = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO past_event_history (userId, eventId, registrationId, attended, xpEarned, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.userId, data.eventId, data.registrationId, data.attended, data.xpEarned, data.status]
  );
  return result.insertId;
};

export const updatePastHistory = async (userId, eventId, data) => {
  await pool.query(
    `UPDATE past_event_history SET attended = ?, xpEarned = ?, status = ? WHERE userId = ? AND eventId = ?`,
    [data.attended, data.xpEarned, data.status, userId, eventId]
  );
};

export const removeUpcoming = async (userId, eventId) => {
  await pool.query(
    'DELETE FROM upcoming_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
};

export const findByCheckinCode = async (code) => {
  const [rows] = await pool.query(
    'SELECT * FROM events WHERE checkin_code = ?',
    [code]
  );
  return rows[0] || null;
};

export const getRegistrationsWithStatus = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.userId, r.eventId, r.status, r.attended_at, r.createdAt as registeredAt,
            e.title, e.description, e.date, e.location, e.category, e.image, e.status as eventStatus
     FROM registrations r
     JOIN events e ON r.eventId = e.id
     WHERE r.userId = ?
     ORDER BY e.date DESC`,
    [userId]
  );
  return rows;
};
