import * as friendsService from './friends.service.js';
import { success, error } from '../../utils/response.js';

export const getMyFriends = async (req, res, next) => {
  try {
    const friends = await friendsService.getMyFriends(req.user.id);
    return success(res, friends);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const searchFriends = async (req, res, next) => {
  try {
    const results = await friendsService.searchFriends(req.user.id, req.query.q);
    return success(res, results);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const addFriend = async (req, res, next) => {
  try {
    const friend = await friendsService.addFriend(req.user.id, req.params.userId);
    return success(res, friend, 'Friend request sent');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    await friendsService.acceptFriendRequest(req.params.requestId, req.user);
    return success(res, null, 'Friend request accepted');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const declineRequest = async (req, res, next) => {
  try {
    await friendsService.declineFriendRequest(req.params.requestId, req.user);
    return success(res, null, 'Friend request declined');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    await friendsService.cancelFriendRequest(req.params.requestId, req.user);
    return success(res, null, 'Friend request cancelled');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    await friendsService.removeFriend(req.params.id, req.user);
    return success(res, null, 'Friend removed successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await friendsService.getPendingRequests(req.user.id);
    return success(res, requests);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getSentRequests = async (req, res, next) => {
  try {
    const requests = await friendsService.getSentRequests(req.user.id);
    return success(res, requests);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const discoverUsers = async (req, res, next) => {
  try {
    const users = await friendsService.discoverUsers(req.user.id);
    return success(res, users);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const viewFriendProfile = async (req, res, next) => {
  try {
    const profile = await friendsService.viewFriendProfile(req.user.id, req.params.userId);
    return success(res, profile);
  } catch (err) {
    return error(res, err.message, err.statusCode || 404);
  }
};
