# Database Schema Reference

Complete documentation of the multi-tenant SaaS platform database schema.

## Overview

The database uses PostgreSQL with the following design principles:
- **Row-level isolation**: `tenant_id` in every table for filtering
- **Referential integrity**: Foreign keys prevent orphaned records
- **Scalability**: Indexes on frequently accessed columns
- **Immutability**: Audit logs cannot be modified

## Tables

### 1. tenants

Represents each customer organization in the system.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(63) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
  max_users INTEGER DEFAULT 5,
  max_projects INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `name`: Tenant organization name (e.g., "Acme Corp")
- `subdomain`: URL subdomain for tenant (e.g., "acme" → acme.example.com)
- `status`: Tenant status (active, inactive, suspended)
- `subscription_plan`: Service tier (free, starter, professional, enterprise)
- `max_users`: Maximum users allowed in this subscription
- `max_projects`: Maximum projects allowed in this subscription
- `created_at`: When tenant was created
- `updated_at`: When tenant was last updated

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_tenants_subdomain ON tenants(subdomain);
```

**Constraints**:
- `subdomain` must be unique and URL-safe
- `status` must be one of predefined values
- `subscription_plan` must be one of predefined values

---

### 2. users

System users, one per tenant. Implements per-tenant uniqueness.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'tenant_admin', 'user')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `tenant_id`: Which tenant this user belongs to (REQUIRED)
- `email`: User email (unique per tenant)
- `password_hash`: Bcrypt hashed password
- `full_name`: User's full name
- `role`: User's role
  - `super_admin`: System administrator (sees all tenants)
  - `tenant_admin`: Tenant administrator (manages users, settings)
  - `user`: Regular user (can create projects/tasks)
- `is_active`: Whether user can login
- `created_at`: Account creation timestamp
- `updated_at`: Last updated timestamp

**Indexes**:
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX idx_users_tenant_email ON users(tenant_id, email);
```

**Constraints**:
- `tenant_id` cannot be NULL (every user belongs to a tenant)
- `email` must be unique per tenant (same email OK in different tenants)
- `role` must be one of three predefined values
- Cascade delete: deleting tenant deletes all users

**Example Data**:
```
super_admin@system.com (role: super_admin, tenant: system)
admin@acme.com (role: tenant_admin, tenant: acme)
user@acme.com (role: user, tenant: acme)
```

---

### 3. projects

Projects within tenants. Enable user to organize tasks.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique project identifier
- `tenant_id`: Tenant this project belongs to
- `name`: Project name (e.g., "Website Redesign")
- `description`: Project description (optional)
- `status`: Project status (active, archived)
- `created_by`: User who created the project
- `created_at`: When project was created
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
```

**Constraints**:
- `tenant_id` cannot be NULL
- `status` must be 'active' or 'archived'
- `created_by` can be NULL if user deleted
- Cascade delete: deleting tenant deletes all projects
- Set NULL: if user deleted, project remains but created_by is NULL

---

### 4. tasks

Individual tasks within projects. Support priority, assignment, due dates.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique task identifier
- `project_id`: Which project this task belongs to
- `tenant_id`: Which tenant (for efficient filtering)
- `title`: Task title (e.g., "Implement login")
- `description`: Task details
- `status`: Task status
  - `todo`: Not started
  - `in_progress`: Currently being worked on
  - `completed`: Finished
- `priority`: Task priority (low, medium, high)
- `assigned_to`: User assigned to task (optional)
- `due_date`: When task should be completed
- `created_at`: When task was created
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
```

**Constraints**:
- `project_id` cannot be NULL
- `tenant_id` cannot be NULL (for fast filtering)
- `status` must be one of three values
- `priority` must be one of three values
- `assigned_to` can be NULL (unassigned tasks)
- Cascade delete: deleting project deletes all tasks

---

### 5. audit_logs

