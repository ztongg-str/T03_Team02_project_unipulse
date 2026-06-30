import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, reportsController.createReport);
router.get('/', authenticate, authorize('organizer'), reportsController.getAllReports);
router.patch('/:id/resolve', authenticate, authorize('organizer'), reportsController.resolveReport);
router.delete('/:id', authenticate, authorize('organizer'), reportsController.deleteReport);

export default router;
