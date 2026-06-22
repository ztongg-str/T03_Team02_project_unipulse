import pool from '../../config/database.js';

export const findUpcomingByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT e.id, e.title, e.description, e.date, e.location, e.category,
            e.maxParticipants, e.image, r.id as registrationId,
            (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
     FROM registrations r
     JOIN events e ON r.eventId = e.id
     WHERE r.userId = ? AND e.date > NOW() AND e.status = 'approved'
     ORDER BY e.date ASC`,
    [userId]
  );
  return rows;
};

export const findExpiredRegistrations = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.id as registrationId, r.userId, r.eventId
     FROM registrations r
     JOIN events e ON r.eventId = e.id
     WHERE r.userId = ?
       AND e.date <= NOW()
       AND NOT EXISTS (
         SELECT 1 FROM past_event_history peh
         WHERE peh.userId = r.userId AND peh.eventId = r.eventId
       )`,
    [userId]
  );
  return rows;
};

export const moveRegistrationToPast = async (reg) => {
  const [result] = await pool.query(
    `INSERT INTO past_event_history (userId, eventId, registrationId, attended, xpEarned, status)
     VALUES (?, ?, ?, FALSE, 0, 'missed')`,
    [reg.userId, reg.eventId, reg.registrationId]
  );
  return result.insertId;
};

export const removeUpcomingRegistration = async (userId, eventId) => {
  await pool.query(
    'DELETE FROM upcoming_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
};

export const findPastByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT peh.id, peh.userId, peh.eventId, peh.registrationId,
            peh.attended, peh.xpEarned, peh.certificateIssued,
            peh.status, peh.createdAt as recordedAt,
            e.title, e.description, e.date, e.location, e.category, e.image
     FROM past_event_history peh
     JOIN events e ON peh.eventId = e.id
     WHERE peh.userId = ?
     ORDER BY e.date DESC`,
    [userId]
  );
  return rows;
};

export const findByUserAndEvent = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT * FROM past_event_history WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT peh.*, e.title, e.date, e.location, e.category, e.image
     FROM past_event_history peh
     JOIN events e ON peh.eventId = e.id
     WHERE peh.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO past_event_history (userId, eventId, registrationId, attended, xpEarned, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.userId, data.eventId, data.registrationId, data.attended, data.xpEarned, data.status]
  );
  return result.insertId;
};

export const removeUpcoming = async (userId, eventId) => {
  await pool.query(
    'DELETE FROM upcoming_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
};