Immutable audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Unique log entry identifier
- `tenant_id`: Which tenant this log belongs to
- `user_id`: Who performed the action
- `action`: What action was taken (CREATE, UPDATE, DELETE)
- `entity_type`: What was modified (projects, tasks, users)
- `entity_id`: Which entity was modified
- `ip_address`: IP address of requester (for security)
- `created_at`: When the action occurred

**Indexes**:
```sql
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Constraints**:
- All fields are immutable (never updated)
- `action` must be CREATE, UPDATE, or DELETE
- `user_id` can be NULL if user was deleted
- Cascade delete: deleting tenant deletes logs

**Example Usage**:
```
entity_type: 'projects', entity_id: <project-uuid>, action: 'CREATE'
entity_type: 'tasks', entity_id: <task-uuid>, action: 'UPDATE'
entity_type: 'users', entity_id: <user-uuid>, action: 'DELETE'
```

---

## Data Relationships

```
tenants (1) ──── (M) users
  │
  ├── ─── (1) ─── (M) projects
  │     │
  │     └─── created_by ──→ users
  │
  └── ─── (1) ─── (M) tasks
        │
        ├─── project_id ──→ projects
        └─── assigned_to ──→ users
```

---

## Multi-Tenancy Isolation

Every query must filter by tenant to ensure isolation:

```sql
-- Correct: Filters by tenant
SELECT * FROM projects WHERE tenant_id = 'acme-tenant-id';

-- WRONG: Would show all projects (data leak!)
SELECT * FROM projects;

-- Correct: Verify assigned_to belongs to same tenant
SELECT * FROM tasks 
WHERE tenant_id = 'acme-tenant-id' 
AND assigned_to IN (
  SELECT id FROM users WHERE tenant_id = 'acme-tenant-id'
);
```

The backend enforces this automatically by extracting `tenant_id` from JWT tokens and filtering all queries.

---

## Database Constraints

### Uniqueness Constraints

```sql
UNIQUE(subdomain) -- Tenant subdomains are globally unique
UNIQUE(tenant_id, email) -- Emails unique per tenant (not globally)
```

### Foreign Key Constraints

```sql
REFERENCES tenants(id) ON DELETE CASCADE
-- Deleting tenant deletes all related records

REFERENCES users(id) ON DELETE SET NULL
-- If user deleted, reference becomes NULL (keep record)

REFERENCES projects(id) ON DELETE CASCADE
-- If project deleted, delete all its tasks
```

### Check Constraints

```sql
CHECK (status IN ('active', 'inactive', 'suspended'))
CHECK (role IN ('super_admin', 'tenant_admin', 'user'))
CHECK (priority IN ('low', 'medium', 'high'))
```

---

## Indexes and Performance

### Index Strategy

```sql
-- Tenant filtering (most common)
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);

-- Foreign key lookups
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Task status queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_projects_status ON projects(status);

-- Unique constraints (automatic)
UNIQUE(subdomain)
UNIQUE(tenant_id, email)
```

### Query Performance Tips

```sql
-- GOOD: Uses index on tenant_id
EXPLAIN ANALYZE
SELECT * FROM projects WHERE tenant_id = $1 AND status = 'active';

-- BETTER: Add index on (tenant_id, status) for frequent queries
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);

