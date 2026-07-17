import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const env = {
  port: parseInt(process.env.PORT, 10) || 4000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'unipulse',
    ssl: process.env.DB_SSL !== 'false',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'unipulse_jwt_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  cryptoKey: process.env.CRYPTO_KEY || 'unipulse_default_crypto_key_32bytes!',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;
