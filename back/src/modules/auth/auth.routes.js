import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
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

const loginSchema = {
  body: {
    email: [required, isEmail],
    password: [required],
  },
};

const forgotPasswordSchema = {
  body: {
    email: [required, isEmail],
  },
};

const resetPasswordSchema = {
  body: {
    email: [required, isEmail],
    otp: [required, minLength(6)],
    password: [required, minLength(6)],
  },
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/switch-role', authenticate, authController.switchRole);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
