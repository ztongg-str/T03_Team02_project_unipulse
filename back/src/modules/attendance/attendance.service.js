import * as attendanceRepository from './attendance.repository.js';
import * as usersRepository from '../users/users.repository.js';
import { checkAndGrant } from '../achievements/achievements.service.js';

export const checkIn = async (userId, eventId) => {
  const event = await attendanceRepository.findEventById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }

  const registration = await attendanceRepository.findByUserAndEvent(userId, eventId);
  if (!registration) {
    const err = new Error('Registration not found. You are not registered for this event.');
    err.statusCode = 404;
    throw err;
  }

  if (registration.status === 'Attended') {
    const err = new Error('Already checked in. You have already been marked as attended.');
    err.statusCode = 400;
    throw err;
  }

  await attendanceRepository.updateStatus(userId, eventId);

  const xpEarned = 50;
  const existingHistory = await attendanceRepository.findPastHistory(userId, eventId);
  if (existingHistory) {
    await attendanceRepository.updatePastHistory(userId, eventId, {
      attended: true,
      xpEarned,
      status: 'attended',
    });
  } else {
    await attendanceRepository.createPastHistory({
      userId,
      eventId,
      registrationId: registration.id,
      attended: true,
      xpEarned,
      status: 'attended',
    });
  }

  await attendanceRepository.removeUpcoming(userId, eventId);

  const { leveledUp } = await usersRepository.addXp(userId, xpEarned);
  if (leveledUp) {
    await checkAndGrant(userId, 'level_5');
    await checkAndGrant(userId, 'level_10');
  }
  await checkAndGrant(userId, 'attend_3_events');

  return { xpEarned, leveledUp };
};

export const checkInByCode = async (userId, code) => {
  const event = await attendanceRepository.findByCheckinCode(code);
  if (!event) {
    const err = new Error('Invalid check-in code');
    err.statusCode = 404;
    throw err;
  }
  return checkIn(userId, event.id);
};

export const getUserHistory = async (userId) => {
  const registrations = await attendanceRepository.getRegistrationsWithStatus(userId);

  return registrations.map((r) => {
    const now = new Date();
    const eventDate = new Date(r.date);
    let displayStatus = r.status;

    if (r.status === 'Registered' && eventDate < now) {
      displayStatus = 'Missing';
    }

    return {
      id: r.id,
      registrationId: r.id,
      eventId: r.eventId,
      title: r.title,
      description: r.description,
      date: r.date,
      location: r.location,
      category: r.category,
      image: r.image,
      status: displayStatus,
      attendedAt: r.attended_at,
      registeredAt: r.registeredAt,
      eventStatus: r.eventStatus,
    };
  });
};
