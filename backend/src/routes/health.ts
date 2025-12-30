import { Router, Request, Response } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: (err as Error).message });
  }
});

export default router;
