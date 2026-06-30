import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';
import { validate, required, isEmail, minLength } from '../../middlewares/validationMiddleware.js';

const router = Router();

const createUserSchema = {
  body: {
    username: [required, minLength(3)],
    email: [required, isEmail],
    password: [required, minLength(6)],
    fullName: [required],
    role: [required],
  },
};

router.get('/profile', authenticate, usersController.getProfile);
router.put('/profile', authenticate, usersController.updateProfile);
router.get('/', authenticate, authorize('admin', 'organizer'), usersController.getAllUsers);

// Admin-only account management — no public signup for these roles.
router.post('/', authenticate, authorize('admin'), validate(createUserSchema), usersController.createUser);
router.patch('/:id/role', authenticate, authorize('admin'), usersController.updateUserRole);
router.patch('/:id/status', authenticate, authorize('admin'), usersController.updateUserStatus);
router.delete('/:id', authenticate, authorize('admin'), usersController.deleteUser);

router.get('/:id', authenticate, usersController.getUserById);

export default router;
