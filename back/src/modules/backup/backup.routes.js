import { Router } from 'express';
import * as backupController from './backup.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate, authorize('organizer'));

router.post('/full', backupController.createFullBackup);
router.post('/incremental', backupController.createIncrementalBackup);
router.post('/restore', backupController.restoreBackup);
router.get('/', backupController.getBackups);

export default router;
