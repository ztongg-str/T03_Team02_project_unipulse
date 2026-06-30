import { Router } from 'express';
import * as registrationsController from './registrations.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.post('/', authenticate, registrationsController.registerForEvent);
router.delete('/:id', authenticate, registrationsController.cancelRegistration);
router.delete('/event/:eventId', authenticate, registrationsController.cancelRegistrationByEvent);
router.get('/my', authenticate, registrationsController.getMyRegistrations);
router.get('/check/:eventId', authenticate, registrationsController.checkRegistration);
router.get('/event/:eventId', authenticate, authorize('organizer'), registrationsController.getEventRegistrations);

export default router;
