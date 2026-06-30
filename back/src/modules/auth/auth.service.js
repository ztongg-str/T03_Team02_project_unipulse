import * as authRepository from './auth.repository.js';
import { generateToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import nodemailer from 'nodemailer';

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
    user: { id: userId, username, email, fullName, role: 'student' },
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
      isVerified: user.isVerified ? true : false,
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

export const forgotPassword = async ({ email }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await authRepository.updateUserOtp(email, otp, otpExpiresAt);

  try {
    await sendOtpEmail(email, otp, 'reset');
  } catch (emailErr) {
    const err = new Error('Failed to send email. Please try again.');
    err.statusCode = 500;
    throw err;
  }

  return { message: 'OTP sent to your email' };
};

export const resetPassword = async ({ email, otp, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.otp !== otp) {
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  if (new Date() > new Date(user.otpExpiresAt)) {
    const err = new Error('OTP expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  await authRepository.updateUserPassword(email, hashedPassword);

  return { message: 'Password reset successfully' };
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.USER,
    pass: process.env.EMAIL_PASS || process.env.OPT_PW,
  },
});

const sendOtpEmail = async (email, otp, purpose) => {
  const subject = purpose === 'register'
    ? 'Verify your UniPulse account'
    : 'Reset your UniPulse password';
  const text = purpose === 'register'
    ? `Your OTP for email verification is: ${otp}\n\nThis code expires in 10 minutes.`
    : `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER || process.env.USER,
    to: email,
    subject,
    text,
  });
};

