import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
try {
  const sql = await fs.readFile(path.join(here, '../src/db/migrations/001_init.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database migration completed.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
