import * as otpRepository from './otp.repository.js';
import nodemailer from 'nodemailer';
import { hashPassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import env from '../../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (email, otp, purpose) => {
  const subject = purpose === 'register' ? 'Verify your UniPulse account' : 'Reset your UniPulse password';
  const text = purpose === 'register'
    ? `Your OTP for email verification is: ${otp}\n\nThis code expires in 10 minutes.`
    : `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  });
};

export const register = async ({ username, email, password, fullName }) => {
  const existingUser = await otpRepository.findByEmail(email);
  if (existingUser) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const existingUsername = await otpRepository.findByUsername(username);
  if (existingUsername) {
    const err = new Error('Username already taken');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const userId = await otpRepository.createUser({ username, email, password: hashedPassword, fullName });

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await otpRepository.updateOtp(email, otp, otpExpiresAt);

  await sendOtpEmail(email, otp, 'register');

  return { userId, email };
};

export const verifyOtp = async ({ email, otp }) => {
  const user = await otpRepository.findByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error('Email already verified');
    err.statusCode = 400;
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

  await otpRepository.verifyUser(email);

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

export const resendOtp = async ({ email }) => {
  const user = await otpRepository.findByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.isVerified) {
    const err = new Error('Email already verified');
    err.statusCode = 400;
    throw err;
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await otpRepository.updateOtp(email, otp, otpExpiresAt);

  await sendOtpEmail(email, otp, 'register');

  return { message: 'OTP resent successfully' };
};

export const forgotPassword = async ({ email }) => {
  const user = await otpRepository.findByEmail(email);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await otpRepository.updateOtp(email, otp, otpExpiresAt);

  await sendOtpEmail(email, otp, 'reset');

  return { message: 'OTP sent to your email' };
};

export const resetPassword = async ({ email, otp, password }) => {
  const user = await otpRepository.findByEmail(email);
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
  await otpRepository.updatePassword(email, hashedPassword);

  return { message: 'Password reset successfully' };
};
