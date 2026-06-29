import { Router } from 'express';
import * as eventsController from './events.controller.js';
import { authenticate, optionalAuth } from '../../middlewares/authMiddleware.js';
import { authorize, requirePermission } from '../../middlewares/roleMiddleware.js';
import { validate, required, minLength } from '../../middlewares/validationMiddleware.js';

const router = Router();

const createEventSchema = {
  body: {
    title: [required, minLength(3)],
    description: [required, minLength(10)],
    date: [required],
    location: [required],
    category: [required],
    maxParticipants: [required],
  },
};

router.get('/', optionalAuth, eventsController.getAllEvents);
router.get('/upcoming', authenticate, eventsController.getUpcomingEvents);
router.get('/my', authenticate, authorize('organizer', 'student'), eventsController.getMyEvents);
router.get('/:id', eventsController.getEventById);

router.post(
  '/',
  authenticate,
  authorize('organizer', 'student'),
  validate(createEventSchema),
  eventsController.createEvent
);

// Edit/delete — organizer (own events) + admin roles with manageEvents permission
router.put('/:id',    authenticate, authorize('organizer', 'superadmin', 'coordinator'), eventsController.updateEvent);
router.delete('/:id', authenticate, authorize('organizer', 'superadmin', 'coordinator'), eventsController.deleteEvent);

// Event verification — superadmin + coordinator
router.patch('/:id/approve', authenticate, requirePermission('verifyEvents'), eventsController.approveEvent);
router.patch('/:id/reject',  authenticate, requirePermission('verifyEvents'), eventsController.rejectEvent);

export default router;
