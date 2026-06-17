import { Router } from "express";
import {
  banUser,
  banEvent,
  getUsers,
  getEvents,
  getApprovals,
  approveEvent,
  rejectEvent,
  getAdminLogs,
  fullBackup,
  incrementalBackup,
  restoreBackup,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const adminRouter = Router();

adminRouter.use(authenticate, authorize("admin"));

adminRouter.post("/ban/user", banUser);
adminRouter.post("/ban/event", banEvent);
adminRouter.get("/users", getUsers);
adminRouter.get("/events", getEvents);
adminRouter.get("/approvals", getApprovals);
adminRouter.put("/approvals/:id/approve", approveEvent);
adminRouter.put("/approvals/:id/reject", rejectEvent);
adminRouter.get("/logs", getAdminLogs);
adminRouter.post("/backup", fullBackup);
adminRouter.post("/backup/incremental", incrementalBackup);
adminRouter.post("/backup/restore", restoreBackup);

export default adminRouter;
