import pool from '../../config/database.js';

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, fullName, role, status, avatar, cover_image, bio, createdAt FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const findAll = async ({ page = 1, limit = 20, role, status, search }) => {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (role) {
    where += ' AND role = ?';
    params.push(role);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (username LIKE ? OR fullName LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const [rows] = await pool.query(
    `SELECT id, username, email, fullName, role, status, avatar, cover_image, createdAt
     FROM users WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM users WHERE ${where}`,
    params
  );

  return { users: rows, total: countResult[0].total };
};

export const create = async ({ username, email, password, fullName, role }) => {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password, fullName, role, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [username, email, password, fullName, role]
  );
  return result.insertId;
};

export const countAdmins = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as total FROM users WHERE role IN ('superadmin','developer','coordinator')"
  );
  return rows[0].total;
};

export const remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
};
