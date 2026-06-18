import pool from '../../config/database.js';

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, fullName, role, avatar, bio, createdAt FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const findAll = async ({ page = 1, limit = 20, role, search }) => {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (role) {
    where += ' AND role = ?';
    params.push(role);
  }
  if (search) {
    where += ' AND (username LIKE ? OR fullName LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const [rows] = await pool.query(
    `SELECT id, username, email, fullName, role, avatar, createdAt FROM users WHERE ${where} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM users WHERE ${where}`,
    params
  );

  return { users: rows, total: countResult[0].total };
};
