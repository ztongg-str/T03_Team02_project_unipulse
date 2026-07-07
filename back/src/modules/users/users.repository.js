import pool from '../../config/database.js';

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, fullName, role, status, avatar, cover_image, bio, interests, xp, level, createdAt FROM users WHERE id = ?',
    [id]
  );
  const user = rows[0] || null;
  if (user && typeof user.interests === 'string') {
    try { user.interests = JSON.parse(user.interests); } catch { user.interests = []; }
  }
  return user;
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
    `SELECT id, username, email, fullName, role, status, avatar, cover_image, bio, xp, level, createdAt
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
    `INSERT INTO users (username, email, password, fullName, role, status, isVerified)
     VALUES (?, ?, ?, ?, ?, 'active', ?)`,
    [username, email, password, fullName, role, true]
  );
  return result.insertId;
};

export const countAdmins = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as total FROM users WHERE role IN ('superadmin','developer','coordinator')"
  );
  return rows[0].total;
};

export const addXp = async (userId, amount) => {
  const [rows] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  if (!rows[0]) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  let { xp, level } = rows[0];
  xp += amount;
  let leveledUp = false;

  while (xp >= level * 100) {
    xp -= level * 100;
    level++;
    leveledUp = true;
  }

  await pool.query('UPDATE users SET xp = ?, level = ? WHERE id = ?', [xp, level, userId]);
  return { leveledUp, newLevel: level, newXp: xp };
};

export const remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
};
