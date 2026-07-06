import pool from '../config/database.js';

const sql = `CREATE TABLE IF NOT EXISTS admin_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON NOT NULL DEFAULT ('{}'),
  is_system BOOLEAN DEFAULT FALSE,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_admin_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  roleId INT NOT NULL,
  assignedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES admin_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedBy) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_role (userId, roleId)
);

INSERT IGNORE INTO admin_roles (id, name, description, permissions, is_system) VALUES
(1, 'Event Manager',
 'Manages events, approvals, and registrations',
 '{"events":["view","create","update","delete","approve"],"registrations":["view","export"],"reports":["view"]}',
 TRUE),
(2, 'User Manager',
 'Manages user accounts and roles',
 '{"users":["view","create","update","delete","manage"],"reports":["view","export"]}',
 TRUE),
(3, 'Moderator',
 'Reviews content and handles reports',
 '{"events":["view","approve"],"users":["view"],"reports":["view","update","manage"],"feedback":["view","update","delete"]}',
 TRUE),
(4, 'Coordinator',
 'Manages users, events, and event verification',
 '{"users":["view","create","update","delete"],"events":["view","create","update","delete","approve"],"registrations":["view","export"],"reports":["view"]}',
 TRUE),
(5, 'Developer',
 'System health, backup, restore, and query console',
 '{"reports":["view","export"]}',
 TRUE);`;

async function apply() {
  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      console.log('OK:', stmt.slice(0, 60));
    } catch (e) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.errno === 1061 || e.code === 'ER_DUP_ENTRY') {
        console.log('SKIP (exists):', stmt.slice(0, 60));
      } else {
        console.error('ERR:', e.message);
      }
    }
  }

  const [rows] = await pool.query('SELECT id, name FROM admin_roles');
  console.log('admin_roles:', JSON.stringify(rows));
  process.exit(0);
}

apply().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
