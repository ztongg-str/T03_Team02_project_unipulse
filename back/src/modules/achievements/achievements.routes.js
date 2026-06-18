import { Router } from 'express';
import * as achievementsController from './achievements.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', authenticate, achievementsController.getMyAchievements);
router.get('/all', authenticate, authorize('organizer'), achievementsController.getAllAchievements);
router.post('/', authenticate, authorize('organizer'), achievementsController.createAchievement);
router.put('/:id', authenticate, authorize('organizer'), achievementsController.updateAchievement);
router.delete('/:id', authenticate, authorize('organizer'), achievementsController.deleteAchievement);

export default router;
