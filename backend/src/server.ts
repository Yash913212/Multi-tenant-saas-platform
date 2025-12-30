import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

(async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => console.log(`Backend listening on port ${port}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();