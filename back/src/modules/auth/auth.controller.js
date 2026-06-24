import * as authService from './auth.service.js';
import { success, created, error } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'User registered successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    return error(res, err.message, err.statusCode || 401);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const switchRole = async (req, res, next) => {
  try {
    const result = await authService.switchRole(req.user.id);
    return success(res, result, 'Role switched successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
