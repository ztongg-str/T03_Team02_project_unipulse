import { Router } from 'express';
import * as historyController from './history.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/upcoming', authenticate, historyController.getUpcomingEvents);
router.get('/past', authenticate, historyController.getPastHistory);
router.put('/attendance', authenticate, authorize('organizer'), historyController.markAttendance);

export default router;
