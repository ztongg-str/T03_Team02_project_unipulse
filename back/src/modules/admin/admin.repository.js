import pool from '../../config/database.js';

export const getDashboardStats = async () => {
  const [[userTotals]] = await pool.query('SELECT COUNT(*) as total FROM users');
  const [usersByRole] = await pool.query(
    "SELECT role, COUNT(*) as total FROM users GROUP BY role"
  );
  const [eventsByStatus] = await pool.query(
    "SELECT status, COUNT(*) as total FROM events GROUP BY status"
  );
  const [[eventTotals]] = await pool.query('SELECT COUNT(*) as total FROM events');
  const [[regTotals]] = await pool.query('SELECT COUNT(*) as total FROM registrations');
  const [[pendingReportCount]] = await pool.query(
    "SELECT COUNT(*) as total FROM reports WHERE status = 'pending'"
  );
  const [recentEvents] = await pool.query(
    `SELECT e.id, e.title, e.status, e.date, e.createdAt, u.fullName as organizerName
     FROM events e JOIN users u ON e.organizerId = u.id
     ORDER BY e.createdAt DESC LIMIT 5`
  );
  const [recentUsers] = await pool.query(
    `SELECT id, username, fullName, role, status, createdAt
     FROM users ORDER BY createdAt DESC LIMIT 5`
  );

  const roleMap = { student: 0, organizer: 0, admin: 0 };
  for (const r of usersByRole) roleMap[r.role] = r.total;

  const statusMap = { pending: 0, approved: 0, rejected: 0 };
  for (const s of eventsByStatus) statusMap[s.status] = s.total;

  return {
    totalUsers: userTotals.total,
    usersByRole: roleMap,
    totalEvents: eventTotals.total,
    eventsByStatus: statusMap,
    pendingVerifications: statusMap.pending,
    totalRegistrations: regTotals.total,
    pendingReports: pendingReportCount.total,
    recentEvents,
    recentUsers,
  };
};

export const getLogs = async ({ page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT al.*, u.username
     FROM activity_logs al JOIN users u ON al.userId = u.id
     ORDER BY al.createdAt DESC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
};

const TRACKED_TABLES = [
  'users', 'events', 'registrations', 'friends', 'achievements',
  'activity_logs', 'reports', 'saved_events', 'backups',
];

export const getTableCounts = async () => {
  const counts = {};
  for (const table of TRACKED_TABLES) {
    const [[row]] = await pool.query(`SELECT COUNT(*) as total FROM \`${table}\``);
    counts[table] = row.total;
  }
  return counts;
};

export const pingDatabase = async () => {
  const start = Date.now();
  await pool.query('SELECT 1');
  return Date.now() - start;
};

export const getLastBackup = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM backups WHERE status = 'success' ORDER BY createdAt DESC LIMIT 1`
  );
  return rows[0] || null;
};
