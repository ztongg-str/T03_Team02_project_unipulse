import { Router } from 'express';
import * as eventsController from './events.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';
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

router.get('/', authenticate, eventsController.getAllEvents);
router.get('/upcoming', authenticate, eventsController.getUpcomingEvents);
router.get('/my', authenticate, authorize('organizer', 'student'), eventsController.getMyEvents);
router.get('/:id', authenticate, eventsController.getEventById);
router.post('/', authenticate, authorize('organizer', 'student'), validate(createEventSchema), eventsController.createEvent);
router.put('/:id', authenticate, authorize('organizer', 'admin'), eventsController.updateEvent);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), eventsController.deleteEvent);

// Event Verification — admin only. Organizers can no longer self-approve;
// every new event sits in 'pending' until an admin reviews it.
router.patch('/:id/approve', authenticate, authorize('admin'), eventsController.approveEvent);
router.patch('/:id/reject', authenticate, authorize('admin'), eventsController.rejectEvent);

export default router;
