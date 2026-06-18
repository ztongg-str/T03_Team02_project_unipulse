import { error } from '../utils/response.js';

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
