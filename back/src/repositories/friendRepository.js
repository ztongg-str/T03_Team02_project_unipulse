import { pool } from "../utils/database.js";

export async function search(query, currentUserId) {
  // TODO: search users by name/email excluding current user
  return [];
}

export async function addFriend(userId, friendId) {
  // TODO: insert friend relationship
  return { userId, friendId };
}
