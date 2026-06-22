import bcrypt from 'bcrypt';
import env from '../config/env.js';

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, env.bcryptRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
