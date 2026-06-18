import * as activityLogsService from './activityLogs.service.js';
import { success, error } from '../../utils/response.js';

export const getMyActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityLogsService.getMyActivityLogs(req.user.id);
    return success(res, logs);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
