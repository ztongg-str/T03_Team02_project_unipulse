import * as registrationsService from './registrations.service.js';
import { success, created, error } from '../../utils/response.js';

export const registerForEvent = async (req, res, next) => {
  try {
    const registration = await registrationsService.registerForEvent(req.user.id, req.body.eventId);
    return created(res, registration, 'Registered for event successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
export const checkRegistration = async (req, res, next) => {
  try {
    const result = await registrationsService.checkRegistration(req.params.eventId, req.user.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationsService.getMyRegistrations(req.user.id);
    return success(res, registrations);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationsService.getEventRegistrations(req.params.eventId, req.user);
    return success(res, registrations);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
