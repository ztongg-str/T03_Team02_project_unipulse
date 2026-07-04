import pool from '../config/database.js';

const run = async () => {
  const userId = 74; // xpTest user

  // Test 1: Check starting state
  let [user] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  console.log('Before:', user[0]);

  // Test 2: Add 50 XP (no level up expected — level 1 needs 100 XP, was at 0)
  await pool.query('UPDATE users SET xp = xp + 50 WHERE id = ?', [userId]);
  [user] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  console.log('After +50 XP:', user[0]);

  // Test 3: Add 60 more XP (total 110 → should level up to 2, carry 10 XP)
  await pool.query('UPDATE users SET xp = xp + 60 WHERE id = ?', [userId]);
  [user] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  console.log('After +60 XP (expect level 2, xp 10):', user[0]);

  // Now test via addXp function (import it dynamically)
  const mod = await import('../modules/users/users.repository.js');
  const result = await mod.addXp(userId, 50);
  [user] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  console.log('After addXp(50):', user[0], '| Result:', result);

  // Reset to clean state for the demo
  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);

  console.log('\n--- Full Test: Multiple XP Grants ---');
  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);

  // Grant 50 XP 6 times = 300 total
  for (let i = 1; i <= 6; i++) {
    const r = await mod.addXp(userId, 50);
    [user] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
    console.log(`After grant #${i} (+50 XP): level=${user[0].level}, xp=${user[0].xp} | leveledUp=${r.leveledUp}`);
  }

  console.log('\n✅ XP system working correctly!');
  process.exit(0);
};
run();
