import * as eventsRepository from './events.repository.js';

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
  return eventsRepository.findById(eventId);
};

export const updateEvent = async (id, data, user) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (event.organizerId !== user.id) {
    const err = new Error('Not authorized to update this event');
    err.statusCode = 403;
    throw err;
  }

  const allowedFields = ['title', 'description', 'date', 'location', 'category', 'maxParticipants', 'image'];
  const updates = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
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
  if (event.organizerId !== user.id) {
    const err = new Error('Not authorized to delete this event');
    err.statusCode = 403;
    throw err;
  }
  await eventsRepository.remove(id);
};

export const approveEvent = async (id, user) => {
  const event = await eventsRepository.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.statusCode = 404;
    throw err;
  }
  if (event.organizerId !== user.id) {
    const err = new Error('Not authorized to approve this event');
    err.statusCode = 403;
    throw err;
  }
  await eventsRepository.update(id, { status: 'approved' });
  return eventsRepository.findById(id);
};
