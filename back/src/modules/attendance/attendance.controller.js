import * as attendanceService from './attendance.service.js';
import { success, error } from '../../utils/response.js';

export const checkIn = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return error(res, 'eventId is required', 400);
    }
    const result = await attendanceService.checkIn(req.user.id, eventId);
    return success(res, result, 'Check-in successful');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const checkInByCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || !/^\d{6}$/.test(code)) {
      return error(res, 'A valid 6-digit code is required', 400);
    }
    const result = await attendanceService.checkInByCode(req.user.id, code);
    return success(res, result, 'Check-in successful');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getUserHistory = async (req, res, next) => {
  try {
    const history = await attendanceService.getUserHistory(req.user.id);
    return success(res, history);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
