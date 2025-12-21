# Multi-Tenant SaaS Platform - Backend API

## Overview
Complete Node.js/Express backend for a multi-tenant SaaS platform with 19 API endpoints, PostgreSQL database, JWT authentication, and tenant isolation.

## Database Setup

### Create PostgreSQL Database
```bash
createdb saas_db
```

### Run Migrations
```bash
npm run init-db
```

This automatically:
- Creates all 5 tables (tenants, users, projects, tasks, audit_logs)
- Sets up indexes for performance
- Seeds initial data (super admin + demo tenant)

## Installation & Running

```bash
cd backend
npm install
npm run init-db  # Initialize database
npm start         # Start server on port 3000
```

For development with auto-reload:
```bash
npm run dev
```

## Default Credentials (After init-db)

### Super Admin
- Email: `superadmin@system.com`
- Password: `Admin@123`
- Role: `super_admin`

### Demo Tenant Admin
- Email: `admin@demo.com`
- Password: `Demo@123`
- Role: `tenant_admin`
- Tenant: `Demo Company` (subdomain: `demo`)

### Demo Users
- Email: `user1@demo.com` / `user2@demo.com`
- Password: `User@123`
- Role: `user`
- Tenant: `Demo Company`

## 19 API Endpoints

### Health & Auth (3 endpoints)

#### 1. Health Check
```
GET /api/health
```
No authentication required.
Returns: `{status: "ok", database: "connected"}`

#### 2. Register
```
POST /api/auth/register
```
Create new super admin OR new tenant + tenant admin.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Name",
  "subdomain": "optional-tenant-subdomain"
}
```

**Response:** `{success, message, data: {user, token, tenant?}}`

#### 3. Login
```
POST /api/auth/login
```
Authenticate and get JWT token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `{success, message, data: {user, token}}`

### Tenants (3 endpoints)

#### 4. Create Tenant (Super Admin Only)
```
POST /api/tenants
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Company Name",
  "subdomain": "company",
  "subscription_plan": "pro",
  "max_users": 10,
  "max_projects": 10
}
```

#### 5. Get Tenant
```
GET /api/tenants/:id
Authorization: Bearer <token>
```
Super admin OR tenant member can retrieve tenant.

#### 6. Update Tenant (Super Admin Only)
```
PATCH /api/tenants/:id
Authorization: Bearer <token>
```

**Body:** (any of these fields)
```json
{
  "name": "New Name",
  "status": "active|inactive|suspended",
  "subscription_plan": "free|starter|pro|enterprise",
  "max_users": 20,
  "max_projects": 20
}
```

### Users (5 endpoints)

#### 7. Create User
```
POST /api/users
Authorization: Bearer <token>
```
Only `tenant_admin` or `super_admin` can create users.

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "User Name",
  "role": "user|tenant_admin"
}
```

#### 8. List Users
```
GET /api/users?limit=100&offset=0
Authorization: Bearer <token>
```
Lists all users in the authenticated user's tenant.

#### 9. Get User
```
GET /api/users/:id
Authorization: Bearer <token>
```

#### 10. Update User
```
PATCH /api/users/:id
Authorization: Bearer <token>
```
Users can update their own profile. Admins can update any user.

**Body:**
```json
{
  "full_name": "Updated Name",
  "role": "user|tenant_admin",
  "is_active": true|false
}
```

#### 11. Delete User
```
DELETE /api/users/:id
Authorization: Bearer <token>
```
Only `tenant_admin` or `super_admin` can delete users.

### Projects (5 endpoints)

#### 12. Create Project
```
POST /api/projects
Authorization: Bearer <token>
```
Automatically assigned to authenticated tenant. Respects max_projects subscription limit.

**Body:**
```json
{
  "name": "Project Name",
  "description": "Optional description"
}
```

#### 13. List Projects
```
GET /api/projects?limit=100&offset=0
Authorization: Bearer <token>
```
Lists all projects in the authenticated user's tenant.

#### 14. Get Project
```
GET /api/projects/:id
Authorization: Bearer <token>
```

#### 15. Update Project
```
PATCH /api/projects/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "New Name",
  "description": "New description",
  "status": "active|archived|deleted"
}
```

#### 16. Delete Project
```
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Tasks (4 endpoints)

#### 17. Create Task
```
POST /api/tasks
Authorization: Bearer <token>
```

**Body:**
```json
{
  "project_id": "uuid",
  "title": "Task Title",
  "description": "Optional description",
  "priority": "low|medium|high|urgent",
  "assigned_to": "user-id-uuid (optional)",
  "due_date": "2025-12-31T10:00:00Z (optional)"
}
```

#### 18. List Tasks
```
GET /api/tasks?limit=100&offset=0&project_id=optional-uuid
Authorization: Bearer <token>
```
If `project_id` provided, lists tasks for that project. Otherwise lists all tasks in tenant.

#### 19. Get Task
```
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Additional Task Endpoints

#### Update Task
```
PATCH /api/tasks/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "New Title",
  "description": "New description",
  "status": "todo|in_progress|done|cancelled",
  "priority": "low|medium|high|urgent",
  "assigned_to": "user-id-uuid or null",
  "due_date": "2025-12-31T10:00:00Z or null"
}
```

#### Delete Task
```
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## Response Format

All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Description of result",
  "data": {} | [] | null
}
```

## Database Schema

### Tenants
- `id` UUID (PK)
- `name` VARCHAR(255)
- `subdomain` VARCHAR(255) UNIQUE
- `status` VARCHAR(50) - active|inactive|suspended
- `subscription_plan` VARCHAR(50) - free|starter|pro|enterprise
- `max_users` INTEGER
- `max_projects` INTEGER
- `created_at`, `updated_at` TIMESTAMP

