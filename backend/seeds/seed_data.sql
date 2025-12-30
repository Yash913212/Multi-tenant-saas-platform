-- Cleanup existing seed data to keep seeds idempotent
DELETE FROM tasks WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM projects WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111' OR email = 'superadmin@system.com';
DELETE FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111' OR subdomain = 'demo';

-- Seed tenants
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111','Demo Company','demo','active','pro',25,15,NOW(),NOW())
ON CONFLICT DO NOTHING;

-- Seed users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'superadmin@system.com', '$2a$10$fRQsNoumyqCnuPhfvAbL8.YKhvck9iFU4AoFUg/MK6Huqz4YsZcNq', 'Super Admin', 'super_admin', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@demo.com', '$2a$10$osyGddmAeaR0AO6oPFB4duAj4.ZkfhtKEKA7FgHiaAyjMFGMjwS1u', 'Demo Admin', 'tenant_admin', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'user1@demo.com', '$2a$10$iCl7THna6ErqDymnLLtN..bgo.7YjS57wWMsBknCKg7Mu9iu7sHVK', 'Demo User One', 'user', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'user2@demo.com', '$2a$10$iCl7THna6ErqDymnLLtN..bgo.7YjS57wWMsBknCKg7Mu9iu7sHVK', 'Demo User Two', 'user', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed projects
INSERT INTO projects (id, tenant_id, name, description, status, created_by, created_at, updated_at)
VALUES
('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111','Project Alpha','First demo project','active','22222222-2222-2222-2222-222222222222',NOW(),NOW()),
('66666666-6666-6666-6666-666666666666','11111111-1111-1111-1111-111111111111','Project Beta','Second demo project','active','22222222-2222-2222-2222-222222222222',NOW(),NOW())
ON CONFLICT DO NOTHING;

-- Seed tasks
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
VALUES
('77777777-7777-7777-7777-777777777771','55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111','Setup project repo','Initialize repository','todo','medium','22222222-2222-2222-2222-222222222222','2024-07-01',NOW(),NOW()),
('77777777-7777-7777-7777-777777777772','55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111','Design homepage mockup','Create design','in_progress','high','33333333-3333-3333-3333-333333333333','2024-07-15',NOW(),NOW()),
('77777777-7777-7777-7777-777777777773','66666666-6666-6666-6666-666666666666','11111111-1111-1111-1111-111111111111','Implement API layer','Develop backend APIs','todo','high','44444444-4444-4444-4444-444444444444','2024-08-01',NOW(),NOW()),
('77777777-7777-7777-7777-777777777774','66666666-6666-6666-6666-666666666666','11111111-1111-1111-1111-111111111111','Write unit tests','Add coverage','todo','medium',NULL,'2024-08-10',NOW(),NOW()),
('77777777-7777-7777-7777-777777777775','55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111','Deploy to staging','Prepare docker compose','todo','medium',NULL,'2024-09-01',NOW(),NOW())
ON CONFLICT DO NOTHING;
