import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize, requirePermission } from '../../middlewares/roleMiddleware.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard & logs — all three admin roles
router.get('/dashboard',     requirePermission('dashboard'),    adminController.getDashboard);
router.get('/logs',          requirePermission('logs'),         adminController.getAdminLogs);
router.get('/system-health', requirePermission('systemHealth'), adminController.getSystemHealth);

// Superadmin only — create admin accounts
router.post('/create-admin', authorize('superadmin'), adminController.createAdmin);

export default router;
