import * as usersRepository from './users.repository.js';
import { checkAndGrant } from '../achievements/achievements.service.js';
import { hashPassword } from '../../utils/password.js';

const VALID_ROLES = ['student', 'organizer', 'admin'];
const VALID_STATUSES = ['active', 'suspended'];

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

// ---- Admin-only operations below ----

export const createUserByAdmin = async ({ username, email, password, fullName, role }) => {
  if (!username || !email || !password || !fullName) {
    const err = new Error('username, email, password and fullName are required');
    err.statusCode = 400;
    throw err;
  }
  if (!VALID_ROLES.includes(role)) {
    const err = new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('password must be at least 6 characters');
    err.statusCode = 400;
    throw err;
  }

  const existingEmail = await usersRepository.findByEmail(email);
  if (existingEmail) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }
  const existingUsername = await usersRepository.findByUsername(username);
  if (existingUsername) {
    const err = new Error('Username already taken');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const userId = await usersRepository.create({ username, email, password: hashed, fullName, role });
  return usersRepository.findById(userId);
};

export const updateUserRole = async (id, role, actingUser) => {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error(`role must be one of: ${VALID_ROLES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  const user = await usersRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role === 'admin' && role !== 'admin' && Number(actingUser.id) === Number(id)) {
    const err = new Error('You cannot remove your own admin role');
    err.statusCode = 400;
    throw err;
  }
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await usersRepository.countAdmins();
    if (adminCount <= 1) {
      const err = new Error('Cannot demote the last remaining admin account');
      err.statusCode = 400;
      throw err;
    }
  }
  await usersRepository.update(id, { role });
  return usersRepository.findById(id);
};

export const updateUserStatus = async (id, status, actingUser) => {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  const user = await usersRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(actingUser.id) === Number(id)) {
    const err = new Error('You cannot change your own account status');
    err.statusCode = 400;
    throw err;
  }
  await usersRepository.update(id, { status });
  return usersRepository.findById(id);
};

export const deleteUser = async (id, actingUser) => {
  const user = await usersRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (Number(actingUser.id) === Number(id)) {
    const err = new Error('You cannot delete your own account');
    err.statusCode = 400;
    throw err;
  }
  if (user.role === 'admin') {
    const adminCount = await usersRepository.countAdmins();
    if (adminCount <= 1) {
      const err = new Error('Cannot delete the last remaining admin account');
      err.statusCode = 400;
      throw err;
    }
  }
  await usersRepository.remove(id);
};
