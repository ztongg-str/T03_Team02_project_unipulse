import { Router } from 'express';
import * as attendanceController from './attendance.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/checkin', authenticate, attendanceController.checkIn);
router.post('/checkin-by-code', authenticate, attendanceController.checkInByCode);
router.get('/my-history', authenticate, attendanceController.getUserHistory);

export default router;
