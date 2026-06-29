import * as historyService from './history.service.js';
import { success, error } from '../../utils/response.js';

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await historyService.getUpcomingEvents(req.user.id);
    return success(res, events);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getPastHistory = async (req, res, next) => {
  try {
    const history = await historyService.getPastHistory(req.user.id);
    return success(res, history);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { registrationId, attended } = req.body;
    const result = await historyService.markAttendance(registrationId, req.user.id, attended);
    return success(res, result, 'Attendance recorded successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
