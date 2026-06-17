import { pool } from "../utils/database.js";

export async function findByEmail(email) {
  // TODO: query database
  return null;
}

export async function create(userData) {
  // TODO: insert into users table
  return userData;
}

export async function getProfile(userId) {
  // TODO: return user profile by id
  return null;
}

export async function getAll() {
  // TODO: return all users
  return [];
}

export async function ban(userId, reason) {
  // TODO: mark user as banned
}
