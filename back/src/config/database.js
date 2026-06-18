import mysql from 'mysql2/promise';
import env from './env.js';
import logger from './logger.js';

const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(() => logger.info('Connected to MySQL database'))
  .catch((err) => logger.error('Database connection failed:', err.message));

export default pool;
