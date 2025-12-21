const taskService = require('../services/taskService');
const auditService = require('../services/auditService');
const { successResponse } = require('../utils/response');

const createTask = async(req, res, next) => {
    try {
        const { project_id, title, description, priority, assigned_to, due_date } = req.validated;
        const task = await taskService.createTask(
            project_id,
            req.user.tenantId,
            title,
            description,
            priority,
            assigned_to,
            due_date
        );

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'CREATE',
            'task',
            task.id,
            req.ip
        );

        return res.status(201).json(successResponse('Task created successfully', task));
    } catch (error) {
        next(error);
    }
};

const getTask = async(req, res, next) => {
    try {
        const { id } = req.params;
        const task = await taskService.getTaskById(id, req.user.tenantId);

        return res.json(successResponse('Task retrieved successfully', task));
    } catch (error) {
        next(error);
    }
};

const listTasks = async(req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const { project_id } = req.query;

        let result;
        if (project_id) {
            result = await taskService.listTasksByProject(project_id, req.user.tenantId, limit, offset);
        } else {
            result = await taskService.listTasksByTenant(req.user.tenantId, limit, offset);
        }

        return res.json(successResponse('Tasks retrieved successfully', result));
    } catch (error) {
        next(error);
    }
};

const updateTask = async(req, res, next) => {
    try {
        const { id } = req.params;
        const task = await taskService.updateTask(id, req.user.tenantId, req.validated);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'UPDATE',
            'task',
            id,
            req.ip
        );

        return res.json(successResponse('Task updated successfully', task));
    } catch (error) {
        next(error);
    }
};

const deleteTask = async(req, res, next) => {
    try {
        const { id } = req.params;
        const task = await taskService.deleteTask(id, req.user.tenantId);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'DELETE',
            'task',
            id,
            req.ip
        );

        return res.json(successResponse('Task deleted successfully', task));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTask,
    getTask,
    listTasks,
    updateTask,
    deleteTask,
};