import * as adminRepository from './admin.repository.js';
import { hashPassword } from '../../utils/password.js';
import logger from '../../config/logger.js';

export const getDashboard = async () => {
  return adminRepository.getDashboardStats();
};

export const getAdminLogs = async (query) => {
  return adminRepository.getLogs(query);
};

export const createAdmin = async ({ username, email, password, fullName, role }) => {
  const hashedPassword = await hashPassword(password);
  const userId = await adminRepository.createAdminUser({
    username,
    email,
    password: hashedPassword,
    fullName,
    role,
  });
  return { id: userId, username, email, fullName, role };
};

export const getSystemHealth = async () => {
  const startedAt = Date.now();
  let dbStatus = 'up';
  let dbLatencyMs = null;
  try {
    dbLatencyMs = await adminRepository.pingDatabase();
  } catch (err) {
    dbStatus = 'down';
    logger.error('System health DB check failed:', err.message);
  }

  const [tableCounts, lastBackup] = await Promise.all([
    adminRepository.getTableCounts().catch(() => ({})),
    adminRepository.getLastBackup().catch(() => null),
  ]);

  const mem = process.memoryUsage();

  return {
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    server: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
    },
    tableCounts,
    lastBackup: lastBackup
      ? {
          filename: lastBackup.filename,
          type: lastBackup.type,
          trigger: lastBackup.trigger_type,
          status: lastBackup.status,
          createdAt: lastBackup.createdAt,
        }
      : null,
    checkedAt: new Date(startedAt).toISOString(),
  };
};
