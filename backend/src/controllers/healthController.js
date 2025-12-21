const db = require('../config/database');

const healthCheck = async(req, res, next) => {
    try {
        const result = await db.query('SELECT NOW()');
        return res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            uptime: Math.round(process.uptime()),
            version: process.env.npm_package_version || '1.0.0',
            env: process.env.NODE_ENV || 'development',
        });
    } catch (error) {
        return res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
        });
    }
};

module.exports = {
    healthCheck,
};