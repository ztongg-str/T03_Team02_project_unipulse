import * as activityLogsRepository from './activityLogs.repository.js';

export const getMyActivityLogs = async (userId) => {
  return activityLogsRepository.findByUserId(userId);
};

export const logActivity = async (userId, action, details) => {
  await activityLogsRepository.create(userId, action, details);
};
