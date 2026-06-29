import * as savedEventsService from './savedEvents.service.js';
import { success, error } from '../../utils/response.js';

export const getSavedEvents = async (req, res, next) => {
  try {
    const events = await savedEventsService.getSavedEvents(req.user.id);
    return success(res, events);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const saveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return error(res, 'eventId is required', 400);
    }
    await savedEventsService.saveEvent(req.user.id, eventId);
    return success(res, null, 'Event saved successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const unsaveEvent = async (req, res, next) => {
  try {
    await savedEventsService.unsaveEvent(req.user.id, Number(req.params.eventId));
    return success(res, null, 'Event unsaved successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const checkSaved = async (req, res, next) => {
  try {
    const { default: repo } = await import('./savedEvents.repository.js');
    const saved = await repo.findByUserAndEvent(req.user.id, Number(req.params.eventId));
    return success(res, { saved: !!saved });
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
