import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { success, fail } from '../utils/responses.js';
import { logAction } from '../services/auditService.js';
import { enforceUserLimit } from '../middleware/subscription.js';

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.params.tenantId;
  const { email, password, fullName, role = 'user' } = req.body;
  try {
    if (req.user?.role !== 'tenant_admin' && req.user?.role !== 'super_admin') {
      return fail(res, 'Forbidden', 403);
    }
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) {
      return fail(res, 'Forbidden', 403);
    }

    await enforceUserLimit(req, res, async () => {});
    if (res.headersSent) return;

    const exists = await query('SELECT 1 FROM users WHERE tenant_id=$1 AND email=$2', [tenantId, email]);
    if (exists.rowCount) return fail(res, 'Email already exists in this tenant', 409);

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,NOW(),NOW())`,
      [id, tenantId, email, hashed, fullName, role]
    );

    await logAction({ tenantId, userId: req.user?.id, action: 'CREATE_USER', entityType: 'user', entityId: id, ipAddress: req.ip });

    return success(res, {
      id,
      email,
      fullName,
      role,
      tenantId,
      isActive: true,
      createdAt: new Date()
    }, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { tenantId } = req.params;
  const { search, role, page = 1, limit = 50 } = req.query as Record<string, any>;
  try {
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== tenantId) return fail(res, 'Forbidden', 403);
    const where = ['tenant_id=$1'];
    const values: any[] = [tenantId];
    let idx = 2;
    if (search) { where.push(`(LOWER(full_name) LIKE $${idx} OR LOWER(email) LIKE $${idx})`); values.push(`%${String(search).toLowerCase()}%`); idx++; }
    if (role) { where.push(`role=$${idx}`); values.push(role); idx++; }

    const lim = Math.min(100, parseInt(String(limit), 10));
    const pg = Math.max(1, parseInt(String(page), 10));
    const offset = (pg - 1) * lim;

    const users = await query(
      `SELECT id, email, full_name, role, is_active, created_at FROM users WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, lim, offset]
    );
    const countRes = await query(`SELECT COUNT(*)::int AS count FROM users WHERE ${where.join(' AND ')}`, values);

    return success(res, {
      users: users.rows.map((u: any) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at
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

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;
  try {
    const userRes = await query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!userRes.rowCount) return fail(res, 'User not found', 404);
    const target = userRes.rows[0];

    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== target.tenant_id) return fail(res, 'Forbidden', 403);
    const isSelf = req.user?.id === userId;

    if (isSelf) {
      if (!fullName) return fail(res, 'Nothing to update', 400);
    }

    if (!isSelf && req.user?.role === 'user') return fail(res, 'Forbidden', 403);

    if ((role || typeof isActive === 'boolean') && req.user?.role === 'user') return fail(res, 'Forbidden', 403);
    if ((role || typeof isActive === 'boolean') && req.user?.role === 'tenant_admin' && target.tenant_id !== req.user.tenantId) return fail(res, 'Forbidden', 403);

    if ((role || typeof isActive === 'boolean') && req.user?.role === 'tenant_admin' && isSelf) return fail(res, 'Forbidden', 403);

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (fullName) { updates.push(`full_name=$${idx++}`); values.push(fullName); }
    if (role && req.user?.role !== 'user') { updates.push(`role=$${idx++}`); values.push(role); }
    if (typeof isActive === 'boolean' && req.user?.role !== 'user') { updates.push(`is_active=$${idx++}`); values.push(isActive); }

    if (!updates.length) return fail(res, 'Nothing to update', 400);

    values.push(userId);
    await query(`UPDATE users SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, values);

    await logAction({ tenantId: target.tenant_id, userId: req.user?.id, action: 'UPDATE_USER', entityType: 'user', entityId: userId, ipAddress: req.ip });

    return success(res, { id: userId, fullName: fullName || target.full_name, role: role || target.role }, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const userRes = await query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!userRes.rowCount) return fail(res, 'User not found', 404);
    const target = userRes.rows[0];

    if (req.user?.role !== 'tenant_admin' && req.user?.role !== 'super_admin') return fail(res, 'Forbidden', 403);
    if (req.user?.role !== 'super_admin' && req.user?.tenantId !== target.tenant_id) return fail(res, 'Forbidden', 403);
    if (req.user?.id === userId) return fail(res, 'Cannot delete yourself', 403);

    await query('UPDATE tasks SET assigned_to=NULL WHERE assigned_to=$1', [userId]);
    await query('DELETE FROM users WHERE id=$1', [userId]);

    await logAction({ tenantId: target.tenant_id, userId: req.user?.id, action: 'DELETE_USER', entityType: 'user', entityId: userId, ipAddress: req.ip });

    return success(res, {}, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};