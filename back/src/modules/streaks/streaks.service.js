import * as streaksRepository from './streaks.repository.js';

export const getMyStreaks = async (userId) => {
  return streaksRepository.findByUserId(userId);
};

export const getAllStreaks = async () => {
  return streaksRepository.findAll();
};

export const createStreak = async (data) => {
  const id = await streaksRepository.create(data);
  return streaksRepository.findById(id);
};

export const updateStreak = async (id, data) => {
  const streak = await streaksRepository.findById(id);
  if (!streak) {
    const err = new Error('Streak not found');
    err.statusCode = 404;
    throw err;
  }
  await streaksRepository.update(id, data);
  return streaksRepository.findById(id);
};

export const deleteStreak = async (id) => {
  const streak = await streaksRepository.findById(id);
  if (!streak) {
    const err = new Error('Streak not found');
    err.statusCode = 404;
    throw err;
  }
  await streaksRepository.remove(id);
};
