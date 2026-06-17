import * as eventRepository from "../repositories/eventRepository.js";
import * as activityLogRepository from "../repositories/activityLogRepository.js";

export async function getAllEvents(req, res) {
  try {
    const events = await eventRepository.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getEventById(req, res) {
  try {
    const event = await eventRepository.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function createEvent(req, res) {
  try {
    const event = await eventRepository.createEvent({ ...req.body, organizerId: req.user.id });
    await activityLogRepository.log(req.user.id, `Created event ${event.id}`);
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await eventRepository.updateEvent(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    await activityLogRepository.log(req.user.id, `Updated event ${req.params.id}`);
    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteEvent(req, res) {
  try {
    await eventRepository.deleteEvent(req.params.id);
    await activityLogRepository.log(req.user.id, `Deleted event ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
}
