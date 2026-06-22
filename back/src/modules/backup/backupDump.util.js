// Pure Node.js SQL dump generation + restore.
// Deliberately avoids shelling out to the `mysqldump` / `mysql` CLI binaries
// so backups work the same on any machine that can already run this backend
// (no extra tools to install, nothing path-dependent on Windows vs. Linux).

import mysql from 'mysql2/promise';
import pool from '../../config/database.js';
import env from '../../config/env.js';

const ROWS_PER_INSERT = 500;

const header = (lines) =>
  lines.map((l) => `-- ${l}`).join('\n') + '\n\n';

const formatInsertStatements = (table, rows, { replace = false } = {}) => {
  if (rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const columnList = columns.map((c) => mysql.escapeId(c)).join(', ');
  const verb = replace ? 'REPLACE INTO' : 'INSERT INTO';

  const statements = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_INSERT) {
    const chunk = rows.slice(i, i + ROWS_PER_INSERT);
    const valuesSql = chunk
      .map((row) => `(${columns.map((c) => mysql.escape(row[c])).join(', ')})`)
      .join(',\n  ');
    statements.push(`${verb} ${mysql.escapeId(table)} (${columnList}) VALUES\n  ${valuesSql};`);
  }
  return statements.join('\n') + '\n\n';
};

/**
 * Dump full structure + data for a list of tables.
 */
export const dumpTables = async (tables, label = 'tables') => {
  let sql = header([
    'UniPulse Database Backup',
    `Type: ${label}${label === 'tables' ? ` (${tables.join(', ')})` : ''}`,
    `Generated: ${new Date().toISOString()}`,
  ]);
  sql += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

  for (const table of tables) {
    const id = mysql.escapeId(table);
    const [[createRow]] = await pool.query(`SHOW CREATE TABLE ${id}`);
    const createSql = createRow['Create Table'];

    sql += `-- Table structure for ${table}\n`;
    sql += `DROP TABLE IF EXISTS ${id};\n`;
    sql += `${createSql};\n\n`;

    const [rows] = await pool.query(`SELECT * FROM ${id}`);
    sql += `-- Data for ${table} (${rows.length} rows)\n`;
    sql += rows.length ? formatInsertStatements(table, rows) : '-- (no rows)\n\n';
  }

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';
  return sql;
};

/**
 * Dump only specific rows (by integer id) from a single table. Data-only —
 * uses REPLACE INTO so it can be restored safely without clobbering the
 * rest of the table or erroring on duplicate keys.
 */
export const dumpRows = async (table, ids) => {
  const id = mysql.escapeId(table);
  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.query(`SELECT * FROM ${id} WHERE id IN (${placeholders})`, ids);

  let sql = header([
    'UniPulse Database Backup',
    `Type: rows (${table}, ids: ${ids.join(', ')})`,
    `Generated: ${new Date().toISOString()}`,
    `Matched: ${rows.length} of ${ids.length} requested row(s)`,
  ]);
  sql += rows.length ? formatInsertStatements(table, rows, { replace: true }) : '-- (no matching rows found)\n';
  return { sql, matchedCount: rows.length };
};

/**
 * Execute a previously generated dump file against the database.
 * Uses a dedicated connection with multipleStatements enabled so the whole
 * file can run as one batch (kept separate from the main app pool, which
 * intentionally does not allow multiple statements per query).
 */
export const executeRestore = async (sqlContent) => {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    multipleStatements: true,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await connection.query(sqlContent);
  } finally {
    await connection.end();
  }
};
