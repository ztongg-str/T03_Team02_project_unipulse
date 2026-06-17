import { Router } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const eventRouter = Router();

eventRouter.get("/", getAllEvents);
eventRouter.get("/:id", getEventById);

eventRouter.post("/", authenticate, authorize("organizer", "admin"), createEvent);
eventRouter.put("/:id", authenticate, authorize("organizer", "admin"), updateEvent);
eventRouter.delete("/:id", authenticate, authorize("organizer", "admin"), deleteEvent);

export default eventRouter;
