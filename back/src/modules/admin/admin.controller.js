import * as adminService from './admin.service.js';
import { success, error } from '../../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getDashboard(req.user.id);
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
