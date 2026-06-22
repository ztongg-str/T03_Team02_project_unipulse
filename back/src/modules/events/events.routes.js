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
router.get('/my', authenticate, eventsController.getMyEvents);
router.get('/:id', authenticate, eventsController.getEventById);
router.post('/', authenticate, validate(createEventSchema), eventsController.createEvent);
router.put('/:id', authenticate, eventsController.updateEvent);
router.delete('/:id', authenticate, eventsController.deleteEvent);
router.patch('/:id/approve', authenticate, authorize('admin'), eventsController.approveEvent);

export default router;
