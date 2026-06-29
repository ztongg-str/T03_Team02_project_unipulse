import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const backupsDir = join(__dirname, '../../../backups');

export const listBackupFiles = async () => {
  try {
    const files = await readdir(backupsDir);
    return files.filter((f) => f.endsWith('.sql'));
  } catch {
    return [];
  }
};

// All real (non-system) tables in the connected database, with row counts —
// powers the "select tables / select rows" backup UI.
export const listTablesWithCounts = async () => {
  const [tables] = await pool.query(
    `SELECT TABLE_NAME as name FROM information_schema.tables
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`
  );
  const result = [];
  for (const t of tables) {
    const [[count]] = await pool.query(`SELECT COUNT(*) as total FROM \`${t.name}\``);
    result.push({ name: t.name, rowCount: count.total });
  }
  return result;
};

export const isKnownTable = async (table) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = ?`,
    [table]
  );
  return rows.length > 0;
};

export const previewRows = async (table, ids) => {
  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT * FROM \`${table}\` WHERE id IN (${placeholders}) LIMIT 50`,
    ids
  );
  return rows;
};

export const recordBackup = async ({
  filename,
  type,
  scope,
  sizeBytes,
  triggerType,
  status,
  errorMessage = null,
  createdBy = null,
}) => {
  const [result] = await pool.query(
    `INSERT INTO backups (filename, type, scope, sizeBytes, trigger_type, status, errorMessage, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [filename, type, scope ? JSON.stringify(scope) : null, sizeBytes, triggerType, status, errorMessage, createdBy]
  );
  return result.insertId;
};

export const listBackupRecords = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT b.*, u.username as createdByUsername
     FROM backups b LEFT JOIN users u ON b.createdBy = u.id
     ORDER BY b.createdAt DESC LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM backups');
  return { backups: rows, total };
};

export const findBackupRecordByFilename = async (filename) => {
  const [rows] = await pool.query('SELECT * FROM backups WHERE filename = ?', [filename]);
  return rows[0] || null;
};

export const deleteBackupRecord = async (filename) => {
  await pool.query('DELETE FROM backups WHERE filename = ?', [filename]);
};

export const getFileSize = async (filepath) => {
  try {
    const s = await stat(filepath);
    return s.size;
  } catch {
    return null;
  }
};

export const deleteFile = async (filepath) => {
  await unlink(filepath);
};
