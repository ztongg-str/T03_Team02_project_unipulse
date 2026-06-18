import * as achievementsRepository from './achievements.repository.js';

export const getMyAchievements = async (userId) => {
  return achievementsRepository.findByUserId(userId);
};

export const getAllAchievements = async () => {
  return achievementsRepository.findAll();
};

export const createAchievement = async (data) => {
  const id = await achievementsRepository.create(data);
  return achievementsRepository.findById(id);
};

export const updateAchievement = async (id, data) => {
  const achievement = await achievementsRepository.findById(id);
  if (!achievement) {
    const err = new Error('Achievement not found');
    err.statusCode = 404;
    throw err;
  }
  await achievementsRepository.update(id, data);
  return achievementsRepository.findById(id);
};

export const deleteAchievement = async (id) => {
  const achievement = await achievementsRepository.findById(id);
  if (!achievement) {
    const err = new Error('Achievement not found');
    err.statusCode = 404;
    throw err;
  }
  await achievementsRepository.remove(id);
};
