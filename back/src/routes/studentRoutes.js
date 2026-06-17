import { Router } from "express";
import {
  getHomeFeed,
  getEvents,
  registerForEvent,
  getHistory,
  searchFriends,
  addFriend,
  viewFriendProfile,
  getProfile,
  getAchievements,
  getStreak,
  getActivityLog,
} from "../controllers/studentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const studentRouter = Router();

studentRouter.use(authenticate);

studentRouter.get("/home", getHomeFeed);
studentRouter.get("/events", getEvents);
studentRouter.post("/events/:id/register", registerForEvent);
studentRouter.get("/history", getHistory);
studentRouter.get("/friends/search", searchFriends);
studentRouter.post("/friends/add", addFriend);
studentRouter.get("/friends/:id/profile", viewFriendProfile);
studentRouter.get("/profile", getProfile);
studentRouter.get("/achievements", getAchievements);
studentRouter.get("/streak", getStreak);
studentRouter.get("/activity-log", getActivityLog);

export default studentRouter;
