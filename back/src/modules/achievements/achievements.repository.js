import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT a.*, ua.earnedAt
     FROM achievements a JOIN user_achievements ua ON a.id = ua.achievementId
     WHERE ua.userId = ? ORDER BY ua.earnedAt DESC`,
    [userId]
  );
  return rows;
};

export const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM achievements ORDER BY name ASC');
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM achievements WHERE id = ?', [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO achievements (name, description, icon, criteria) VALUES (?, ?, ?, ?)',
    [data.name, data.description, data.icon || null, data.criteria || null]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  await pool.query(`UPDATE achievements SET ${setClause} WHERE id = ?`, [...values, id]);
};

export const remove = async (id) => {
  await pool.query('DELETE FROM achievements WHERE id = ?', [id]);
};
