import { required, isEmail, minLength } from '../../middlewares/validationMiddleware.js';

export const registerSchema = {
  body: {
    username: [required, minLength(3)],
    email: [required, isEmail],
    password: [required, minLength(6)],
    fullName: [required],
  },
};

export const verifyOtpSchema = {
  body: {
    email: [required, isEmail],
    otp: [required, minLength(6)],
  },
};

export const resendOtpSchema = {
  body: {
    email: [required, isEmail],
  },
};

export const forgotPasswordSchema = {
  body: {
    email: [required, isEmail],
  },
};

export const resetPasswordSchema = {
  body: {
    email: [required, isEmail],
    otp: [required, minLength(6)],
    password: [required, minLength(6)],
  },
};
