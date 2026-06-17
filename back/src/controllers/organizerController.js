import * as eventRepository from "../repositories/eventRepository.js";
import * as achievementRepository from "../repositories/achievementRepository.js";
import * as streakRepository from "../repositories/streakRepository.js";
import * as activityLogRepository from "../repositories/activityLogRepository.js";

export async function getDashboard(req, res) {
  try {
    const dashboard = await eventRepository.getOrganizerDashboard(req.user.id);
    res.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getStreak(req, res) {
  try {
    const streak = await streakRepository.getByUser(req.user.id);
    res.json(streak);
  } catch (error) {
    console.error("Error fetching streak:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getAchievements(req, res) {
  try {
    const achievements = await achievementRepository.getByUser(req.user.id);
    res.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getActivityLog(req, res) {
  try {
    const logs = await activityLogRepository.getByUser(req.user.id);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity log:", error);
    res.status(500).json({ message: "Server error" });
  }
}