-- Verify index is used
EXPLAIN ANALYZE SELECT * FROM projects WHERE tenant_id = $1 AND status = 'active';
-- Should show "Index Scan" not "Sequential Scan"
```

---

## Data Types

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Auto-generated primary key |
| tenant_id | UUID | References tenants |
| email | VARCHAR(255) | Email format, indexed |
| password_hash | VARCHAR(255) | Bcrypt hash (60 chars) |
| status, role, priority | VARCHAR(50) | Enum-like, checked by constraint |
| created_at, updated_at | TIMESTAMP | Auto-populated |
| name, title, description | VARCHAR/TEXT | Searchable fields |

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      MULTI-TENANT DB                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐                                       │
│  │    TENANTS       │  (one org per row)                    │
│  ├──────────────────┤                                       │
│  │ id (PK)          │                                       │
│  │ name             │                                       │
│  │ subdomain (UQ)   │                                       │
│  │ subscription     │                                       │
│  └──────────────────┘                                       │
│         │ (1)                                                │
│         │                                                    │
│         ├──────────────(M)────────┐                          │
│         │                          │                         │
│         ▼                          ▼                         │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │     USERS        │      │   PROJECTS       │            │
│  ├──────────────────┤      ├──────────────────┤            │
│  │ id (PK)          │      │ id (PK)          │            │
│  │ tenant_id (FK)   │◄─┐   │ tenant_id (FK)   │            │
│  │ email (UQ)       │  │   │ created_by (FK)  │            │
│  │ password_hash    │  │   └──────────────────┘            │
│  │ role             │  │          │ (1)                     │
│  │ is_active        │  │          │                         │
│  └──────────────────┘  │          │ (M)                     │
│         │              │          ▼                         │
│         │ (1)          └──── ┌──────────────────┐           │
│         │                    │      TASKS       │           │
│         │ (M)                ├──────────────────┤           │
│         └──────────────┬────►│ id (PK)          │           │
│                        │     │ project_id (FK)  │           │
│                        └────►│ tenant_id (FK)   │           │
│                              │ assigned_to (FK) │           │
│                              │ status           │           │
│                              │ priority         │           │
│                              └──────────────────┘           │
│                                                              │
│  ┌──────────────────────────────────────────┐              │
│  │      AUDIT_LOGS (immutable)              │              │
│  ├──────────────────────────────────────────┤              │
│  │ id, tenant_id, user_id, action           │              │
│  │ entity_type, entity_id, ip_address       │              │
│  │ created_at (no updates)                  │              │
│  └──────────────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Capacity Planning

### Storage Estimates (per 1000 tenants)

| Table | Rows | Size |
|-------|------|------|
| tenants | 1,000 | ~100 KB |
| users | 50,000 | ~10 MB |
| projects | 100,000 | ~15 MB |
| tasks | 1,000,000 | ~200 MB |
| audit_logs | 5,000,000 | ~800 MB |
| **Total** | **6,151,000** | **~1 GB** |

---

## Backup and Recovery

### Backup Strategy

```bash
# Daily backup (should run via cron or cloud scheduler)
pg_dump -U postgres -d saas_db > backup-$(date +%Y-%m-%d).sql

# Restore from backup
psql -U postgres -d saas_db < backup-2024-01-15.sql

# Point-in-time recovery (WAL archiving required)
pg_basebackup -D /var/lib/postgresql/backup
```

### Data Consistency

```sql
-- Check for orphaned records
SELECT * FROM tasks WHERE project_id NOT IN (SELECT id FROM projects);
SELECT * FROM projects WHERE tenant_id NOT IN (SELECT id FROM tenants);
SELECT * FROM users WHERE tenant_id NOT IN (SELECT id FROM tenants);

-- Verify indexes
REINDEX INDEX idx_users_tenant;
REINDEX INDEX idx_projects_tenant;
```

---

## Evolution and Migrations

The schema was built incrementally:

1. `001_create_tenants.sql` - Base tenant table
2. `002_create_users.sql` - User management per tenant
3. `003_create_projects.sql` - Project organization
4. `004_create_tasks.sql` - Task management
5. `005_create_audit_logs.sql` - Compliance and auditing

To add new tables:
1. Create `database/migrations/006_*.sql`
2. Add schema definition
3. Run `node scripts/init-db.js` to apply
4. Update this documentation
5. Commit with meaningful message

---

## Maintenance

```sql
-- Regular maintenance (should run monthly)
VACUUM ANALYZE;  -- Reclaim space and update statistics
REINDEX DATABASE saas_db;  -- Rebuild all indexes

-- Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## See Also

- [API Documentation](docs/API.md) - How these tables are accessed
- [SECURITY.md](SECURITY.md) - Security considerations
- [PERFORMANCE.md](PERFORMANCE.md) - Query optimization
- [DEPLOYMENT.md](DEPLOYMENT.md) - Database setup for production
