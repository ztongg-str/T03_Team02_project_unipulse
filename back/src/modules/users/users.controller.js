import * as usersService from './users.service.js';
import { success, error } from '../../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);
    return success(res, user, 'Profile updated successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return success(res, user);
  } catch (err) {
    return error(res, err.message, err.statusCode || 404);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await usersService.getAllUsers(req.query);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
