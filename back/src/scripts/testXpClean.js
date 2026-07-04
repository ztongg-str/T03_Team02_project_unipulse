import pool from '../config/database.js';

const log = (label, u) => console.log(`  ${label}: level=${u.level}, xp=${u.xp}`);

const run = async () => {
  const userId = 74;
  const mod = await import('../modules/users/users.repository.js');

  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);
  let [u] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  log('start', u[0]);

  // Simulate what happens at grant #4: level=2, xp=100
  await pool.query('UPDATE users SET xp = 100, level = 2 WHERE id = ?', [userId]);
  [u] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  log('before grant #5 (manually set)', u[0]);

  const r = await mod.addXp(userId, 50);
  [u] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
  log('after addXp(50)', u[0]);
  console.log('  addXp result:', JSON.stringify(r));

  // Also verify: 6 grants of 50 from level=1,xp=0
  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);
  console.log('\n--- 6 x 50 XP from scratch ---');
  for (let i = 1; i <= 6; i++) {
    const r2 = await mod.addXp(userId, 50);
    [u] = await pool.query('SELECT xp, level FROM users WHERE id = ?', [userId]);
    console.log(`  #${i}: level=${u[0].level}, xp=${u[0].xp} | leveledUp=${r2.leveledUp}`);
  }

  await pool.query('UPDATE users SET xp = 0, level = 1 WHERE id = ?', [userId]);
  console.log('\n✅ Done');
  process.exit(0);
};
run();
