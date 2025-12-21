const authService = require('../services/authService');
const auditService = require('../services/auditService');
const { successResponse, errorResponse } = require('../utils/response');
const { ValidationError } = require('../utils/errors');

const register = async(req, res, next) => {
    try {
        const { email, password, full_name, subdomain } = req.validated;
        const result = await authService.register(email, password, full_name, subdomain);

        await auditService.logAction(
            result.user.tenant_id,
            result.user.id,
            'LOGIN',
            'user',
            result.user.id,
            req.ip
        );

        return res.status(201).json(successResponse('User registered successfully', {
            user: result.user,
            token: result.token,
            tenant: result.tenant || null,
        }));
    } catch (error) {
        next(error);
    }
};

const login = async(req, res, next) => {
    try {
        const { email, password } = req.validated;
        const result = await authService.login(email, password);

        await auditService.logAction(
            result.user.tenant_id,
            result.user.id,
            'LOGIN',
            'user',
            result.user.id,
            req.ip
        );

        return res.json(successResponse('Login successful', {
            user: result.user,
            token: result.token,
        }));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};