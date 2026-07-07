import * as achievementsService from './achievements.service.js';
import { success, created, error } from '../../utils/response.js';

export const getMyAchievements = async (req, res, next) => {
  try {
    const achievements = await achievementsService.getMyAchievements(req.user.id);
    return success(res, achievements);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getUserAchievements = async (req, res, next) => {
  try {
    const achievements = await achievementsService.getMyAchievements(req.params.userId);
    return success(res, achievements);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await achievementsService.getAllAchievements();
    return success(res, achievements);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getAllWithStatus = async (req, res, next) => {
  try {
    const achievements = await achievementsService.getAllWithStatus(req.user.id);
    return success(res, achievements);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const achievement = await achievementsService.createAchievement(req.body);
    return created(res, achievement, 'Achievement created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await achievementsService.updateAchievement(req.params.id, req.body);
    return success(res, achievement, 'Achievement updated successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    await achievementsService.deleteAchievement(req.params.id);
    return success(res, null, 'Achievement deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
