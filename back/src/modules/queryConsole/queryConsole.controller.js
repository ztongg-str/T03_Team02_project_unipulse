import * as queryConsoleService from './queryConsole.service.js';
import { success, error } from '../../utils/response.js';

export const executeQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return error(res, 'Query is required.', 400);
    }
    const result = await queryConsoleService.execute(query.trim(), req.user.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getQueryLogs = async (req, res, next) => {
  try {
    const logs = await queryConsoleService.getLogs(req.query);
    return success(res, logs);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
