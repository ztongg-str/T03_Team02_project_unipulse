import { Router } from 'express';
import * as adminRolesController from './admin-roles.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/schema', authenticate, adminRolesController.getSchema);
router.get('/', authenticate, authorize('superadmin'), adminRolesController.getAll);
router.get('/users', authenticate, authorize('superadmin'), adminRolesController.getUsersWithRoles);
router.get('/user/:userId', authenticate, authorize('superadmin'), adminRolesController.getUserRoles);

// Admin account management — MUST be before /:id routes
router.get('/accounts', authenticate, authorize('superadmin'), adminRolesController.getAccounts);
router.post('/accounts', authenticate, authorize('superadmin'), adminRolesController.createAccount);
router.delete('/accounts/:userId', authenticate, authorize('superadmin'), adminRolesController.deleteAccount);

router.get('/:id', authenticate, authorize('superadmin'), adminRolesController.getById);
router.post('/', authenticate, authorize('superadmin'), adminRolesController.create);
router.put('/:id', authenticate, authorize('superadmin'), adminRolesController.update);
router.delete('/:id', authenticate, authorize('superadmin'), adminRolesController.remove);
router.post('/assign', authenticate, authorize('superadmin'), adminRolesController.assignToUser);
router.delete('/unassign/:userId/:roleId', authenticate, authorize('superadmin'), adminRolesController.unassignFromUser);

export default router;
