import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { fail } from '../utils/responses.js';

export const enforceUserLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.params?.tenantId || req.body?.tenantId || req.user?.tenantId;

    if (!tenantId) return fail(res, 'Tenant not specified', 400);

    const tenantRes = await query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
    if (tenantRes.rowCount === 0) return fail(res, 'Tenant not found', 404);

    const current = await query('SELECT COUNT(*)::int AS count FROM users WHERE tenant_id = $1', [tenantId]);
    if (current.rows[0].count >= tenantRes.rows[0].max_users) {
      return fail(res, 'Subscription user limit reached', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const enforceProjectLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId || req.params?.tenantId || req.body?.tenantId;

    if (!tenantId) return fail(res, 'Tenant not specified', 400);

    const tenantRes = await query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
    if (tenantRes.rowCount === 0) return fail(res, 'Tenant not found', 404);

    const current = await query('SELECT COUNT(*)::int AS count FROM projects WHERE tenant_id = $1', [tenantId]);
    if (current.rows[0].count >= tenantRes.rows[0].max_projects) {
      return fail(res, 'Subscription project limit reached', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};