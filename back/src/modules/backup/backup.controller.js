import fs from 'fs';
import * as backupService from './backup.service.js';
import { success, created, error } from '../../utils/response.js';

export const listTables = async (req, res, next) => {
  try {
    const tables = await backupService.listTables();
    return success(res, tables);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const previewRows = async (req, res, next) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const rows = await backupService.previewRows(req.params.table, ids);
    return success(res, rows);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createFullBackup = async (req, res, next) => {
  try {
    const result = await backupService.createFullBackup({ createdBy: req.user.id, triggerType: 'manual' });
    return created(res, result, 'Full backup created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createTablesBackup = async (req, res, next) => {
  try {
    const tables = (req.body && Array.isArray(req.body.tables)) ? req.body.tables : [];
    const result = await backupService.createTablesBackup(tables, {
      createdBy: req.user.id,
      triggerType: 'manual',
    });
    return created(res, result, 'Tables backup created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const createRowsBackup = async (req, res, next) => {
  try {
    const result = await backupService.createRowsBackup(
      { table: req.body.table, ids: req.body.ids },
      { createdBy: req.user.id, triggerType: 'manual' }
    );
    return created(res, result, 'Row backup created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const restoreBackup = async (req, res, next) => {
  try {
    await backupService.restoreBackup(req.body.filename);
    return success(res, null, 'Backup restored successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getBackups = async (req, res, next) => {
  try {
    const backups = await backupService.getBackups(req.query);
    return success(res, backups);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const downloadBackup = async (req, res, next) => {
  try {
    const filepath = backupService.getBackupFilePath(req.params.filename);
    if (!fs.existsSync(filepath)) {
      return error(res, 'File not found', 404);
    }
    res.download(filepath, req.params.filename);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const deleteBackup = async (req, res, next) => {
  try {
    await backupService.deleteBackup(req.params.filename);
    return success(res, null, 'Backup deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};
