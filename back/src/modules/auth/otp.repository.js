import pool from '../../config/database.js';

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

export const createUser = async ({ username, email, password, fullName }) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, fullName) VALUES (?, ?, ?, ?)',
    [username, email, password, fullName]
  );
  return result.insertId;
};

export const updateOtp = async (email, otp, otpExpiresAt) => {
  await pool.query(
    'UPDATE users SET otp = ?, otpExpiresAt = ? WHERE email = ?',
    [otp, otpExpiresAt, email]
  );
};

export const verifyUser = async (email) => {
  await pool.query(
    "UPDATE users SET isVerified = TRUE, otp = NULL, otpExpiresAt = NULL WHERE email = ?",
    [email]
  );
};

export const updatePassword = async (email, hashedPassword) => {
  await pool.query(
    'UPDATE users SET password = ? WHERE email = ?',
    [hashedPassword, email]
  );
};
