import mysql from 'mysql2/promise';
import env from './env.js';
import logger from './logger.js';

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  //Need to enable this first to access to the database
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
});

pool.getConnection()
  .then(() => logger.info('Connected to Aiven MySQL database'))
  .catch((err) => logger.error('Database connection failed:', err.message));

export default pool;
