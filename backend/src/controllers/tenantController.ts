import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { success, fail } from '../utils/responses.js';
import { logAction } from '../services/auditService.js';

export const getTenantDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = req.params;
  try {
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return fail(res, 'Forbidden', 403);
    }
    const tenantRes = await query('SELECT * FROM tenants WHERE id=$1', [tenantId]);
    if (!tenantRes.rowCount) return fail(res, 'Tenant not found', 404);
    const tenant = tenantRes.rows[0];

    const usersCount = await query('SELECT COUNT(*)::int AS count FROM users WHERE tenant_id=$1', [tenantId]);
    const projectsCount = await query('SELECT COUNT(*)::int AS count FROM projects WHERE tenant_id=$1', [tenantId]);
    const tasksCount = await query('SELECT COUNT(*)::int AS count FROM tasks WHERE tenant_id=$1', [tenantId]);

    return success(res, {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status,
      subscriptionPlan: tenant.subscription_plan,
      maxUsers: tenant.max_users,
      maxProjects: tenant.max_projects,
      createdAt: tenant.created_at,
      stats: {
        totalUsers: usersCount.rows[0].count,
        totalProjects: projectsCount.rows[0].count,
        totalTasks: tasksCount.rows[0].count
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = req.params;
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
  try {
    const tenantRes = await query('SELECT * FROM tenants WHERE id=$1', [tenantId]);
    if (!tenantRes.rowCount) return fail(res, 'Tenant not found', 404);

    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return fail(res, 'Forbidden', 403);
    }

    if (req.user?.role !== 'super_admin' && (status || subscriptionPlan || maxUsers || maxProjects)) {
      return fail(res, 'Forbidden', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name) { updates.push(`name=$${idx++}`); values.push(name); }
    if (status) { updates.push(`status=$${idx++}`); values.push(status); }
    if (subscriptionPlan) { updates.push(`subscription_plan=$${idx++}`); values.push(subscriptionPlan); }
    if (maxUsers) { updates.push(`max_users=$${idx++}`); values.push(maxUsers); }
    if (maxProjects) { updates.push(`max_projects=$${idx++}`); values.push(maxProjects); }

    if (!updates.length) return success(res, { id: tenantId }, 'Tenant updated successfully');

    values.push(tenantId);
    await query(`UPDATE tenants SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, values);

    await logAction({ tenantId, userId: req.user?.id, action: 'UPDATE_TENANT', entityType: 'tenant', entityId: tenantId, ipAddress: req.ip });

    return success(res, { id: tenantId, name: name || tenantRes.rows[0].name }, 'Tenant updated successfully');
  } catch (err) {
    next(err);
  }
};

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'super_admin') return fail(res, 'Forbidden', 403);
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '10', 10));
    const offset = (page - 1) * limit;
    const { status, subscriptionPlan } = req.query as Record<string, string>;

    const filters: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (status) { filters.push(`status=$${idx++}`); values.push(status); }
    if (subscriptionPlan) { filters.push(`subscription_plan=$${idx++}`); values.push(subscriptionPlan); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const tenants = await query(
      `SELECT * FROM tenants ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );
    const countRes = await query(`SELECT COUNT(*)::int AS count FROM tenants ${where}`, values);

    const withCounts = await Promise.all(
      tenants.rows.map(async (t: any) => {
        const usersCount = await query('SELECT COUNT(*)::int AS count FROM users WHERE tenant_id=$1', [t.id]);
        const projectsCount = await query('SELECT COUNT(*)::int AS count FROM projects WHERE tenant_id=$1', [t.id]);
        return {
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: usersCount.rows[0].count,
          totalProjects: projectsCount.rows[0].count,
          createdAt: t.created_at
        };
      })
    );

    return success(res, {
      tenants: withCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countRes.rows[0].count / limit),
        totalTenants: countRes.rows[0].count,
        limit
      }
    });
  } catch (err) {
    next(err);
  }
};