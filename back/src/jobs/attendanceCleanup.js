import pool from '../config/database.js';
import logger from '../config/logger.js';

const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

async function markMissingAttendees() {
  try {
    const [result] = await pool.query(
      `UPDATE registrations r
       JOIN events e ON r.eventId = e.id
       SET r.status = 'Missing'
       WHERE r.status = 'Registered'
         AND e.date < NOW() - INTERVAL 30 MINUTE`
    );

    if (result.affectedRows > 0) {
      const [historyResult] = await pool.query(
        `INSERT IGNORE INTO past_event_history (userId, eventId, registrationId, attended, xpEarned, status)
         SELECT r.userId, r.eventId, r.id, FALSE, 0, 'missed'
         FROM registrations r
         JOIN events e ON r.eventId = e.id
         WHERE r.status = 'Missing'
           AND e.date < NOW() - INTERVAL 30 MINUTE`
      );

      const [upcomingResult] = await pool.query(
        `DELETE ue FROM upcoming_events ue
         JOIN registrations r ON ue.userId = r.userId AND ue.eventId = r.eventId
         WHERE r.status = 'Missing'`
      );

      logger.info(`Attendance cleanup: ${result.affectedRows} marked as Missing, ${historyResult.affectedRows} history entries created, ${upcomingResult.affectedRows} upcoming entries removed`);
    }
  } catch (err) {
    logger.error('Attendance cleanup error:', err.message);
  }
}

export function startAttendanceCleanup() {
  logger.info(`Attendance cleanup scheduled every ${CLEANUP_INTERVAL_MS / 60000} minutes`);
  markMissingAttendees();
  setInterval(markMissingAttendees, CLEANUP_INTERVAL_MS);
}
