import { Router } from 'express';
import * as otpController from './otp.controller.js';
import { validate, required, isEmail, minLength } from '../../middlewares/validationMiddleware.js';

const router = Router();

const registerSchema = {
  body: {
    username: [required, minLength(3)],
    email: [required, isEmail],
    password: [required, minLength(6)],
    fullName: [required],
  },
};

const verifySchema = {
  body: {
    email: [required, isEmail],
    otp: [required],
  },
};

const emailSchema = {
  body: {
    email: [required, isEmail],
  },
};

const resetPasswordSchema = {
  body: {
    email: [required, isEmail],
    otp: [required],
    password: [required, minLength(6)],
  },
};

router.post('/register', validate(registerSchema), otpController.register);
router.post('/verify', validate(verifySchema), otpController.verifyOtp);
router.post('/resend', validate(emailSchema), otpController.resendOtp);
router.post('/forgot-password', validate(emailSchema), otpController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), otpController.resetPassword);

export default router;
