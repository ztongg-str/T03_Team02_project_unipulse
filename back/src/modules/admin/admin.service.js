import * as adminRepository from './admin.repository.js';

export const getDashboard = async (organizerId) => {
  return adminRepository.getDashboardStats(organizerId);
};

export const getAdminLogs = async (query) => {
  return adminRepository.getLogs(query);
};
