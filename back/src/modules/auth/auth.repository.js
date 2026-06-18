import pool from '../../config/database.js';

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, email, fullName, role, avatar, createdAt FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

export const createUser = async ({ username, email, password, fullName, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)',
    [username, email, password, fullName, role]
  );
  return result.insertId;
};
