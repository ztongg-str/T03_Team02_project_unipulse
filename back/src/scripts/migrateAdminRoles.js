// Script to migrate existing coordinator/developer users to custom admin roles
// Run: node src/scripts/migrateAdminRoles.js

import pool from '../config/database.js';

async function migrate() {
  console.log('Starting admin role migration...');

  // Ensure system roles exist
  const [existingRoles] = await pool.query('SELECT id, name FROM admin_roles WHERE is_system = TRUE');
  const roleMap = {};
  for (const r of existingRoles) {
    roleMap[r.name] = r.id;
  }

  // Map old role names to admin_roles names
  const ROLE_MAPPING = {
    coordinator: 'Coordinator',
    developer: 'Developer',
  };

  for (const [oldRole, newRoleName] of Object.entries(ROLE_MAPPING)) {
    const roleId = roleMap[newRoleName];
    if (!roleId) {
      console.log(`  Skipping "${oldRole}" → "${newRoleName}": system role not found in admin_roles table`);
      continue;
    }

    const [users] = await pool.query(
      'SELECT id, fullName FROM users WHERE role = ?',
      [oldRole]
    );

    if (users.length === 0) {
      console.log(`  No users with role "${oldRole}" found`);
      continue;
    }

    let assigned = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if already assigned
      const [existing] = await pool.query(
        'SELECT id FROM user_admin_roles WHERE userId = ? AND roleId = ?',
        [user.id, roleId]
      );

      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO user_admin_roles (userId, roleId, assignedBy) VALUES (?, ?, NULL)',
          [user.id, roleId]
        );
        console.log(`  Assigned "${newRoleName}" to ${user.fullName} (ID: ${user.id})`);
        assigned++;
      } else {
        skipped++;
      }
    }

    console.log(`  Done: ${assigned} assigned, ${skipped} already assigned for role "${oldRole}"`);
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
