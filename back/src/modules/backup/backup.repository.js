import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupsDir = join(__dirname, '../../../backups');

export const listBackupFiles = async () => {
  try {
    const files = await readdir(backupsDir);
    return files.filter((f) => f.endsWith('.sql'));
  } catch {
    return [];
  }
};
