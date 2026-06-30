import cron from 'node-cron';
import * as historyRepository from '../modules/history/history.repository.js';
import logger from '../config/logger.js';

export const startEventExpiryScheduler = () => {
  cron.schedule('* * * * *', async () => {
    logger.info('Running event expiry check...');
    try {
      const result = await historyRepository.expireAllUpcomingEvents();
      if (result.upcomingMoved > 0 || result.orphansCreated > 0) {
        logger.info(`Event expiry completed: ${result.upcomingMoved} upcoming moved, ${result.orphansCreated} orphans created`);
      }
    } catch (err) {
      logger.error('Event expiry check failed:', err.message);
    }
  });

  logger.info('Event expiry scheduler started — runs every 1 minute.');
};
