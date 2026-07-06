import * as adminService from './admin.service.js';
import { success, error } from '../../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard();
    return success(res, dashboard);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await adminService.getAdminLogs(req.query);
    return success(res, logs);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const user = await adminService.createAdmin(req.body);
    return success(res, user, 'Admin account created');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const health = await adminService.getSystemHealth();
    return success(res, health);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
