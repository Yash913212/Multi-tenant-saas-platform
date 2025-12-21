const tenantService = require('../services/tenantService');
const auditService = require('../services/auditService');
const { successResponse } = require('../utils/response');

const createTenant = async(req, res, next) => {
    try {
        const { name, subdomain, subscription_plan, max_users, max_projects } = req.validated;
        const tenant = await tenantService.createTenant(
            name,
            subdomain,
            subscription_plan,
            max_users,
            max_projects
        );

        await auditService.logAction(
            tenant.id,
            req.user.userId,
            'CREATE',
            'tenant',
            tenant.id,
            req.ip
        );

        return res.status(201).json(successResponse('Tenant created successfully', tenant));
    } catch (error) {
        next(error);
    }
};

const getTenant = async(req, res, next) => {
    try {
        const { id } = req.params;
        const tenant = await tenantService.getTenantById(id);

        // Check if user is super_admin or belongs to this tenant
        if (req.user.role !== 'super_admin' && req.user.tenantId !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: null,
            });
        }

        return res.json(successResponse('Tenant retrieved successfully', tenant));
    } catch (error) {
        next(error);
    }
};

const updateTenant = async(req, res, next) => {
    try {
        const { id } = req.params;
        const tenant = await tenantService.getTenantById(id);

        // Check if user is super_admin
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Only super admin can update tenants',
                data: null,
            });
        }

        const updated = await tenantService.updateTenant(id, req.validated);

        await auditService.logAction(
            id,
            req.user.userId,
            'UPDATE',
            'tenant',
            id,
            req.ip
        );

        return res.json(successResponse('Tenant updated successfully', updated));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTenant,
    getTenant,
    updateTenant,
};