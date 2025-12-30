import dotenv from 'dotenv';
import { runMigrations } from './migrate.js';
import { runSeeds } from './seed.js';

dotenv.config();

const start = async () => {
  await runMigrations();
  await runSeeds();
  await import('../src/server.js');
};

start().catch((err) => {
  console.error('Initialization failed', err);
  process.exit(1);
});
