import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requirePermission } from '../../middlewares/roleMiddleware.js';
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

// Self-service profile (any authenticated user)
router.get('/profile', authenticate, usersController.getProfile);
router.put('/profile', authenticate, usersController.updateProfile);

// List users — superadmin, coordinator, organizer
router.get(
  '/',
  authenticate,
  (req, res, next) => {
    const allowed = ['superadmin', 'coordinator', 'organizer'];
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    next();
  },
  usersController.getAllUsers
);

// User management — superadmin + coordinator only
router.post(
  '/',
  authenticate,
  requirePermission('manageUsers'),
  validate(createUserSchema),
  usersController.createUser
);
router.patch('/:id/role',   authenticate, requirePermission('manageUsers'), usersController.updateUserRole);
router.patch('/:id/status', authenticate, requirePermission('manageUsers'), usersController.updateUserStatus);
router.delete('/:id',       authenticate, requirePermission('manageUsers'), usersController.deleteUser);

router.get('/:id', authenticate, usersController.getUserById);

export default router;
