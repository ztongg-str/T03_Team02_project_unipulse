import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import { startBackupScheduler } from './jobs/backupScheduler.js';
import { startEventExpiryScheduler } from './jobs/eventExpiryScheduler.js';

app.listen(env.port, () => {
  logger.info(`UniPulse server running on port ${env.port}`);
  startBackupScheduler();
  startEventExpiryScheduler();
});
