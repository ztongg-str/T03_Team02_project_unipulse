import { verifyToken } from '../utils/jwt.js';
import { error } from '../utils/response.js';
import pool from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access denied. No token provided.', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;

    // Load admin roles assigned to this user (if any)
    try {
      const [rows] = await pool.query(
        `SELECT ar.id, ar.name, ar.permissions
         FROM admin_roles ar
         JOIN user_admin_roles uar ON ar.id = uar.roleId
         WHERE uar.userId = ?`,
        [req.user.id]
      );
      req.user.adminRoles = rows.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
      }));
    } catch {
      req.user.adminRoles = [];
    }

    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;

      try {
        const [rows] = await pool.query(
          `SELECT ar.id, ar.name, ar.permissions
           FROM admin_roles ar
           JOIN user_admin_roles uar ON ar.id = uar.roleId
           WHERE uar.userId = ?`,
          [req.user.id]
        );
        req.user.adminRoles = rows.map((r) => ({
          id: r.id,
          name: r.name,
          permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
        }));
      } catch {
        req.user.adminRoles = [];
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};
