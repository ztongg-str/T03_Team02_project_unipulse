import pool from '../../config/database.js';

export const findAll = async ({ page = 1, limit = 20, category, status, search }, user) => {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (title LIKE ? OR description LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const [rows] = await pool.query(
    `SELECT e.*, u.fullName as organizerName
     FROM events e JOIN users u ON e.organizerId = u.id
     WHERE ${where} ORDER BY e.date DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM events e WHERE ${where}`, params
  );

  return { events: rows, total: countResult[0].total };
};

export const findUpcoming = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT e.*, u.fullName as organizerName
     FROM events e JOIN users u ON e.organizerId = u.id
     WHERE e.date >= NOW() AND e.status = 'approved'
     ORDER BY e.date ASC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
};

export const findByOrganizer = async (organizerId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT e.*, u.fullName as organizerName
     FROM events e JOIN users u ON e.organizerId = u.id
     WHERE e.organizerId = ? ORDER BY e.createdAt DESC LIMIT ? OFFSET ?`,
    [organizerId, Number(limit), Number(offset)]
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.fullName as organizerName
     FROM events e JOIN users u ON e.organizerId = u.id WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO events (title, description, date, location, category, maxParticipants, image, organizerId, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [data.title, data.description, data.date, data.location, data.category, data.maxParticipants, data.image || null, data.organizerId]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE events SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const remove = async (id) => {
  await pool.query('DELETE FROM events WHERE id = ?', [id]);
};
