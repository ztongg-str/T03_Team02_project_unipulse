import * as usersRepository from './users.repository.js';
import { checkAndGrant } from '../achievements/achievements.service.js';

export const getProfile = async (userId) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const updateProfile = async (userId, data) => {
  const allowedFields = ['fullName', 'avatar', 'cover_image', 'bio'];
  const updates = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }
  if (Object.keys(updates).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }
  await usersRepository.update(userId, updates);

  await checkAndGrant(userId, 'complete_profile');

  return usersRepository.findById(userId);
};

export const getUserById = async (id) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const getAllUsers = async (query) => {
  return usersRepository.findAll(query);
};
