-- Fix: Ensure demo tenant and user are properly seeded
-- This migration cleans up any incomplete seed data and reinserts it correctly

-- Delete existing demo user if it exists (without this the user insert will fail)
DELETE FROM users WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Delete existing demo tenant if it exists
DELETE FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001';

-- Now insert the tenant first (this is required before inserting the user)
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo', 'active', 'pro', 25, 15, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Then insert the admin user for the demo tenant
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'admin@demo.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6MRFG',
  'Demo Admin',
  'tenant_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, email) DO NOTHING;
