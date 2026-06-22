import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.friendId as friendId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.friendId = u.id WHERE f.userId = ?
     UNION
     SELECT f.id, f.userId as friendId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.userId = u.id WHERE f.friendId = ?`,
    [userId, userId]
  );
  return rows;
};

export const searchUsers = async (query, excludeUserId) => {
  const [rows] = await pool.query(
    `SELECT id, username, fullName, avatar
     FROM users WHERE (username LIKE ? OR fullName LIKE ?) AND id != ? LIMIT 20`,
    [`%${query}%`, `%${query}%`, excludeUserId]
  );
  return rows;
};

export const findFriendship = async (userId, friendId) => {
  const [rows] = await pool.query(
    `SELECT * FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`,
    [userId, friendId, friendId, userId]
  );
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM friends WHERE id = ?', [id]);
  return rows[0] || null;
};

export const create = async (userId, friendId) => {
  const [result] = await pool.query(
    'INSERT INTO friends (userId, friendId) VALUES (?, ?)',
    [userId, friendId]
  );
  return result.insertId;
};

export const remove = async (id) => {
  await pool.query('DELETE FROM friends WHERE id = ?', [id]);
};
