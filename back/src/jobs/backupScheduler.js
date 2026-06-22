import cron from 'node-cron';
import * as backupService from '../modules/backup/backup.service.js';
import logger from '../config/logger.js';

// Runs an automatic full database backup once every 24 hours, at midnight
// server time. Triggered backups are recorded with trigger = 'scheduled'
// (createdBy = null) so the admin Backup & Recovery screen can tell manual
// and automatic backups apart.
export const startBackupScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled 24-hour full backup...');
    try {
      const result = await backupService.createFullBackup({ createdBy: null, triggerType: 'scheduled' });
      logger.info(`Scheduled backup completed: ${result.filename}`);
    } catch (err) {
      logger.error('Scheduled backup failed:', err.message);
    }
  });

  logger.info('Backup scheduler started — automatic full backup runs daily at 00:00.');
};
