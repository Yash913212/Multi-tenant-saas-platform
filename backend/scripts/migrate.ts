import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    run_on TIMESTAMP NOT NULL DEFAULT NOW()
  );`);
};

const getApplied = async () => {
  const res = await pool.query('SELECT name FROM migrations');
  return res.rows.map((r) => r.name as string);
};

const applyMigration = async (name: string, sql: string) => {
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    await pool.query('COMMIT');
    console.log(`Applied migration ${name}`);
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
};

export const runMigrations = async () => {
  await ensureTable();
  const applied = await getApplied();
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.includes(file)) continue;
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const upSql = content.split('-- Down')[0].replace('-- Up', '').trim();
    if (!upSql) continue;
    await applyMigration(file, upSql);
  }
  console.log('Migrations complete');
};

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  runMigrations()
    .catch((err) => {
      console.error('Migration failed', err);
      process.exit(1);
    })
    .finally(() => pool.end());
}
