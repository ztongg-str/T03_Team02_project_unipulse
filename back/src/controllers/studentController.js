import * as eventRepository from "../repositories/eventRepository.js";
import * as friendRepository from "../repositories/friendRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import * as achievementRepository from "../repositories/achievementRepository.js";
import * as streakRepository from "../repositories/streakRepository.js";
import * as activityLogRepository from "../repositories/activityLogRepository.js";

export async function getHomeFeed(req, res) {
  try {
    const events = await eventRepository.getUpcomingEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching home feed:", error);
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

export async function registerForEvent(req, res) {
  try {
    const registration = await eventRepository.registerUser(req.user.id, req.params.id);
    await activityLogRepository.log(req.user.id, `Registered for event ${req.params.id}`);
    res.status(201).json(registration);
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getHistory(req, res) {
  try {
    const history = await eventRepository.getUserHistory(req.user.id);
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function searchFriends(req, res) {
  try {
    const { query } = req.query;
    const results = await friendRepository.search(query, req.user.id);
    res.json(results);
  } catch (error) {
    console.error("Error searching friends:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function addFriend(req, res) {
  try {
    const { friendId } = req.body;
    const result = await friendRepository.addFriend(req.user.id, friendId);
    await activityLogRepository.log(req.user.id, `Added friend ${friendId}`);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function viewFriendProfile(req, res) {
  try {
    const profile = await userRepository.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error viewing friend profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const profile = await userRepository.getProfile(req.user.id);
    const achievements = await achievementRepository.getByUser(req.user.id);
    const streak = await streakRepository.getByUser(req.user.id);
    res.json({ ...profile, achievements, streak });
  } catch (error) {
    console.error("Error fetching profile:", error);
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

export async function getStreak(req, res) {
  try {
    const streak = await streakRepository.getByUser(req.user.id);
    res.json(streak);
  } catch (error) {
    console.error("Error fetching streak:", error);
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
