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
    'SELECT id, username, email, fullName, role, avatar, cover_image, bio, interests, xp, level, createdAt FROM users WHERE id = ?',
    [id]
  );
  const user = rows[0] || null;
  if (user && typeof user.interests === 'string') {
    try { user.interests = JSON.parse(user.interests); } catch { user.interests = []; }
  }
  if (user) {
    const [roleRows] = await pool.query(
      `SELECT ar.id, ar.name, ar.permissions
       FROM admin_roles ar
       JOIN user_admin_roles uar ON ar.id = uar.roleId
       WHERE uar.userId = ?`,
      [id]
    );
    user.adminRoles = roleRows.map((r) => ({
      id: r.id,
      name: r.name,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
    }));
  }
  return user;
};

export const createUser = async ({ username, email, password, fullName}) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, fullName) VALUES (?, ?, ?, ?)',
    [username, email, password, fullName]
  );
  return result.insertId;
};

export const updateRole = async (id, role) => {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
};
