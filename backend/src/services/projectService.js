const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

const createProject = async(tenantId, name, description, createdBy) => {
    const result = await db.query(
        `INSERT INTO projects (tenant_id, name, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, tenant_id, name, description, status, created_by, created_at, updated_at`, [tenantId, name, description || null, createdBy]
    );

    return result.rows[0];
};

const getProjectById = async(projectId, tenantId) => {
    const result = await db.query(
        'SELECT * FROM projects WHERE id = $1 AND tenant_id = $2', [projectId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Project not found');
    }

    return result.rows[0];
};

const listProjectsByTenant = async(tenantId, limit = 100, offset = 0) => {
    const result = await db.query(
        `SELECT id, tenant_id, name, description, status, created_by, created_at, updated_at
     FROM projects WHERE tenant_id = $1 AND status != 'deleted'
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`, [tenantId, limit, offset]
    );

    const countResult = await db.query(
        'SELECT COUNT(*) as count FROM projects WHERE tenant_id = $1 AND status != $2', [tenantId, 'deleted']
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        limit,
        offset,
    };
};

const updateProject = async(projectId, tenantId, updates) => {
    const allowedFields = ['name', 'description', 'status'];
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
        return getProjectById(projectId, tenantId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(projectId);
    values.push(tenantId);

    const result = await db.query(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCounter} AND tenant_id = $${paramCounter + 1} RETURNING *`,
        values
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Project not found');
    }

    return result.rows[0];
};

const deleteProject = async(projectId, tenantId) => {
    const result = await db.query(
        'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id', [projectId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Project not found');
    }

    return result.rows[0];
};

module.exports = {
    createProject,
    getProjectById,
    listProjectsByTenant,
    updateProject,
    deleteProject,
};