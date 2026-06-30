import { Router } from 'express';
import * as friendsController from './friends.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticate, friendsController.getMyFriends);
router.get('/discover', authenticate, friendsController.discoverUsers);
router.get('/search', authenticate, friendsController.searchFriends);
router.post('/add/:userId', authenticate, friendsController.addFriend);
router.delete('/:id', authenticate, friendsController.removeFriend);
router.get('/profile/:userId', authenticate, friendsController.viewFriendProfile);
router.get('/requests', authenticate, friendsController.getPendingRequests);
router.get('/requests/sent', authenticate, friendsController.getSentRequests);
router.post('/requests/:requestId/accept', authenticate, friendsController.acceptRequest);
router.post('/requests/:requestId/decline', authenticate, friendsController.declineRequest);
router.post('/requests/:requestId/cancel', authenticate, friendsController.cancelRequest);

export default router;
