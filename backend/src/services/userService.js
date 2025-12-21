const db = require('../config/database');
const authService = require('./authService');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

const createUser = async(tenantId, email, password, fullName, role = 'user') => {
    // Check if user already exists in this tenant
    const existing = await db.query(
        'SELECT id FROM users WHERE tenant_id = $1 AND email = $2', [tenantId, email]
    );

    if (existing.rows.length > 0) {
        throw new ConflictError('Email already exists in this tenant');
    }

    const passwordHash = await authService.hashPassword(password);

    const result = await db.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tenant_id, email, full_name, role, is_active, created_at, updated_at`, [tenantId, email, passwordHash, fullName, role]
    );

    return result.rows[0];
};

const getUserById = async(userId, tenantId) => {
    const result = await db.query(
        'SELECT id, tenant_id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1 AND tenant_id = $2', [userId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return result.rows[0];
};

const listUsersByTenant = async(tenantId, limit = 100, offset = 0) => {
    const result = await db.query(
        `SELECT id, tenant_id, email, full_name, role, is_active, created_at, updated_at
     FROM users WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`, [tenantId, limit, offset]
    );

    const countResult = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1', [tenantId]
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        limit,
        offset,
    };
};

const updateUser = async(userId, tenantId, updates) => {
    const allowedFields = ['full_name', 'role', 'is_active'];
    const fields = [];
    const values = [];
    let paramCounter = 1;

    allowedFields.forEach((field) => {
        if (field in updates) {
            fields.push(`${field} = $${paramCounter}`);
            values.push(updates[field]);
            paramCounter++;
        }
    });

    if (fields.length === 0) {
        return getUserById(userId, tenantId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);
    values.push(tenantId);

    const result = await db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} AND tenant_id = $${paramCounter + 1} RETURNING id, tenant_id, email, full_name, role, is_active, created_at, updated_at`,
        values
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return result.rows[0];
};

const deleteUser = async(userId, tenantId) => {
    const result = await db.query(
        'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id', [userId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return result.rows[0];
};

module.exports = {
    createUser,
    getUserById,
    listUsersByTenant,
    updateUser,
    deleteUser,
};