### Users
- `id` UUID (PK)
- `tenant_id` UUID (FK) - NULL for super_admin
- `email` VARCHAR(255)
- `password_hash` VARCHAR(255)
- `full_name` VARCHAR(255)
- `role` VARCHAR(50) - super_admin|tenant_admin|user
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMP
- UNIQUE(tenant_id, email)

### Projects
- `id` UUID (PK)
- `tenant_id` UUID (FK)
- `name` VARCHAR(255)
- `description` TEXT
- `status` VARCHAR(50) - active|archived|deleted
- `created_by` UUID (FK to users)
- `created_at`, `updated_at` TIMESTAMP

### Tasks
- `id` UUID (PK)
- `project_id` UUID (FK)
- `tenant_id` UUID (FK)
- `title` VARCHAR(255)
- `description` TEXT
- `status` VARCHAR(50) - todo|in_progress|done|cancelled
- `priority` VARCHAR(50) - low|medium|high|urgent
- `assigned_to` UUID (FK to users)
- `due_date` TIMESTAMP
- `created_at`, `updated_at` TIMESTAMP

### Audit Logs
- `id` UUID (PK)
- `tenant_id` UUID (FK)
- `user_id` UUID (FK)
- `action` VARCHAR(50) - CREATE|UPDATE|DELETE|LOGIN|LOGOUT
- `entity_type` VARCHAR(100)
- `entity_id` VARCHAR(255)
- `ip_address` VARCHAR(45)
- `created_at` TIMESTAMP

## Key Implementation Details

### Security
- **JWT Tokens**: Signed with 24-hour expiry
- **Password Hashing**: bcryptjs with salt rounds = 10
- **Tenant Isolation**: All queries filtered by `tenant_id` from JWT token
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS**: Configured for development

### Multi-Tenancy
- Super admin (`tenant_id = NULL`) can manage all tenants
- Tenant members can only access their own tenant's data
- Email is unique per tenant (composite unique constraint)
- All entities automatically scoped to authenticated user's tenant

### Subscription Limits
- Enforced at tenant level
- `max_users`: Max users allowed per tenant
- `max_projects`: Max projects allowed per tenant
- Returns 402 (Payment Required) if limit exceeded

### Audit Logging
- Automatic logging for CREATE, UPDATE, DELETE operations
- Captures user ID, IP address, entity type and ID
- Stored in `audit_logs` table per tenant

### Middleware Order
1. CORS
2. JSON body parser
3. Health check (no auth)
4. Auth middleware (JWT validation)
5. Authorization middleware (role checks)
6. Validation middleware (Joi schemas)
7. Route handlers
8. Error handler (last)

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── cors.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── auditService.js
│   │   ├── tenantService.js
│   │   ├── userService.js
│   │   ├── projectService.js
│   │   └── taskService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── healthController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tenants.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── health.js
│   ├── utils/
│   │   ├── response.js
│   │   ├── validators.js
│   │   └── errors.js
│   ├── seeds/
│   │   └── seed.sql
│   └── app.js
├── scripts/
│   └── init-db.js
├── migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   ├── 003_create_projects.sql
│   ├── 004_create_tasks.sql
│   └── 005_create_audit_logs.sql
├── index.js
├── package.json
├── .env
└── .env.example
```

## Example Workflows

### 1. Register Super Admin & Create Tenant
```bash
# Register super admin
POST /api/auth/register
{
  "email": "superadmin@example.com",
  "password": "Admin@123",
  "full_name": "System Admin"
}

# Create new tenant (with super admin token)
POST /api/tenants
Authorization: Bearer <super_admin_token>
{
  "name": "ACME Corp",
  "subdomain": "acme",
  "subscription_plan": "pro",
  "max_users": 50,
  "max_projects": 20
}
```

### 2. Tenant Admin Creates Users
```bash
# Tenant admin logs in
POST /api/auth/login
{
  "email": "admin@demo.com",
  "password": "Demo@123"
}

# Create team member (with tenant admin token)
POST /api/users
Authorization: Bearer <tenant_admin_token>
{
  "email": "teamlead@demo.com",
  "password": "TeamLead@123",
  "full_name": "Team Lead",
  "role": "user"
}
```

### 3. Create & Manage Projects
```bash
# Create project (with any authenticated token)
POST /api/projects
Authorization: Bearer <token>
{
  "name": "Website Redesign",
  "description": "Q1 2025 website refresh"
}

# Create task in project
POST /api/tasks
Authorization: Bearer <token>
{
  "project_id": "<project-id>",
  "title": "Design mockups",
  "priority": "high",
  "assigned_to": "<user-id>"
}

# Update task status
PATCH /api/tasks/<task-id>
Authorization: Bearer <token>
{
  "status": "in_progress"
}
```

## Environment Variables

See `.env.example` for all required variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `PORT` (default: 3000)
- `JWT_SECRET` (change in production!)
- `JWT_EXPIRY` (default: 24h)
- `CORS_ORIGIN`

## Error Codes

- `400`: Validation error
- `401`: Authentication error (missing/invalid token)
- `402`: Payment required (subscription limit exceeded)
- `403`: Authorization error (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (e.g., email already exists)
- `500`: Server error

## Next Steps

1. Install dependencies: `npm install`
2. Ensure PostgreSQL is running
3. Create database: `createdb saas_db`
4. Initialize database: `npm run init-db`
5. Start server: `npm start`
6. Test health endpoint: `GET http://localhost:3000/api/health`
7. Login with demo credentials and start using the API

