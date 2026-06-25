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

export const expireUserUpcomingEvents = async (userId) => {
  const [expiredUpcoming] = await pool.query(
    `SELECT ue.id, ue.userId, ue.eventId, ue.registrationId
     FROM upcoming_events ue
     JOIN events e ON ue.eventId = e.id
     WHERE ue.userId = ? AND e.date <= NOW()`,
    [userId]
  );

  if (expiredUpcoming.length === 0) return [];

  const movedIds = [];
  for (const row of expiredUpcoming) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT IGNORE INTO past_event_history (userId, eventId, registrationId, attended, xpEarned, status)
         VALUES (?, ?, ?, FALSE, 0, 'missed')`,
        [row.userId, row.eventId, row.registrationId]
      );
      await conn.query(
        'DELETE FROM upcoming_events WHERE id = ?',
        [row.id]
      );
      await conn.commit();
      movedIds.push(row.id);
    } catch {
      await conn.rollback();
    } finally {
      conn.release();
    }
  }
  return movedIds;
};

export const removeUpcoming = async (userId, eventId) => {
  await pool.query(
    'DELETE FROM upcoming_events WHERE userId = ? AND eventId = ?',
    [userId, eventId]
  );
};
