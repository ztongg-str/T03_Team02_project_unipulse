import * as savedEventsRepository from './savedEvents.repository.js';

export const getSavedEvents = async (userId) => {
  return savedEventsRepository.findAll(userId);
};

export const saveEvent = async (userId, eventId) => {
  const existing = await savedEventsRepository.findByUserAndEvent(userId, eventId);
  if (existing) {
    throw Object.assign(new Error('Event already saved'), { statusCode: 409 });
  }
  return savedEventsRepository.create(userId, eventId);
};

export const unsaveEvent = async (userId, eventId) => {
  const existing = await savedEventsRepository.findByUserAndEvent(userId, eventId);
  if (!existing) {
    throw Object.assign(new Error('Saved event not found'), { statusCode: 404 });
  }
  await savedEventsRepository.remove(userId, eventId);
};
