import { Router } from 'express';
import * as registrationsController from './registrations.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, registrationsController.registerForEvent);
router.delete('/:id', authenticate, registrationsController.cancelRegistration);
router.get('/my', authenticate, registrationsController.getMyRegistrations);
router.get('/event/:eventId', authenticate, registrationsController.getEventRegistrations);

export default router;
