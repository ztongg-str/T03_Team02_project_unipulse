import pool from '../../config/database.js';

export const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.username as reporterName
     FROM reports r JOIN users u ON r.reporterId = u.id WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const findAll = async ({ status, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];
  if (status) {
    where += ' AND r.status = ?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT r.*, u.username as reporterName
     FROM reports r JOIN users u ON r.reporterId = u.id
     WHERE ${where} ORDER BY r.createdAt DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM reports r WHERE ${where}`, params
  );
  return { reports: rows, total: countResult[0].total };
};

export const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO reports (reporterId, targetType, targetId, reason, description) VALUES (?, ?, ?, ?, ?)',
    [data.reporterId, data.targetType, data.targetId, data.reason, data.description || null]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE reports SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const remove = async (id) => {
  await pool.query('DELETE FROM reports WHERE id = ?', [id]);
};
