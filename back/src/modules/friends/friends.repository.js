import pool from '../../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.friendId as friendId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.friendId = u.id WHERE f.userId = ? AND f.status = 'accepted'
     UNION
     SELECT f.id, f.userId as friendId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.userId = u.id WHERE f.friendId = ? AND f.status = 'accepted'`,
    [userId, userId]
  );
  return rows;
};

export const searchUsers = async (query, excludeUserId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.fullName, u.avatar,
       CASE
         WHEN f1.id IS NOT NULL AND f1.status = 'accepted' THEN 'accepted'
         WHEN f1.id IS NOT NULL AND f1.status = 'pending' AND f1.userId = ? THEN 'sent'
         WHEN f1.id IS NOT NULL AND f1.status = 'pending' AND f1.friendId = ? THEN 'received'
         ELSE NULL
       END as friendStatus
     FROM users u
     LEFT JOIN friends f1 ON ((f1.userId = ? AND f1.friendId = u.id) OR (f1.userId = u.id AND f1.friendId = ?))
     WHERE (u.username LIKE ? OR u.fullName LIKE ?) AND u.id != ? AND u.role NOT IN ('superadmin','developer','coordinator')
     LIMIT 20`,
    [excludeUserId, excludeUserId, excludeUserId, excludeUserId, `%${query}%`, `%${query}%`, excludeUserId]
  );
  return rows;
};

export const findFriendship = async (userId, friendId) => {
  const [rows] = await pool.query(
    `SELECT * FROM friends WHERE ((userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)) AND status = 'accepted'`,
    [userId, friendId, friendId, userId]
  );
  return rows[0] || null;
};

export const findPendingRequest = async (userId, friendId) => {
  const [rows] = await pool.query(
    `SELECT * FROM friends WHERE ((userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)) AND status = 'pending'`,
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
    'INSERT INTO friends (userId, friendId, status) VALUES (?, ?, \'pending\')',
    [userId, friendId]
  );
  return result.insertId;
};

export const accept = async (id) => {
  await pool.query('UPDATE friends SET status = \'accepted\' WHERE id = ?', [id]);
};

export const remove = async (id) => {
  await pool.query('DELETE FROM friends WHERE id = ?', [id]);
};

export const getPendingRequests = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.userId as fromUserId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.userId = u.id
     WHERE f.friendId = ? AND f.status = 'pending'`,
    [userId]
  );
  return rows;
};

export const getSentRequests = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.friendId as toUserId, u.fullName, u.username, u.avatar
     FROM friends f JOIN users u ON f.friendId = u.id
     WHERE f.userId = ? AND f.status = 'pending'`,
    [userId]
  );
  return rows;
};

export const getFriendCount = async (userId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM friends
     WHERE (userId = ? OR friendId = ?) AND status = 'accepted'`,
    [userId, userId]
  );
  return rows[0].count;
};

export const getFriendEvents = async (userId) => {
  const [rows] = await pool.query(
    `SELECT e.id, e.title, e.date, e.location, e.category, e.image
     FROM registrations r
     JOIN events e ON r.eventId = e.id
     WHERE r.userId = ? AND e.status = 'approved'
     ORDER BY e.date DESC`,
    [userId]
  );
  return rows;
};

export const discoverUsers = async (userId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.fullName, u.avatar
     FROM users u
     WHERE u.id != ?
       AND u.role NOT IN ('superadmin','developer','coordinator')
       AND u.id NOT IN (
         SELECT friendId FROM friends WHERE userId = ?
         UNION
         SELECT userId FROM friends WHERE friendId = ?
       )
     ORDER BY u.createdAt DESC
     LIMIT 20`,
    [userId, userId, userId]
  );
  return rows;
};
