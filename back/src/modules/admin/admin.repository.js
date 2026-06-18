import pool from '../../config/database.js';

export const getDashboardStats = async (organizerId) => {
  const [eventCount] = await pool.query(
    'SELECT COUNT(*) as total FROM events WHERE organizerId = ?', [organizerId]
  );
  const [regCount] = await pool.query(
    `SELECT COUNT(*) as total FROM registrations r
     JOIN events e ON r.eventId = e.id WHERE e.organizerId = ?`,
    [organizerId]
  );
  const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
  const [pendingReportCount] = await pool.query(
    "SELECT COUNT(*) as total FROM reports WHERE status = 'pending'"
  );
  const [recentEvents] = await pool.query(
    `SELECT id, title, status, date FROM events
     WHERE organizerId = ? ORDER BY createdAt DESC LIMIT 5`,
    [organizerId]
  );

  return {
    stats: {
      totalEvents: eventCount[0].total,
      totalRegistrations: regCount[0].total,
      totalUsers: userCount[0].total,
      pendingReports: pendingReportCount[0].total,
    },
    recentEvents,
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
