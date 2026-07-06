import pool from '../../config/database.js';

export const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT ar.*, u.fullName as createdByName
     FROM admin_roles ar
     LEFT JOIN users u ON ar.createdBy = u.id
     ORDER BY ar.name ASC`
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ar.*, u.fullName as createdByName
     FROM admin_roles ar
     LEFT JOIN users u ON ar.createdBy = u.id
     WHERE ar.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const findByName = async (name) => {
  const [rows] = await pool.query('SELECT id FROM admin_roles WHERE name = ?', [name]);
  return rows[0] || null;
};

export const create = async ({ name, description, permissions, createdBy }) => {
  const [result] = await pool.query(
    'INSERT INTO admin_roles (name, description, permissions, createdBy) VALUES (?, ?, ?, ?)',
    [name, description, JSON.stringify(permissions), createdBy]
  );
  return result.insertId;
};

export const update = async (id, { name, description, permissions }) => {
  await pool.query(
    'UPDATE admin_roles SET name = ?, description = ?, permissions = ? WHERE id = ?',
    [name, description, JSON.stringify(permissions), id]
  );
};

export const remove = async (id) => {
  await pool.query('DELETE FROM admin_roles WHERE id = ?', [id]);
};

export const getAssignedUsers = async (roleId) => {
  const [rows] = await pool.query(
    `SELECT uar.userId, uar.assignedBy, uar.createdAt,
            u.fullName, u.username, u.role, u.avatar
     FROM user_admin_roles uar
     JOIN users u ON uar.userId = u.id
     WHERE uar.roleId = ?`,
    [roleId]
  );
  return rows;
};

export const assignRole = async (userId, roleId, assignedBy) => {
  await pool.query(
    'INSERT INTO user_admin_roles (userId, roleId, assignedBy) VALUES (?, ?, ?)',
    [userId, roleId, assignedBy]
  );
};

export const unassignRole = async (userId, roleId) => {
  await pool.query(
    'DELETE FROM user_admin_roles WHERE userId = ? AND roleId = ?',
    [userId, roleId]
  );
};

export const getUserRoles = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ar.*
     FROM admin_roles ar
     JOIN user_admin_roles uar ON ar.id = uar.roleId
     WHERE uar.userId = ?`,
    [userId]
  );
  return rows;
};

export const getUsersWithRoles = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.fullName, u.username, u.role, u.avatar,
            GROUP_CONCAT(ar.name ORDER BY ar.name ASC SEPARATOR ', ') as assignedRoles
     FROM users u
     LEFT JOIN user_admin_roles uar ON u.id = uar.userId
     LEFT JOIN admin_roles ar ON uar.roleId = ar.id
     GROUP BY u.id
     ORDER BY u.fullName ASC`
  );
  return rows;
};

export const countRoleAssignments = async (roleId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM user_admin_roles WHERE roleId = ?',
    [roleId]
  );
  return rows[0].count;
};
