import * as friendsRepository from './friends.repository.js';
import * as usersRepository from '../users/users.repository.js';
import { checkAndGrant } from '../achievements/achievements.service.js';

export const getMyFriends = async (userId) => {
  return friendsRepository.findByUserId(userId);
};

export const searchFriends = async (userId, query) => {
  if (!query || query.trim() === '') return [];
  return friendsRepository.searchUsers(query, userId);
};

export const addFriend = async (userId, friendUserId) => {
  if (userId === Number(friendUserId)) {
    const err = new Error('Cannot add yourself as a friend');
    err.statusCode = 400;
    throw err;
  }
  const friendUser = await usersRepository.findById(friendUserId);
  if (!friendUser) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const existing = await friendsRepository.findFriendship(userId, friendUserId);
  if (existing) {
    const err = new Error('Already friends');
    err.statusCode = 409;
    throw err;
  }
  const id = await friendsRepository.create(userId, friendUserId);

  await checkAndGrant(userId, 'add_3_friends');
  await checkAndGrant(userId, 'add_10_friends');

  return friendsRepository.findById(id);
};

export const removeFriend = async (id, user) => {
  const friendship = await friendsRepository.findById(id);
  if (!friendship) {
    const err = new Error('Friendship not found');
    err.statusCode = 404;
    throw err;
  }
  if (friendship.userId !== user.id && friendship.friendId !== user.id) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }
  await friendsRepository.remove(id);
};

export const viewFriendProfile = async (userId, friendUserId) => {
  const isFriend = await friendsRepository.findFriendship(userId, friendUserId);
  if (!isFriend) {
    const err = new Error('Not friends with this user');
    err.statusCode = 403;
    throw err;
  }
  const user = await usersRepository.findById(friendUserId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};
