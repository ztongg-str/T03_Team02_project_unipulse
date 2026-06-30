import * as otpService from './otp.service.js';
import { success, created, error } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await otpService.register(req.body);
    return created(res, result, 'Registration successful. Please check your email for OTP.');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await otpService.verifyOtp(req.body);
    return success(res, result, 'Email verified successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const result = await otpService.resendOtp(req.body);
    return success(res, result, 'OTP resent successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await otpService.forgotPassword(req.body);
    return success(res, result, 'OTP sent to your email');
  } catch (err) {
    return error(res, err.message, err.statusCode || 404);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await otpService.resetPassword(req.body);
    return success(res, result, 'Password reset successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
