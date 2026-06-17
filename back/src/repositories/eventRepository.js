import { pool } from "../utils/database.js";

export async function getAllEvents() {
  // TODO: return all events
  return [];
}

export async function getUpcomingEvents() {
  // TODO: return upcoming events
  return [];
}

export async function getEventById(id) {
  // TODO: return event by id
  return null;
}

export async function createEvent(eventData) {
  // TODO: insert into events table
  return eventData;
}

export async function updateEvent(id, updatedData) {
  // TODO: update event
  return null;
}

export async function deleteEvent(id) {
  // TODO: delete event
}

export async function registerUser(userId, eventId) {
  // TODO: insert registration record
  return { userId, eventId };
}

export async function getUserHistory(userId) {
  // TODO: return user's registered events (upcoming + past)
  return [];
}

export async function getOrganizerDashboard(organizerId) {
  // TODO: return events with participant counts for this organizer
  return [];
}

export async function getPendingApprovals() {
  // TODO: return events pending approval
  return [];
}

export async function approve(eventId) {
  // TODO: set event status to approved
}

export async function reject(eventId) {
  // TODO: set event status to rejected
}

export async function ban(eventId, reason) {
  // TODO: mark event as banned
}
