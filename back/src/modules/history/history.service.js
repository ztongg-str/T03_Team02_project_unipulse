import * as historyRepository from './history.repository.js';
import * as registrationsRepository from '../registrations/registrations.repository.js';
import * as eventsRepository from '../events/events.repository.js';
import { checkAndGrant } from '../achievements/achievements.service.js';

export const getUpcomingEvents = async (userId) => {
  return historyRepository.findUpcomingByUser(userId);
};

export const getPastHistory = async (userId) => {
  return historyRepository.findPastByUser(userId);
};

export const moveExpiredEvents = async (userId) => {
  const expired = await historyRepository.findExpiredRegistrations(userId);
  let moved = 0;
  for (const reg of expired) {
    await historyRepository.moveRegistrationToPast(reg);
    await historyRepository.removeUpcomingRegistration(reg.userId, reg.eventId);
    moved++;
  }
  return { moved };
};

export const markAttendance = async (registrationId, organizerId, attended) => {
  const registration = await registrationsRepository.findById(registrationId);
  if (!registration) {
    const err = new Error('Registration not found');
    err.statusCode = 404;
    throw err;
  }
  const event = await eventsRepository.findById(registration.eventId);
  if (!event || event.organizerId !== organizerId) {
    const err = new Error('Not authorized to mark attendance for this event');
    err.statusCode = 403;
    throw err;
  }
  const existing = await historyRepository.findByUserAndEvent(registration.userId, registration.eventId);
  if (existing) {
    const err = new Error('Attendance already recorded for this registration');
    err.statusCode = 409;
    throw err;
  }
  const xpEarned = attended ? 50 : 0;
  const historyId = await historyRepository.create({
    userId: registration.userId,
    eventId: registration.eventId,
    registrationId,
    attended,
    xpEarned,
    status: attended ? 'attended' : 'missed'
  });
  await historyRepository.removeUpcoming(registration.userId, registration.eventId);

  if (attended) {
    await checkAndGrant(registration.userId, 'attend_3_events');
  }

  return historyRepository.findById(historyId);
};
