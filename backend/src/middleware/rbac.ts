import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/responses.js';

export const requireRoles = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role || '')) {
    return fail(res, 'Forbidden', 403);
  }
  next();
};

export const requireSameTenantOrSuper = (tenantIdPath = 'tenantId') => (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  const requestedTenantId = (req.params as any)[tenantIdPath] || (req.body as any).tenantId;
  if (user?.role === 'super_admin') return next();
  if (!requestedTenantId || user?.tenantId !== requestedTenantId) {
    return fail(res, 'Forbidden', 403);
  }
  next();
};