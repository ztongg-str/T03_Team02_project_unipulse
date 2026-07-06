import { error } from '../utils/response.js';

// Built-in admin role hierarchy
const ADMIN_ROLES = ['superadmin', 'developer', 'coordinator'];

// Feature permissions per built-in role
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

// Map old feature permissions to new RBAC module+action combinations
const FEATURE_TO_RBAC = {
  manageUsers:  { module: 'users', action: 'manage' },
  manageEvents: { module: 'events', action: 'manage' },
  verifyEvents: { module: 'events', action: 'approve' },
  dashboard:    null,
  logs:         null,
  systemHealth: null,
  backup:       null,
  queryConsole: null,
};

/**
 * Check if a user has a given permission through either:
 * 1. Their built-in role (req.user.role) matching the PERMISSIONS map
 * 2. Their custom admin roles (req.user.adminRoles) having the matching permission
 */
function userHasPermission(user, feature) {
  // Check built-in role first
  const allowed = PERMISSIONS[feature] || [];
  if (allowed.includes(user.role)) return true;

  // Check custom admin roles
  const rbac = FEATURE_TO_RBAC[feature];
  if (rbac && user.adminRoles) {
    return user.adminRoles.some((role) => {
      const perms = role.permissions?.[rbac.module];
      return perms && perms.includes(rbac.action);
    });
  }

  return false;
}

/**
 * authorize(...roles)
 * Allows access if req.user.role matches any allowed role,
 * OR if req.user has an admin role assignment.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    // Also allow if user has any custom admin role assigned
    if (req.user.adminRoles && req.user.adminRoles.length > 0) {
      return next();
    }
    return error(res, 'Forbidden. You do not have permission.', 403);
  };
};

/**
 * requirePermission(feature)
 * Uses the PERMISSIONS map for feature-level access control,
 * also checks custom admin roles.
 */
export const requirePermission = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (userHasPermission(req.user, feature)) {
      return next();
    }
    return error(res, `Forbidden. Your role does not have access to: ${feature}.`, 403);
  };
};

/**
 * isAdminRole(role)
 * Returns true for any of the three built-in admin sub-roles.
 */
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
