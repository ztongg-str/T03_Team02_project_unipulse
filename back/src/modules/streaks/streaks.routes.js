import { Router } from 'express';
import * as streaksController from './streaks.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', authenticate, streaksController.getMyStreaks);
router.get('/all', authenticate, authorize('organizer'), streaksController.getAllStreaks);
router.post('/', authenticate, authorize('organizer'), streaksController.createStreak);
router.put('/:id', authenticate, authorize('organizer'), streaksController.updateStreak);
router.delete('/:id', authenticate, authorize('organizer'), streaksController.deleteStreak);

export default router;
