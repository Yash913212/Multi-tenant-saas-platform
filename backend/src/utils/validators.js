const Joi = require('joi');

const schemas = {
    // Auth Schemas
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        full_name: Joi.string().required(),
        subdomain: Joi.string().optional(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    // Tenant Schemas
    createTenant: Joi.object({
        name: Joi.string().required(),
        subdomain: Joi.string().alphanum().min(3).max(63).required(),
        subscription_plan: Joi.string().valid('free', 'starter', 'pro', 'enterprise').default('free'),
        max_users: Joi.number().default(5),
        max_projects: Joi.number().default(5),
    }),

    updateTenant: Joi.object({
        name: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
        subscription_plan: Joi.string().valid('free', 'starter', 'pro', 'enterprise').optional(),
        max_users: Joi.number().optional(),
        max_projects: Joi.number().optional(),
    }),

    // User Schemas
    createUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        full_name: Joi.string().required(),
        role: Joi.string().valid('tenant_admin', 'user').default('user'),
    }),

    updateUser: Joi.object({
        full_name: Joi.string().optional(),
        role: Joi.string().valid('tenant_admin', 'user').optional(),
        is_active: Joi.boolean().optional(),
    }),

    // Project Schemas
    createProject: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
    }),

    updateProject: Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional(),
        status: Joi.string().valid('active', 'archived', 'deleted').optional(),
    }),

    // Task Schemas
    createTask: Joi.object({
        project_id: Joi.string().uuid().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        assigned_to: Joi.string().uuid().optional(),
        due_date: Joi.date().optional(),
    }),

    updateTask: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        status: Joi.string().valid('todo', 'in_progress', 'done', 'cancelled').optional(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
        assigned_to: Joi.string().uuid().allow(null).optional(),
        due_date: Joi.date().allow(null).optional(),
    }),
};

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                data: error.details.map(e => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        req.validated = value;
        next();
    };
};

module.exports = {
    schemas,
    validateRequest,
};