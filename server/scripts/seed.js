import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const demoEmail = 'demo@sweety.local';
const demoPassword = 'SweetyDemo123!';

try {
  const hash = await bcrypt.hash(demoPassword, 12);
  const userResult = await pool.query(
    `INSERT INTO users(name, email, password_hash)
     VALUES($1, $2, $3)
     ON CONFLICT(email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Sweety Demo', demoEmail, hash]
  );
  const userId = userResult.rows[0].id;
  const samples = [
    ['2026-11-08', 'morning', 102],
    ['2026-11-08', 'after_breakfast', 145],
    ['2026-11-08', 'after_lunch', 128],
    ['2026-11-07', 'morning', 98],
    ['2026-11-07', 'after_dinner', 132],
    ['2026-11-06', 'morning', 106],
    ['2026-10-15', 'morning', 110],
    ['2026-10-15', 'after_lunch', 154],
    ['2026-10-20', 'morning', 101]
  ];
  for (const [date, slot, value] of samples) {
    await pool.query(
      `INSERT INTO readings(user_id, reading_date, slot, value)
       VALUES($1, $2, $3, $4) ON CONFLICT(user_id, reading_date, slot)
       DO UPDATE SET value = EXCLUDED.value`,
      [userId, date, slot, value]
    );
  }
  console.log(`Seeded ${demoEmail} / ${demoPassword}`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
