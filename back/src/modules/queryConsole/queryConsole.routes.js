import { Router } from 'express';
import * as queryConsoleController from './queryConsole.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/roleMiddleware.js';

const router = Router();

// SQL query console — superadmin + developer only
router.use(authenticate, requirePermission('queryConsole'));

router.post('/execute', queryConsoleController.executeQuery);
router.get('/logs',     queryConsoleController.getQueryLogs);

export default router;
