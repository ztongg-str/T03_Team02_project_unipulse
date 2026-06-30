import { error } from '../utils/response.js';

// Role hierarchy
const ADMIN_ROLES = ['superadmin', 'developer', 'coordinator'];

// Feature permissions per role
export const PERMISSIONS = {
  dashboard:    ['superadmin', 'developer', 'coordinator'],
  logs:         ['superadmin', 'developer', 'coordinator'],
  systemHealth: ['superadmin', 'developer'],
  manageUsers:  ['superadmin', 'coordinator'],
  manageEvents: ['superadmin', 'coordinator'],
  verifyEvents: ['superadmin', 'coordinator'],
  backup:       ['superadmin', 'developer'],
  queryConsole: ['superadmin', 'developer'],
};

/**
 * authorize(...roles)
 * Allows access if req.user.role is in the allowedRoles list.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'Forbidden. You do not have permission.', 403);
    }
    next();
  };
};

/**
 * requirePermission(feature)
 * Uses the PERMISSIONS map above for feature-level access control.
 */
export const requirePermission = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    const allowed = PERMISSIONS[feature] || [];
    if (!allowed.includes(req.user.role)) {
      return error(res, `Forbidden. Your role does not have access to: ${feature}.`, 403);
    }
    next();
  };
};

/**
 * isAdminRole(role)
 * Returns true for any of the three admin sub-roles.
 */
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
