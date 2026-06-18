import * as authRepository from './auth.repository.js';
import { generateToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword } from '../../utils/password.js';

export const register = async ({ username, email, password, fullName, role }) => {
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
  const userRole = role === 'organizer' ? 'organizer' : 'student';
  const userId = await authRepository.createUser({
    username,
    email,
    password: hashedPassword,
    fullName,
    role: userRole,
  });

  const token = generateToken({ id: userId, role: userRole });

  return {
    token,
    user: { id: userId, username, email, fullName, role: userRole },
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
