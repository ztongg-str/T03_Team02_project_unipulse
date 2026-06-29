import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM streaks WHERE userId = ? ORDER BY updatedAt DESC',
    [userId]
  );
  return rows;
};

export const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT s.*, u.username, u.fullName
     FROM streaks s JOIN users u ON s.userId = u.id ORDER BY s.currentStreak DESC`
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM streaks WHERE id = ?', [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO streaks (userId, currentStreak, longestStreak) VALUES (?, ?, ?)',
    [data.userId, data.currentStreak || 1, data.longestStreak || 1]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE streaks SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const remove = async (id) => {
  await pool.query('DELETE FROM streaks WHERE id = ?', [id]);
};
