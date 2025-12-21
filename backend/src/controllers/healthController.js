const db = require('../config/database');

const healthCheck = async(req, res, next) => {
    try {
        const result = await db.query('SELECT NOW()');
        return res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
        });
    }
};

module.exports = {
    healthCheck,
};