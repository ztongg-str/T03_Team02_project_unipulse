import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import env from '../../config/env.js';
import logger from '../../config/logger.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupsDir = join(__dirname, '../../../backups');

const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

const buildDumpCmd = (extraFlags) => {
  const pw = env.db.password ? `-p${env.db.password}` : '';
  return `mysqldump -h ${env.db.host} -P ${env.db.port} -u ${env.db.user} ${pw} --ssl-mode=REQUIRED ${extraFlags} ${env.db.name}`;
};

const buildRestoreCmd = () => {
  const pw = env.db.password ? `-p${env.db.password}` : '';
  return `mysql -h ${env.db.host} -P ${env.db.port} -u ${env.db.user} ${pw} --ssl-mode=REQUIRED ${env.db.name}`;
};

export const createFullBackup = async () => {
  const filename = `full_backup_${getTimestamp()}.sql`;
  const filepath = join(backupsDir, filename);
  try {
    await execAsync(`${buildDumpCmd('')} > "${filepath}"`);
    logger.info(`Full backup created: ${filename}`);
    return { filename, filepath, type: 'full' };
  } catch (err) {
    logger.error('Backup failed:', err.message);
    const error = new Error('Failed to create full backup. Ensure mysqldump is installed.');
    error.statusCode = 500;
    throw error;
  }
};

export const createIncrementalBackup = async () => {
  const filename = `incremental_backup_${getTimestamp()}.sql`;
  const filepath = join(backupsDir, filename);
  try {
    await execAsync(`${buildDumpCmd('--no-create-info')} > "${filepath}"`);
    logger.info(`Incremental backup created: ${filename}`);
    return { filename, filepath, type: 'incremental' };
  } catch (err) {
    logger.error('Incremental backup failed:', err.message);
    const error = new Error('Failed to create incremental backup.');
    error.statusCode = 500;
    throw error;
  }
};

export const restoreBackup = async (backupFile) => {
  if (!backupFile) {
    const err = new Error('Backup filename is required');
    err.statusCode = 400;
    throw err;
  }
  const filepath = join(backupsDir, backupFile);
  try {
    await execAsync(`${buildRestoreCmd()} < "${filepath}"`);
    logger.info(`Backup restored: ${backupFile}`);
  } catch (err) {
    logger.error('Restore failed:', err.message);
    const error = new Error('Failed to restore backup.');
    error.statusCode = 500;
    throw error;
  }
};

export const getBackups = async () => {
  try {
    const files = await readdir(backupsDir);
    return files
      .filter((f) => f.endsWith('.sql'))
      .map((f) => ({ filename: f, type: f.startsWith('full') ? 'full' : 'incremental' }))
      .sort((a, b) => b.filename.localeCompare(a.filename));
  } catch {
    return [];
  }
};
