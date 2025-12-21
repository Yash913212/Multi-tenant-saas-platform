const userService = require('../services/userService');
const tenantService = require('../services/tenantService');
const auditService = require('../services/auditService');
const { successResponse } = require('../utils/response');

const createUser = async(req, res, next) => {
    try {
        // Check user limit
        await tenantService.checkTenantUserLimit(req.user.tenantId);

        const { email, password, full_name, role } = req.validated;
        const user = await userService.createUser(
            req.user.tenantId,
            email,
            password,
            full_name,
            role
        );

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'CREATE',
            'user',
            user.id,
            req.ip
        );

        return res.status(201).json(successResponse('User created successfully', user));
    } catch (error) {
        next(error);
    }
};

const getUser = async(req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id, req.user.tenantId);

        return res.json(successResponse('User retrieved successfully', user));
    } catch (error) {
        next(error);
    }
};

const listUsers = async(req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const result = await userService.listUsersByTenant(req.user.tenantId, limit, offset);

        return res.json(successResponse('Users retrieved successfully', result));
    } catch (error) {
        next(error);
    }
};

const updateUser = async(req, res, next) => {
    try {
        const { id } = req.params;

        // Check authorization: user can update self or admin can update others
        if (req.user.userId !== id && req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: null,
            });
        }

        const user = await userService.updateUser(id, req.user.tenantId, req.validated);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'UPDATE',
            'user',
            id,
            req.ip
        );

        return res.json(successResponse('User updated successfully', user));
    } catch (error) {
        next(error);
    }
};

const deleteUser = async(req, res, next) => {
    try {
        const { id } = req.params;

        // Check authorization: only tenant_admin or super_admin can delete
        if (req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: null,
            });
        }

        const user = await userService.deleteUser(id, req.user.tenantId);

        await auditService.logAction(
            req.user.tenantId,
            req.user.userId,
            'DELETE',
            'user',
            id,
            req.ip
        );

        return res.json(successResponse('User deleted successfully', user));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getUser,
    listUsers,
    updateUser,
    deleteUser,
};