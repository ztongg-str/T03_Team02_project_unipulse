import { Router } from 'express';
import * as otpController from './otp.controller.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './otp.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), otpController.register);
router.post('/verify-otp', validate(verifyOtpSchema), otpController.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), otpController.resendOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), otpController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), otpController.resetPassword);

export default router;
