-- Super admin user
INSERT INTO users (email, password_hash, full_name, role, tenant_id, is_active)
VALUES ('superadmin@system.com', '$2a$10$WjCfPqDZRTmn.KNzE9gIpuPXEK6vv3J7gPfkwF5J0gJZvd8yZqQwK', 'Super Admin', 'super_admin', NULL, true);

-- Demo Tenant
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES ('Demo Company', 'demo', 'active', 'pro', 10, 10)
RETURNING id;

-- Demo Tenant Admin (update this with actual tenant_id)
-- INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
-- VALUES ('<tenant_id>', 'admin@demo.com', '$2a$10$WjCfPqDZRTmn.KNzE9gIpuPXEK6vv3J7gPfkwF5J0gJZvd8yZqQwK', 'Demo Admin', 'tenant_admin', true);

-- Demo Users (update with actual tenant_id)
-- INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
-- VALUES ('<tenant_id>', 'user1@demo.com', '$2a$10$9xF5QhvdZvp3qEWvT8Xhf.q6y3PkPKK7zHj8jYmKdJFrM0y0kOGCG', 'User One', 'user', true);

-- INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
-- VALUES ('<tenant_id>', 'user2@demo.com', '$2a$10$9xF5QhvdZvp3qEWvT8Xhf.q6y3PkPKK7zHj8jYmKdJFrM0y0kOGCG', 'User Two', 'user', true);
