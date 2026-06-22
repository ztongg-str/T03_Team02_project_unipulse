import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import * as savedEventsController from './savedEvents.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', savedEventsController.getSavedEvents);
router.post('/', savedEventsController.saveEvent);
router.delete('/:eventId', savedEventsController.unsaveEvent);
router.get('/check/:eventId', savedEventsController.checkSaved);

export default router;
