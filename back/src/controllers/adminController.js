import * as userRepository from "../repositories/userRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import * as reportRepository from "../repositories/reportRepository.js";
import * as activityLogRepository from "../repositories/activityLogRepository.js";
import * as backupRepository from "../repositories/backupRepository.js";

export async function banUser(req, res) {
  try {
    const { userId, reason } = req.body;
    await userRepository.ban(userId, reason);
    await activityLogRepository.log(req.user.id, `Banned user ${userId}: ${reason}`);
    res.json({ message: "User banned successfully" });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function banEvent(req, res) {
  try {
    const { eventId, reason } = req.body;
    await eventRepository.ban(eventId, reason);
    await activityLogRepository.log(req.user.id, `Banned event ${eventId}: ${reason}`);
    res.json({ message: "Event banned successfully" });
  } catch (error) {
    console.error("Error banning event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await userRepository.getAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await eventRepository.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getApprovals(req, res) {
  try {
    const approvals = await eventRepository.getPendingApprovals();
    res.json(approvals);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function approveEvent(req, res) {
  try {
    await eventRepository.approve(req.params.id);
    await activityLogRepository.log(req.user.id, `Approved event ${req.params.id}`);
    res.json({ message: "Event approved" });
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function rejectEvent(req, res) {
  try {
    await eventRepository.reject(req.params.id);
    await activityLogRepository.log(req.user.id, `Rejected event ${req.params.id}`);
    res.json({ message: "Event rejected" });
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getAdminLogs(req, res) {
  try {
    const logs = await activityLogRepository.getByUser(req.user.id);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function fullBackup(req, res) {
  try {
    const result = await backupRepository.fullBackup();
    await activityLogRepository.log(req.user.id, "Performed full backup");
    res.json(result);
  } catch (error) {
    console.error("Error performing full backup:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function incrementalBackup(req, res) {
  try {
    const result = await backupRepository.incrementalBackup();
    await activityLogRepository.log(req.user.id, "Performed incremental backup");
    res.json(result);
  } catch (error) {
    console.error("Error performing incremental backup:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function restoreBackup(req, res) {
  try {
    const { backupId } = req.body;
    const result = await backupRepository.restore(backupId);
    await activityLogRepository.log(req.user.id, `Restored backup ${backupId}`);
    res.json(result);
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ message: "Server error" });
  }
}
