import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/profile', authenticate, usersController.getProfile);
router.put('/profile', authenticate, usersController.updateProfile);
router.get('/:id', authenticate, usersController.getUserById);
router.get('/', authenticate, authorize('organizer'), usersController.getAllUsers);

export default router;
