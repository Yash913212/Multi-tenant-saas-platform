import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import { pool } from '../src/config/db.js';

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const seedFile = path.join(__dirname, '..', 'seeds', 'seed_data.sql');

export const runSeeds = async () => {
  const sql = fs.readFileSync(seedFile, 'utf-8');
  await pool.query(sql);
  console.log('Seeds applied');
};

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  runSeeds()
    .catch((err) => {
      console.error('Seeding failed', err);
      process.exit(1);
    })
    .finally(() => pool.end());
}
