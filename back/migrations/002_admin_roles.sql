-- Step 1: expand ENUM to include both old and new roles
ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'organizer', 'admin', 'superadmin', 'developer', 'coordinator')
  NOT NULL DEFAULT 'student';

-- Step 2: migrate old 'admin' rows to 'superadmin'
UPDATE users SET role = 'superadmin' WHERE role = 'admin';

-- Step 3: now safe to drop 'admin' from ENUM
ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'organizer', 'superadmin', 'developer', 'coordinator')
  NOT NULL DEFAULT 'student';

-- Step 4: query audit log
CREATE TABLE IF NOT EXISTS query_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  adminId     INT NOT NULL,
  query_text  TEXT NOT NULL,
  affected    INT DEFAULT NULL,
  status      ENUM('success', 'error') NOT NULL DEFAULT 'success',
  errorMsg    TEXT DEFAULT NULL,
  executedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
);