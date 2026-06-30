import { writeFile, readFile } from 'fs/promises';
import { join, normalize } from 'path';
import * as backupRepository from './backup.repository.js';
import { dumpTables, dumpRows, executeRestore } from './backupDump.util.js';
import logger from '../../config/logger.js';

const { backupsDir } = backupRepository;

const ALL_TABLES = [
  'users', 'events', 'registrations', 'friends', 'achievements',
  'user_achievements', 'activity_logs', 'reports',
  'upcoming_events', 'past_event_history', 'saved_events',
];

const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

// Strict filename validation — prevents path traversal on restore/download/delete.
const FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.sql$/;
const resolveBackupPath = (filename) => {
  if (!filename || !FILENAME_PATTERN.test(filename)) {
    const err = new Error('Invalid backup filename');
    err.statusCode = 400;
    throw err;
  }
  const filepath = normalize(join(backupsDir, filename));
  if (!filepath.startsWith(normalize(backupsDir))) {
    const err = new Error('Invalid backup filename');
    err.statusCode = 400;
    throw err;
  }
  return filepath;
};

export const listTables = async () => {
  return backupRepository.listTablesWithCounts();
};

export const previewRows = async (table, ids) => {
  const known = await backupRepository.isKnownTable(table);
  if (!known) {
    const err = new Error(`Unknown table: ${table}`);
    err.statusCode = 400;
    throw err;
  }
  return backupRepository.previewRows(table, ids);
};

const writeAndRecord = async ({ filename, sql, type, scope, triggerType, createdBy }) => {
  const filepath = join(backupsDir, filename);
  await writeFile(filepath, sql, 'utf8');
  const sizeBytes = await backupRepository.getFileSize(filepath);
  await backupRepository.recordBackup({
    filename, type, scope, sizeBytes, triggerType, status: 'success', createdBy,
  });
  return { filename, type, scope, sizeBytes, trigger: triggerType };
};

export const createFullBackup = async ({ createdBy = null, triggerType = 'manual' } = {}) => {
  const filename = `full_backup_${getTimestamp()}.sql`;
  try {
    const sql = await dumpTables(ALL_TABLES, 'full');
    logger.info(`Full backup created: ${filename}`);
    return await writeAndRecord({
      filename, sql, type: 'full', scope: { tables: ALL_TABLES }, triggerType, createdBy,
    });
  } catch (err) {
    logger.error('Full backup failed:', err.message);
    await backupRepository.recordBackup({
      filename, type: 'full', scope: { tables: ALL_TABLES }, sizeBytes: null,
      triggerType, status: 'failed', errorMessage: err.message, createdBy,
    });
    const e = new Error('Failed to create full backup.');
    e.statusCode = 500;
    throw e;
  }
};

export const createTablesBackup = async (tables, { createdBy = null, triggerType = 'manual' } = {}) => {
  if (!Array.isArray(tables) || tables.length === 0) {
    const err = new Error('Select at least one table to back up');
    err.statusCode = 400;
    throw err;
  }
  for (const t of tables) {
    const known = await backupRepository.isKnownTable(t);
    if (!known) {
      const err = new Error(`Unknown table: ${t}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const filename = `tables_backup_${getTimestamp()}.sql`;
  try {
    const sql = await dumpTables(tables);
    logger.info(`Tables backup created: ${filename} (${tables.join(', ')})`);
    return await writeAndRecord({
      filename, sql, type: 'tables', scope: { tables }, triggerType, createdBy,
    });
  } catch (err) {
    logger.error('Tables backup failed:', err.message);
    await backupRepository.recordBackup({
      filename, type: 'tables', scope: { tables }, sizeBytes: null,
      triggerType, status: 'failed', errorMessage: err.message, createdBy,
    });
    const e = new Error('Failed to create tables backup.');
    e.statusCode = 500;
    throw e;
  }
};

export const createRowsBackup = async ({ table, ids }, { createdBy = null, triggerType = 'manual' } = {}) => {
  if (!table) {
    const err = new Error('A table is required');
    err.statusCode = 400;
    throw err;
  }
  const known = await backupRepository.isKnownTable(table);
  if (!known) {
    const err = new Error(`Unknown table: ${table}`);
    err.statusCode = 400;
    throw err;
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    const err = new Error('Select at least one row id to back up');
    err.statusCode = 400;
    throw err;
  }
  const cleanIds = ids.map(Number);
  if (cleanIds.some((n) => !Number.isInteger(n) || n <= 0)) {
    const err = new Error('Row ids must be positive integers');
    err.statusCode = 400;
    throw err;
  }

  const filename = `rows_backup_${table}_${getTimestamp()}.sql`;
  try {
    const { sql, matchedCount } = await dumpRows(table, cleanIds);
    if (matchedCount === 0) {
      const err = new Error('No matching rows found for the given ids');
      err.statusCode = 404;
      throw err;
    }
    logger.info(`Rows backup created: ${filename} (${matchedCount} rows)`);
    return await writeAndRecord({
      filename, sql, type: 'rows', scope: { table, ids: cleanIds, matchedCount }, triggerType, createdBy,
    });
  } catch (err) {
    logger.error('Rows backup failed:', err.message);
    await backupRepository.recordBackup({
      filename, type: 'rows', scope: { table, ids: cleanIds }, sizeBytes: null,
      triggerType, status: 'failed', errorMessage: err.message, createdBy,
    });
    throw err.statusCode ? err : Object.assign(new Error('Failed to create rows backup.'), { statusCode: 500 });
  }
};

export const restoreBackup = async (filename) => {
  const filepath = resolveBackupPath(filename);
  try {
    const sqlContent = await readFile(filepath, 'utf8');
    await executeRestore(sqlContent);
    logger.info(`Backup restored: ${filename}`);
  } catch (err) {
    logger.error('Restore failed:', err.message);
    const error = new Error('Failed to restore backup. The file may be missing or corrupted.');
    error.statusCode = 500;
    throw error;
  }
};

export const getBackups = async (query) => {
  return backupRepository.listBackupRecords(query);
};

export const getBackupFilePath = (filename) => {
  return resolveBackupPath(filename);
};

export const deleteBackup = async (filename) => {
  const filepath = resolveBackupPath(filename);
  try {
    await backupRepository.deleteFile(filepath);
  } catch {
    // file may already be gone — still clean up the record
  }
  await backupRepository.deleteBackupRecord(filename);
};
