const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization ? .split(' ')[1];

        if (!token) {
            throw new AuthenticationError('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            tenantId: decoded.tenantId,
            role: decoded.role,
        };
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                data: null,
            });
        }
        return res.status(401).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super admin only.',
            data: null,
        });
    }
    next();
};

const tenantAdminOrOwner = (req, res, next) => {
    const allowedRoles = ['super_admin', 'tenant_admin'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied.',
            data: null,
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    superAdminOnly,
    tenantAdminOrOwner,
};