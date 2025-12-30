import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query, getClient } from '../config/db.js';
import { getPlanDefaults } from '../utils/plans.js';
import { success, fail } from '../utils/responses.js';
import { logAction } from '../services/auditService.js';

dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || 'changeme') as jwt.Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];

const signToken = (userId: string, tenantId: string | null, role: string) =>
  jwt.sign({ userId, tenantId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const registerTenant = async (req: Request, res: Response, next: NextFunction) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const plan = 'free';
    const limits = getPlanDefaults(plan);

    const subdomainExists = await client.query('SELECT 1 FROM tenants WHERE subdomain=$1', [subdomain]);
    if (subdomainExists.rowCount) {
      await client.query('ROLLBACK');
      return fail(res, 'Subdomain already exists', 409);
    }

    const tenantId = uuidv4();
    await client.query(
      `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
       VALUES ($1,$2,$3,'active',$4,$5,$6,NOW(),NOW())`,
      [tenantId, tenantName, subdomain, plan, limits.max_users, limits.max_projects]
    );

    const existingEmail = await client.query('SELECT 1 FROM users WHERE tenant_id=$1 AND email=$2', [tenantId, adminEmail]);
    if (existingEmail.rowCount) {
      await client.query('ROLLBACK');
      return fail(res, 'Admin email already exists', 409);
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();
    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'tenant_admin',true,NOW(),NOW())`,
      [adminId, tenantId, adminEmail, hashed, adminFullName]
    );

    await client.query('COMMIT');

    await logAction({ tenantId, userId: adminId, action: 'REGISTER_TENANT', entityType: 'tenant', entityId: tenantId, ipAddress: req.ip });

    return success(res, {
      tenantId,
      subdomain,
      adminUser: {
        id: adminId,
        email: adminEmail,
        fullName: adminFullName,
        role: 'tenant_admin'
      }
    }, 'Tenant registered successfully', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, tenantSubdomain, tenantId } = req.body;
  try {
    let tenant: any = null;
    if (tenantSubdomain || tenantId) {
      const lookup = await query('SELECT * FROM tenants WHERE subdomain=$1 OR id=$2', [tenantSubdomain || null, tenantId || null]);
      if (!lookup.rowCount) return fail(res, 'Tenant not found', 404);
      tenant = lookup.rows[0];
      if (tenant.status !== 'active') return fail(res, 'Tenant is not active', 403);
    }

    const userRes = await query('SELECT * FROM users WHERE email=$1', [email]);
    if (!userRes.rowCount) return fail(res, 'Invalid credentials', 401);

    let user: any = null;
    if (userRes.rowCount === 1) {
      user = userRes.rows[0];
    } else {
      user = userRes.rows.find((u: any) => tenant && u.tenant_id === tenant.id) || userRes.rows.find((u: any) => u.role === 'super_admin');
    }

    if (!user) return fail(res, 'Invalid credentials', 401);

    if (user.role !== 'super_admin') {
      if (!tenant) return fail(res, 'Tenant required', 400);
      if (user.tenant_id !== tenant.id) return fail(res, 'Invalid credentials', 401);
      if (user.is_active === false) return fail(res, 'Account inactive', 403);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return fail(res, 'Invalid credentials', 401);

    const token = signToken(user.id, user.tenant_id, user.role);
    await logAction({ tenantId: user.tenant_id, userId: user.id, action: 'LOGIN', entityType: 'user', entityId: user.id, ipAddress: req.ip });

    return success(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id
      },
      token,
      expiresIn: 60 * 60 * 24
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRes = await query('SELECT id, email, full_name, role, is_active, tenant_id FROM users WHERE id=$1', [req.user?.id]);
    if (!userRes.rowCount) return fail(res, 'User not found', 404);
    const user = userRes.rows[0];

    let tenant: any = null;
    if (user.tenant_id) {
      const tenantRes = await query('SELECT id, name, subdomain, subscription_plan, max_users, max_projects FROM tenants WHERE id=$1', [user.tenant_id]);
      tenant = tenantRes.rows[0] || null;
    }

    return success(res, {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      tenant
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await logAction({ tenantId: req.user?.tenantId || null, userId: req.user?.id, action: 'LOGOUT', entityType: 'user', entityId: req.user?.id, ipAddress: req.ip });
    return success(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};