import { Router } from "express";
import {
  getDashboard,
  getStreak,
  getAchievements,
  getActivityLog,
} from "../controllers/organizerController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const organizerRouter = Router();

organizerRouter.use(authenticate, authorize("organizer"));

organizerRouter.get("/dashboard", getDashboard);
organizerRouter.get("/streak", getStreak);
organizerRouter.get("/achievements", getAchievements);
organizerRouter.get("/activity-log", getActivityLog);

export default organizerRouter;
