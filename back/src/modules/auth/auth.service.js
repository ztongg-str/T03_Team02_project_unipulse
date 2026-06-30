import * as authRepository from './auth.repository.js';
import { generateToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword } from '../../utils/password.js';

export const register = async ({ username, email, password, fullName }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const existingUsername = await authRepository.findByUsername(username);
  if (existingUsername) {
    const err = new Error('Username already taken');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const userId = await authRepository.createUser({
    username,
    email,
    password: hashedPassword,
    fullName
  });

  const token = generateToken({ id: userId, role: 'student' });

  return {
    token,
    user: { id: userId, username, email, fullName, role: 'student', xp: 0, level: 1 },
  };
};

export const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      xp: user.xp || 0,
      level: user.level || 1,
    },
  };
};

export const getMe = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

export const switchRole = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const newRole = user.role === 'student' ? 'organizer' : 'student';
  await authRepository.updateRole(userId, newRole);

  const token = generateToken({ id: user.id, role: newRole });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: newRole,
    },
  };
};
