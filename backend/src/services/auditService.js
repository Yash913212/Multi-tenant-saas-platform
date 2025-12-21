const db = require('../config/database');

const logAction = async(tenantId, userId, action, entityType, entityId, ipAddress) => {
    try {
        await db.query(
            `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`, [tenantId, userId, action, entityType, entityId, ipAddress]
        );
    } catch (error) {
        console.error('Error logging audit action:', error);
    }
};

module.exports = {
    logAction,
};