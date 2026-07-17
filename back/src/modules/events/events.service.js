import * as eventsRepository from './events.repository.js';
import { logActivity } from '../activityLogs/activityLogs.service.js';

export const getAllEvents = async (query, user) => {
  return eventsRepository.findAll(query, user);
};

export const getUpcomingEvents = async (query) => {
  return eventsRepository.findUpcoming(query);
};

export const getMyEvents = async (organizerId, query) => {
  return eventsRepository.findByOrganizer(organizerId, query);
};

export const getEventById = async (id) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  return event;
};

export const createEvent = async (data) => {
  const eventId = await eventsRepository.create(data);
  const event = await eventsRepository.findById(eventId);
  logActivity(data.organizerId, 'create_event', JSON.stringify({ eventId, eventTitle: event?.title || 'Untitled' }));
  return event;
};

export const saveDraft = async (data) => {
  const sanitized = {
    title: data.title || 'Untitled Draft',
    description: data.description || ' ',
    date: data.date ? new Date(data.date).toISOString().slice(0, 19).replace('T', ' ') : new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
    location: data.location || ' ',
    category: data.category || 'other',
    maxParticipants: data.maxParticipants || 100,
    image: data.image || null,
    organizerId: data.organizerId,
    status: 'draft',
  };
  const eventId = await eventsRepository.create(sanitized);
  return eventsRepository.findById(eventId);
};

export const updateEvent = async (id, data, user) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  const ADMIN_ROLES = ['superadmin', 'developer', 'coordinator'];
  if (!ADMIN_ROLES.includes(user.role) && event.organizerId !== user.id) {
    const err = new Error('Not authorized to update this event');
    err.statusCode = 403;
    throw err;
  }

  const allowedFields = ['title', 'description', 'date', 'location', 'category', 'maxParticipants', 'image'];
  const updates = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const isAdmin = ADMIN_ROLES.includes(user.role);
  if (!isAdmin && Object.keys(updates).length > 0) {
    updates.status = 'pending';
    updates.rejectionReason = null;
    updates.verifiedBy = null;
    updates.verifiedAt = null;
  }

  await eventsRepository.update(id, updates);
  return eventsRepository.findById(id);
};

export const deleteEvent = async (id, user) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (!ADMIN_ROLES.includes(user.role) && event.organizerId !== user.id) {
    const err = new Error('Not authorized to delete this event');
    err.statusCode = 403;
    throw err;
  }
  await eventsRepository.remove(id);
};

// ---- Event Verification (admin only) ----

export const approveEvent = async (id, user) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  await eventsRepository.update(id, {
    status: 'approved',
    rejectionReason: null,
    verifiedBy: user.id,
    verifiedAt: new Date(),
  });
  logActivity(event.organizerId, 'event_approved', JSON.stringify({ eventId: id, eventTitle: event.title }));
  return eventsRepository.findById(id);
};

export const rejectEvent = async (id, user, reason) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (!reason || !reason.trim()) {
    const err = new Error('A rejection reason is required');
    err.statusCode = 400;
    throw err;
  }
  await eventsRepository.update(id, {
    status: 'rejected',
    rejectionReason: reason.trim(),
    verifiedBy: user.id,
    verifiedAt: new Date(),
  });
  logActivity(event.organizerId, 'event_rejected', JSON.stringify({ eventId: id, eventTitle: event.title, reason: reason.trim() }));
  return eventsRepository.findById(id);
};
