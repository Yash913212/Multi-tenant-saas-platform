import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { success, fail } from '../utils/responses.js';
import { logAction } from '../services/auditService.js';

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  try {
    const projRes = await query('SELECT p.*, u.full_name AS creator_name FROM projects p LEFT JOIN users u ON u.id = p.created_by WHERE p.id=$1', [projectId]);
    if (!projRes.rowCount) return fail(res, 'Project not found', 404);
    const project = projRes.rows[0];
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== project.tenant_id) return fail(res, 'Forbidden', 403);

    return success(res, {
      id: project.id,
      tenantId: project.tenant_id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdBy: { id: project.created_by, fullName: project.creator_name },
      createdAt: project.created_at
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description = '', status = 'active' } = req.body;
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return fail(res, 'Tenant context missing', 400);

    const id = uuidv4();
    await query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [id, tenantId, name, description, status, req.user?.id]
    );

    await logAction({ tenantId, userId: req.user?.id, action: 'CREATE_PROJECT', entityType: 'project', entityId: id, ipAddress: req.ip });

    return success(res, {
      id,
      tenantId,
      name,
      description,
      status,
      createdBy: req.user?.id,
      createdAt: new Date()
    }, undefined, 201);
  } catch (err) {
    next(err);
  }
};

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  const { status, search, page = 1, limit = 20 } = req.query as Record<string, any>;
  try {
    const tenantId = req.user?.role === 'super_admin' && req.query.tenantId ? req.query.tenantId : req.user?.tenantId;
    if (!tenantId && req.user?.role !== 'super_admin') return fail(res, 'Tenant context missing', 400);

    const filters = ['tenant_id=$1'];
    const values: any[] = [tenantId];
    let idx = 2;
    if (status) {
      filters.push(`status=$${idx}`);
      values.push(status);
      idx++;
    }
    if (search) {
      filters.push(`LOWER(name) LIKE $${idx}`);
      values.push(`%${String(search).toLowerCase()}%`);
      idx++;
    }

    const lim = Math.min(100, parseInt(String(limit), 10));
    const pg = Math.max(1, parseInt(String(page), 10));
    const offset = (pg - 1) * lim;

    const projects = await query(
      `SELECT p.*, u.full_name AS creator_name FROM projects p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE ${filters.join(' AND ')}
       ORDER BY p.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, lim, offset]
    );
    const countRes = await query(`SELECT COUNT(*)::int AS count FROM projects WHERE ${filters.join(' AND ')}`, values);

    const enriched = await Promise.all(
      projects.rows.map(async (p: any) => {
        const tasks = await query('SELECT COUNT(*)::int AS count, SUM(CASE WHEN status=\'completed\' THEN 1 ELSE 0 END)::int AS completed FROM tasks WHERE project_id=$1', [p.id]);
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: { id: p.created_by, fullName: p.creator_name },
          taskCount: tasks.rows[0].count || 0,
          completedTaskCount: tasks.rows[0].completed || 0,
          createdAt: p.created_at
        };
      })
    );

    return success(res, {
      projects: enriched,
      total: countRes.rows[0].count,
      pagination: {
        currentPage: pg,
        totalPages: Math.ceil(countRes.rows[0].count / lim),
        limit: lim
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;
  try {
    const projRes = await query('SELECT * FROM projects WHERE id=$1', [projectId]);
    if (!projRes.rowCount) return fail(res, 'Project not found', 404);
    const project = projRes.rows[0];

    if (req.user?.role !== 'super_admin') {
      if (req.user?.tenantId !== project.tenant_id) return fail(res, 'Forbidden', 403);
      if (req.user?.role !== 'tenant_admin' && req.user?.id !== project.created_by) return fail(res, 'Forbidden', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (name) { updates.push(`name=$${idx++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description=$${idx++}`); values.push(description); }
    if (status) { updates.push(`status=$${idx++}`); values.push(status); }

    if (!updates.length) return fail(res, 'Nothing to update', 400);

    values.push(projectId);
    await query(`UPDATE projects SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, values);

    await logAction({ tenantId: project.tenant_id, userId: req.user?.id, action: 'UPDATE_PROJECT', entityType: 'project', entityId: projectId, ipAddress: req.ip });

    return success(res, { id: projectId, name: name || project.name, description: description ?? project.description, status: status || project.status }, 'Project updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  try {
    const projRes = await query('SELECT * FROM projects WHERE id=$1', [projectId]);
    if (!projRes.rowCount) return fail(res, 'Project not found', 404);
    const project = projRes.rows[0];

    if (req.user?.role !== 'super_admin') {
      if (req.user?.tenantId !== project.tenant_id) return fail(res, 'Forbidden', 403);
      if (req.user?.role !== 'tenant_admin' && req.user?.id !== project.created_by) return fail(res, 'Forbidden', 403);
    }

    await query('DELETE FROM tasks WHERE project_id=$1', [projectId]);
    await query('DELETE FROM projects WHERE id=$1', [projectId]);

    await logAction({ tenantId: project.tenant_id, userId: req.user?.id, action: 'DELETE_PROJECT', entityType: 'project', entityId: projectId, ipAddress: req.ip });

    return success(res, {}, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};