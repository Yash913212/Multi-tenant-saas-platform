import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { success, fail } from '../utils/responses.js';
import { logAction } from '../services/auditService.js';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const { title, description = '', assignedTo = null, priority = 'medium', dueDate = null } = req.body;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id=$1', [projectId]);
    if (!projectRes.rowCount) return fail(res, 'Project not found', 404);
    const project = projectRes.rows[0];

    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== project.tenant_id) return fail(res, 'Forbidden', 403);

    if (assignedTo) {
      const userRes = await query('SELECT 1 FROM users WHERE id=$1 AND tenant_id=$2', [assignedTo, project.tenant_id]);
      if (!userRes.rowCount) return fail(res, 'Assigned user must belong to tenant', 400);
    }

    const id = uuidv4();
    await query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'todo',$6,$7,$8,NOW(),NOW())`,
      [id, projectId, project.tenant_id, title, description, priority, assignedTo, dueDate]
    );

    await logAction({ tenantId: project.tenant_id, userId: req.user?.id, action: 'CREATE_TASK', entityType: 'task', entityId: id, ipAddress: req.ip });

    return success(res, {
      id,
      projectId,
      tenantId: project.tenant_id,
      title,
      description,
      status: 'todo',
      priority,
      assignedTo,
      dueDate,
      createdAt: new Date()
    }, undefined, 201);
  } catch (err) {
    next(err);
  }
};
export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query as Record<string, any>;
  try {
    const projectRes = await query('SELECT * FROM projects WHERE id=$1', [projectId]);
    if (!projectRes.rowCount) return fail(res, 'Project not found', 404);
    const project = projectRes.rows[0];
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== project.tenant_id) return fail(res, 'Forbidden', 403);

    const filters = ['project_id=$1'];
    const values: any[] = [projectId];
    let idx = 2;
    if (status) { filters.push(`status=$${idx}`); values.push(status); idx++; }
    if (assignedTo) { filters.push(`assigned_to=$${idx}`); values.push(assignedTo); idx++; }
    if (priority) { filters.push(`priority=$${idx}`); values.push(priority); idx++; }
    if (search) { filters.push(`LOWER(title) LIKE $${idx}`); values.push(`%${String(search).toLowerCase()}%`); idx++; }

    const lim = Math.min(100, parseInt(String(limit), 10));
    const pg = Math.max(1, parseInt(String(page), 10));
    const offset = (pg - 1) * lim;

    const tasks = await query(
      `SELECT t.*, u.full_name, u.email FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE ${filters.join(' AND ')}
       ORDER BY priority DESC, due_date ASC NULLS LAST, created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, lim, offset]
    );
    const countRes = await query(`SELECT COUNT(*)::int AS count FROM tasks WHERE ${filters.join(' AND ')}`, values);

    return success(res, {
      tasks: tasks.rows.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assigned_to ? { id: t.assigned_to, fullName: t.full_name, email: t.email } : null,
        dueDate: t.due_date,
        createdAt: t.created_at
      })),
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

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const taskRes = await query('SELECT * FROM tasks WHERE id=$1', [taskId]);
    if (!taskRes.rowCount) return fail(res, 'Task not found', 404);
    const task = taskRes.rows[0];
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== task.tenant_id) return fail(res, 'Forbidden', 403);

    await query('UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2', [status, taskId]);
    await logAction({ tenantId: task.tenant_id, userId: req.user?.id, action: 'UPDATE_TASK_STATUS', entityType: 'task', entityId: taskId, ipAddress: req.ip });

    return success(res, { id: taskId, status }, undefined);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const { title, description, status, priority, assignedTo = undefined, dueDate = undefined } = req.body;
  try {
    const taskRes = await query('SELECT * FROM tasks WHERE id=$1', [taskId]);
    if (!taskRes.rowCount) return fail(res, 'Task not found', 404);
    const task = taskRes.rows[0];

    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== task.tenant_id) return fail(res, 'Forbidden', 403);

    if (assignedTo !== undefined && assignedTo !== null) {
      const userRes = await query('SELECT 1 FROM users WHERE id=$1 AND tenant_id=$2', [assignedTo, task.tenant_id]);
      if (!userRes.rowCount) return fail(res, 'Assigned user must belong to tenant', 400);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (title) { updates.push(`title=$${idx++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description=$${idx++}`); values.push(description); }
    if (status) { updates.push(`status=$${idx++}`); values.push(status); }
    if (priority) { updates.push(`priority=$${idx++}`); values.push(priority); }
    if (assignedTo !== undefined) { updates.push(`assigned_to=$${idx++}`); values.push(assignedTo); }
    if (dueDate !== undefined) { updates.push(`due_date=$${idx++}`); values.push(dueDate); }

    if (!updates.length) return fail(res, 'Nothing to update', 400);

    values.push(taskId);
    await query(`UPDATE tasks SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, values);

    await logAction({ tenantId: task.tenant_id, userId: req.user?.id, action: 'UPDATE_TASK', entityType: 'task', entityId: taskId, ipAddress: req.ip });

    return success(res, { id: taskId, title: title || task.title, status: status || task.status, priority: priority || task.priority, assignedTo }, 'Task updated successfully');
  } catch (err) {
    next(err);
  }
};