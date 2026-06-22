import * as streaksService from './streaks.service.js';
import { success, created, error } from '../../utils/response.js';

export const getMyStreaks = async (req, res, next) => {
  try {
    const streaks = await streaksService.getMyStreaks(req.user.id);
    return success(res, streaks);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getAllStreaks = async (req, res, next) => {
  try {
    const streaks = await streaksService.getAllStreaks();
    return success(res, streaks);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createStreak = async (req, res, next) => {
  try {
    const streak = await streaksService.createStreak(req.body);
    return created(res, streak, 'Streak created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const updateStreak = async (req, res, next) => {
  try {
    const streak = await streaksService.updateStreak(req.params.id, req.body);
    return success(res, streak, 'Streak updated successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const deleteStreak = async (req, res, next) => {
  try {
    await streaksService.deleteStreak(req.params.id);
    return success(res, null, 'Streak deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
