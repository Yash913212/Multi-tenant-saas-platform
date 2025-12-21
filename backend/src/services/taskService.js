const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

const createTask = async(projectId, tenantId, title, description, priority, assignedTo, dueDate) => {
    const result = await db.query(
        `INSERT INTO tasks (project_id, tenant_id, title, description, priority, assigned_to, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at`, [projectId, tenantId, title, description || null, priority || 'medium', assignedTo || null, dueDate || null]
    );

    return result.rows[0];
};

const getTaskById = async(taskId, tenantId) => {
    const result = await db.query(
        'SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2', [taskId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Task not found');
    }

    return result.rows[0];
};

const listTasksByProject = async(projectId, tenantId, limit = 100, offset = 0) => {
    const result = await db.query(
        `SELECT id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at
     FROM tasks WHERE project_id = $1 AND tenant_id = $2 AND status != 'cancelled'
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`, [projectId, tenantId, limit, offset]
    );

    const countResult = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE project_id = $1 AND tenant_id = $2 AND status != $3', [projectId, tenantId, 'cancelled']
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        limit,
        offset,
    };
};

const listTasksByTenant = async(tenantId, limit = 100, offset = 0) => {
    const result = await db.query(
        `SELECT id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at
     FROM tasks WHERE tenant_id = $1 AND status != 'cancelled'
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`, [tenantId, limit, offset]
    );

    const countResult = await db.query(
        'SELECT COUNT(*) as count FROM tasks WHERE tenant_id = $1 AND status != $2', [tenantId, 'cancelled']
    );

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count, 10),
        limit,
        offset,
    };
};

const updateTask = async(taskId, tenantId, updates) => {
    const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'];
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
        return getTaskById(taskId, tenantId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);
    values.push(tenantId);

    const result = await db.query(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCounter} AND tenant_id = $${paramCounter + 1} RETURNING *`,
        values
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Task not found');
    }

    return result.rows[0];
};

const deleteTask = async(taskId, tenantId) => {
    const result = await db.query(
        'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id', [taskId, tenantId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Task not found');
    }

    return result.rows[0];
};

module.exports = {
    createTask,
    getTaskById,
    listTasksByProject,
    listTasksByTenant,
    updateTask,
    deleteTask,
};