import * as registrationsRepository from './registrations.repository.js';
import * as eventsRepository from '../events/events.repository.js';

export const registerForEvent = async (userId, eventId) => {
  const event = await eventsRepository.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (event.status !== 'approved') {
    const err = new Error('Event is not open for registration');
    err.statusCode = 400;
    throw err;
  }
  const existing = await registrationsRepository.findByUserAndEvent(userId, eventId);
  if (existing) {
    const err = new Error('Already registered for this event');
    err.statusCode = 409;
    throw err;
  }
  const count = await registrationsRepository.countByEvent(eventId);
  if (count >= event.maxParticipants) {
    const err = new Error('Event is full');
    err.statusCode = 400;
    throw err;
  }
  const regId = await registrationsRepository.create(userId, eventId);
  return registrationsRepository.findById(regId);
};

export const cancelRegistration = async (id, user) => {
  const registration = await registrationsRepository.findById(id);
  if (!registration) {
    const err = new Error('Registration not found');
    err.statusCode = 404;
    throw err;
  }
  if (registration.userId !== user.id) {
    const err = new Error('Not authorized to cancel this registration');
    err.statusCode = 403;
    throw err;
  }
  await registrationsRepository.remove(id);
};

export const getMyRegistrations = async (userId) => {
  return registrationsRepository.findByUser(userId);
};

export const getEventRegistrations = async (eventId, user) => {
  const event = await eventsRepository.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (event.organizerId !== user.id) {
    const err = new Error('Not authorized to view these registrations');
    err.statusCode = 403;
    throw err;
  }
  return registrationsRepository.findByEvent(eventId);
};
