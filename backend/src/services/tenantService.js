const db = require('../config/database');
const { NotFoundError, ConflictError, LimitExceededError } = require('../utils/errors');

const createTenant = async(name, subdomain, subscriptionPlan = 'free', maxUsers = 5, maxProjects = 5) => {
    const result = await db.query(
        `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at`, [name, subdomain, 'active', subscriptionPlan, maxUsers, maxProjects]
    );

    return result.rows[0];
};

const getTenantById = async(tenantId) => {
    const result = await db.query(
        'SELECT * FROM tenants WHERE id = $1', [tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Tenant not found');
    }

    return result.rows[0];
};

const updateTenant = async(tenantId, updates) => {
    const allowedFields = ['name', 'status', 'subscription_plan', 'max_users', 'max_projects'];
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
        return getTenantById(tenantId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(tenantId);

    const result = await db.query(
        `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
        values
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Tenant not found');
    }

    return result.rows[0];
};

const getTenantBySubdomain = async(subdomain) => {
    const result = await db.query(
        'SELECT * FROM tenants WHERE subdomain = $1', [subdomain]
    );

    return result.rows[0] || null;
};

const checkTenantUserLimit = async(tenantId) => {
    const tenantResult = await db.query(
        'SELECT max_users FROM tenants WHERE id = $1', [tenantId]
    );

    if (tenantResult.rows.length === 0) {
        throw new NotFoundError('Tenant not found');
    }

    const { max_users } = tenantResult.rows[0];

    const usersResult = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1', [tenantId]
    );

    const currentUsers = parseInt(usersResult.rows[0].count, 10);

    if (currentUsers >= max_users) {
        throw new LimitExceededError(`Maximum users limit (${max_users}) reached for this tenant`);
    }
};

const checkTenantProjectLimit = async(tenantId) => {
    const tenantResult = await db.query(
        'SELECT max_projects FROM tenants WHERE id = $1', [tenantId]
    );

    if (tenantResult.rows.length === 0) {
        throw new NotFoundError('Tenant not found');
    }

    const { max_projects } = tenantResult.rows[0];

    const projectsResult = await db.query(
        'SELECT COUNT(*) as count FROM projects WHERE tenant_id = $1', [tenantId]
    );

    const currentProjects = parseInt(projectsResult.rows[0].count, 10);

    if (currentProjects >= max_projects) {
        throw new LimitExceededError(`Maximum projects limit (${max_projects}) reached for this tenant`);
    }
};

module.exports = {
    createTenant,
    getTenantById,
    updateTenant,
    getTenantBySubdomain,
    checkTenantUserLimit,
    checkTenantProjectLimit,
};