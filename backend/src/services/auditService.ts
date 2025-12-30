import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

type LogActionArgs = {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
};

export const logAction = async ({ tenantId, userId, action, entityType, entityId, ipAddress }: LogActionArgs) => {
  try {
    await query(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [uuidv4(), tenantId || null, userId || null, action, entityType, entityId || null, ipAddress || null]
    );
  } catch (err) {
    console.error('Failed to log action', err);
  }
};