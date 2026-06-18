import * as backupService from './backup.service.js';
import { success, created, error } from '../../utils/response.js';

export const createFullBackup = async (req, res, next) => {
  try {
    const result = await backupService.createFullBackup();
    return created(res, result, 'Full backup created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createIncrementalBackup = async (req, res, next) => {
  try {
    const result = await backupService.createIncrementalBackup();
    return created(res, result, 'Incremental backup created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const restoreBackup = async (req, res, next) => {
  try {
    await backupService.restoreBackup(req.body.backupFile);
    return success(res, null, 'Backup restored successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getBackups = async (req, res, next) => {
  try {
    const backups = await backupService.getBackups();
    return success(res, backups);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
