import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('organizer'), adminController.getDashboard);
router.get('/logs', authenticate, authorize('organizer'), adminController.getAdminLogs);

export default router;
