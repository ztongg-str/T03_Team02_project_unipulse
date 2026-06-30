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
  const [rows] = await pool.query('SELECT * FROM achievements ORDER BY id ASC');
  return rows;
};

export const findAllWithUserStatus = async (userId) => {
  const [rows] = await pool.query(
    `SELECT a.*, ua.earnedAt,
            CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS unlocked
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.id = ua.achievementId AND ua.userId = ?
     ORDER BY a.id ASC`,
    [userId]
  );
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

export const grantToUser = async (userId, achievementId) => {
  const [result] = await pool.query(
    'INSERT IGNORE INTO user_achievements (userId, achievementId) VALUES (?, ?)',
    [userId, achievementId]
  );
  return result.affectedRows > 0;
};

export const findByCriteria = async (criteria) => {
  const [rows] = await pool.query(
    'SELECT * FROM achievements WHERE criteria = ?',
    [criteria]
  );
  return rows;
};

export const countEarnedByUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM user_achievements WHERE userId = ?',
    [userId]
  );
  return rows[0].count;
};

export const countRegistrations = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM registrations WHERE userId = ?',
    [userId]
  );
  return rows[0].count;
};

export const countAttended = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM past_event_history WHERE userId = ? AND attended = TRUE',
    [userId]
  );
  return rows[0].count;
};

export const countFriends = async (userId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM friends WHERE userId = ? OR friendId = ?',
    [userId, userId]
  );
  return rows[0].count;
};

export const _getUserLevel = async (userId) => {
  const [rows] = await pool.query('SELECT level FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
};

export const _getUserProfile = async (userId) => {
  const [rows] = await pool.query('SELECT bio, fullName FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
};

export const getDistinctCategories = async (userId) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT e.category FROM registrations r
     JOIN events e ON r.eventId = e.id
     WHERE r.userId = ?`,
    [userId]
  );
  return rows.map(r => r.category);
};
