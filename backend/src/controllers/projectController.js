const projectService = require('../services/projectService');
const tenantService = require('../services/tenantService');
const auditService = require('../services/auditService');
const { successResponse } = require('../utils/response');

const createProject = async(req, res, next) => {
    try {
        // Check project limit
        await tenantService.checkTenantProjectLimit(req.user.tenantId);

        const { name, description } = req.validated;
        const project = await projectService.createProject(
            req.user.tenantId,
            name,
            description,
            req.user.userId
        );

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'CREATE',
            'project',
            project.id,
            req.ip
        );

        return res.status(201).json(successResponse('Project created successfully', project));
    } catch (error) {
        next(error);
    }
};

const getProject = async(req, res, next) => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(id, req.user.tenantId);

        return res.json(successResponse('Project retrieved successfully', project));
    } catch (error) {
        next(error);
    }
};

const listProjects = async(req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const result = await projectService.listProjectsByTenant(req.user.tenantId, limit, offset);

        return res.json(successResponse('Projects retrieved successfully', result));
    } catch (error) {
        next(error);
    }
};

const updateProject = async(req, res, next) => {
    try {
        const { id } = req.params;
        const project = await projectService.updateProject(id, req.user.tenantId, req.validated);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'UPDATE',
            'project',
            id,
            req.ip
        );

        return res.json(successResponse('Project updated successfully', project));
    } catch (error) {
        next(error);
    }
};

const deleteProject = async(req, res, next) => {
    try {
        const { id } = req.params;
        const project = await projectService.deleteProject(id, req.user.tenantId);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'DELETE',
            'project',
            id,
            req.ip
        );

        return res.json(successResponse('Project deleted successfully', project));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProject,
    getProject,
    listProjects,
    updateProject,
    deleteProject,
};