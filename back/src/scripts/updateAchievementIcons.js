import pool from '../config/database.js';

const ICONS = {
  1: '👣', 2: '🏛️', 3: '🦋', 4: '🤝', 5: '🧭',
  6: '⭐', 7: '🎖️', 8: '🌟', 9: '🔥', 10: '🏅',
};

const run = async () => {
  try {
    for (const [id, icon] of Object.entries(ICONS)) {
      await pool.query('UPDATE achievements SET icon = ? WHERE id = ?', [icon, id]);
    }
    console.log('Updated achievement icons to emoji');
  } catch (err) {
    console.error('Failed:', err.message);
  }
  process.exit(0);
};

run();
