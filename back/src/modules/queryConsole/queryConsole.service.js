import pool from '../../config/database.js';
import logger from '../../config/logger.js';

// Tables that cannot be dropped or truncated as a safety guard
const PROTECTED_TABLES = ['users', 'backups', 'query_logs'];

// Very basic dangerous pattern check — just prevents accidental DROP DATABASE
const BLOCKED_PATTERNS = [
  /DROP\s+DATABASE/i,
  /DROP\s+SCHEMA/i,
];

export const execute = async (queryText, adminId) => {
  // Block truly destructive patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(queryText)) {
      const err = new Error('This query type is blocked for safety. Contact the system owner.');
      err.statusCode = 403;
      throw err;
    }
  }

  // Warn if trying to DROP a protected table
  const dropProtected = PROTECTED_TABLES.some(
    (t) => new RegExp(`DROP\\s+TABLE.*\\b${t}\\b`, 'i').test(queryText)
  );
  if (dropProtected) {
    const err = new Error(`Cannot DROP a protected table (${PROTECTED_TABLES.join(', ')}).`);
    err.statusCode = 403;
    throw err;
  }

  let rows, fields, affected, status, errorMsg;
  try {
    const [result, fieldsMeta] = await pool.query(queryText);
    // SELECT / SHOW returns an array of row objects
    if (Array.isArray(result)) {
      rows = result;
      fields = fieldsMeta ? fieldsMeta.map((f) => f.name) : [];
      affected = result.length;
    } else {
      // INSERT / UPDATE / DELETE / CREATE / ALTER
      rows = [];
      fields = [];
      affected = result.affectedRows ?? result.changedRows ?? 0;
    }
    status = 'success';
  } catch (err) {
    status = 'error';
    errorMsg = err.message;
    // Log the failed query
    await logQuery(adminId, queryText, null, 'error', errorMsg).catch(() => {});
    const wrapped = new Error(err.message);
    wrapped.statusCode = 400;
    throw wrapped;
  }

  // Log the successful query
  await logQuery(adminId, queryText, affected, 'success', null).catch(() => {});

  return { rows, fields, affected, status };
};

async function logQuery(adminId, queryText, affected, status, errorMsg) {
  try {
    await pool.query(
      `INSERT INTO query_logs (adminId, query_text, affected, status, errorMsg) VALUES (?, ?, ?, ?, ?)`,
      [adminId, queryText, affected, status, errorMsg]
    );
  } catch (e) {
    // Table may not exist yet (pre-migration) — just warn
    logger.warn('Could not log query:', e.message);
  }
}

export const getLogs = async ({ page = 1, limit = 50 } = {}) => {
  const offset = (Number(page) - 1) * Number(limit);
  try {
    const [rows] = await pool.query(
      `SELECT ql.*, u.username, u.fullName
       FROM query_logs ql
       JOIN users u ON ql.adminId = u.id
       ORDER BY ql.executedAt DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );
    return rows;
  } catch {
    return [];
  }
};
