import { Router } from 'express';
import * as activityLogsController from './activityLogs.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, activityLogsController.getMyActivityLogs);

export default router;
