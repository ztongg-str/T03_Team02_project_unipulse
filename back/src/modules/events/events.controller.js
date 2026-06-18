import * as eventsService from './events.service.js';
import { success, created, error } from '../../utils/response.js';

export const getAllEvents = async (req, res, next) => {
  try {
    const result = await eventsService.getAllEvents(req.query, req.user);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getUpcomingEvents(req.query);
    return success(res, events);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getMyEvents(req.user.id, req.query);
    return success(res, events);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    return success(res, event);
  } catch (err) {
    return error(res, err.message, err.statusCode || 404);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent({ ...req.body, organizerId: req.user.id });
    return created(res, event, 'Event created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body, req.user);
    return success(res, event, 'Event updated successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventsService.deleteEvent(req.params.id, req.user);
    return success(res, null, 'Event deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const approveEvent = async (req, res, next) => {
  try {
    const event = await eventsService.approveEvent(req.params.id, req.user);
    return success(res, event, 'Event approved successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
