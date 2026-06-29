import { Router } from 'express';
import * as friendsController from './friends.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, friendsController.getMyFriends);
router.get('/search', authenticate, friendsController.searchFriends);
router.post('/add/:userId', authenticate, friendsController.addFriend);
router.delete('/:id', authenticate, friendsController.removeFriend);
router.get('/profile/:userId', authenticate, friendsController.viewFriendProfile);

export default router;
