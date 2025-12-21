# Architecture Document
## Multi-Tenant SaaS Platform - System Design

---

## Containerization Overview

This platform is fully containerized with Docker Compose using three services:

- `database` (PostgreSQL): 5432 → 5432, persistent volume `db_data`
- `backend` (Node.js/Express): 5000 → 5000, automatic migrations + seed via entrypoint, health `GET /api/health`
- `frontend` (React): 3000 → 3000, API base `http://backend:5000/api`

All services run on the `saas_network` bridge and are started together with `docker-compose up -d`.

## 1. System Architecture Overview

The Multi-Tenant SaaS Platform follows a three-tier architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Browser    │  │   Mobile    │  │  Third Party     │   │
│  │  (React)    │  │   Apps      │  │  Clients         │   │
│  └──────┬──────┘  └──────┬──────┘  └─────────┬────────┘   │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │   HTTPS/REST     │   HTTPS/REST     │
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴─────────────┐
│                    API LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js Server (Node.js)                │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ CORS Middleware                               │ │  │
│  │  │ Authentication Middleware (JWT Verification)  │ │  │
│  │  │ Tenant Context Middleware (Extract tenant_id) │ │  │
│  │  │ Authorization Middleware (Role Checking)      │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Route Handlers (19 endpoints)                 │ │  │
│  │  │ - Auth Module (4 endpoints)                   │ │  │
│  │  │ - Tenant Module (3 endpoints)                 │ │  │
│  │  │ - User Module (4 endpoints)                   │ │  │
│  │  │ - Project Module (4 endpoints)                │ │  │
│  │  │ - Task Module (4 endpoints)                   │ │  │
│  │  │ - Health Check (1 endpoint)                   │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Services Layer                                 │ │  │
│  │  │ - AuthService (JWT, password hashing)         │ │  │
│  │  │ - TenantService (tenant operations)           │ │  │
│  │  │ - UserService (user management)               │ │  │
│  │  │ - ProjectService (project operations)         │ │  │
│  │  │ - TaskService (task operations)               │ │  │
│  │  │ - AuditService (logging)                      │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Error Handling & Response Formatting           │ │  │
│  │  │ All responses: {success, message, data}        │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬──────────────────────────────────┬────────────┘
              │                                  │
              │  SQL/TCP                         │
              │                                  │
┌─────────────┴──────────────────────────────────┴────────────┐
│                   DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                       │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Core Tables (Row-Level Isolation)             │ │  │
│  │  │ ┌──────────┐ ┌───────┐ ┌──────────┐         │ │  │
│  │  │ │ tenants  │ │ users │ │ projects │         │ │  │
│  │  │ └──────────┘ └───────┘ └──────────┘         │ │  │
│  │  │ ┌───────┐ ┌────────────┐ ┌───────────┐      │ │  │
│  │  │ │ tasks │ │ audit_logs │ │ sessions  │      │ │  │
│  │  │ └───────┘ └────────────┘ └───────────┘      │ │  │
│  │  │                                             │ │  │
│  │  │ All tables include tenant_id column        │ │  │
│  │  │ (except sessions which links via user_id)  │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Indexes                                        │ │  │
│  │  │ - tenant_id on all tables (fast filtering)    │ │  │
│  │  │ - (tenant_id, email) composite on users      │ │  │
│  │  │ - created_at indexes for sorting              │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Constraints                                    │ │  │
│  │  │ - Foreign keys with CASCADE delete             │ │  │
│  │  │ - Unique constraints (subdomain, email+tenant)│ │  │
│  │  │ - NOT NULL on required fields                  │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Design (ERD)

### Entity Relationship Diagram

```
┌─────────────────────────┐
│      TENANTS            │
├─────────────────────────┤
│ * id (PK, UUID)        │
│ * name (VARCHAR)        │
│ * subdomain (UNIQUE)    │
│ * status (ENUM)         │
│ * subscription_plan     │
│ * max_users             │
│ * max_projects          │
│ * created_at            │
│ * updated_at            │
└────────────┬────────────┘
             │
             │ 1:N
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
┌──────────────┐  ┌──────────────────┐
│    USERS     │  │    PROJECTS      │
├──────────────┤  ├──────────────────┤
│ * id (PK)    │  │ * id (PK)        │
│ * tenant_id  │  │ * tenant_id (FK) │◄───┐
│ * email      │  │ * name           │    │
│ * password   │  │ * description    │    │
│ * full_name  │  │ * status         │    │
│ * role       │  │ * created_by(FK)─┼───┘
│ * is_active  │  │ * created_at     │
│ * created_at │  │ * updated_at     │
│ * updated_at │  └────────┬─────────┘
└──────┬───────┘           │
       │                   │ 1:N
       │                   │
       │                   ▼
       │            ┌──────────────────┐
       │            │     TASKS        │
       │            ├──────────────────┤
       │            │ * id (PK)        │
       │            │ * project_id(FK) │
       │            │ * tenant_id(FK)  │
       │            │ * title          │
       │            │ * description    │
       │            │ * status         │
       │            │ * priority       │
       │            │ * assigned_to(FK)├──┐
       │            │ * due_date       │  │
       │            │ * created_at     │  │
       │            │ * updated_at     │  │
       │            └──────────────────┘  │
       │                                   │
       └───────────────────────────────────┘
              (References USERS)

┌──────────────────────┐
│   AUDIT_LOGS         │
├──────────────────────┤
│ * id (PK)            │
│ * tenant_id (FK)     │
│ * user_id (FK)       │
│ * action             │
│ * entity_type        │
│ * entity_id          │
│ * ip_address         │
│ * created_at         │
└──────────────────────┘

┌──────────────────────┐
│   SESSIONS (OPT)     │
├──────────────────────┤
│ * id (PK)            │
│ * user_id (FK)       │
│ * token              │
│ * expires_at         │
│ * created_at         │
└──────────────────────┘
```

### Table Specifications

#### 1. TENANTS Table
- **Purpose**: Store organization information
- **Isolation**: Base entity for multi-tenancy
- **Indexes**: subdomain (UNIQUE), created_at
- **Foreign Keys**: None
- **Cascade Delete**: Yes - cascade to users, projects, tasks, audit_logs

#### 2. USERS Table
- **Purpose**: Store user accounts with role-based access
- **Isolation**: tenant_id (NULL for super_admin only)
- **Indexes**: tenant_id, (tenant_id, email) composite, created_at
- **Foreign Keys**: tenant_id → tenants.id (CASCADE)
- **Unique Constraints**: (tenant_id, email) composite, except super_admin

#### 3. PROJECTS Table
- **Purpose**: Store projects within tenants
- **Isolation**: tenant_id (required)
- **Indexes**: tenant_id, created_by, created_at
- **Foreign Keys**: tenant_id → tenants.id (CASCADE), created_by → users.id
- **Cascade Delete**: Yes - cascade to tasks

#### 4. TASKS Table
- **Purpose**: Store tasks within projects
- **Isolation**: Both project_id and tenant_id (for direct filtering)
- **Indexes**: tenant_id, project_id, (tenant_id, project_id) composite, assigned_to, created_at
- **Foreign Keys**: project_id → projects.id (CASCADE), tenant_id → tenants.id (CASCADE), assigned_to → users.id (SET NULL)
- **Notes**: assigned_to can be NULL (unassigned)

#### 5. AUDIT_LOGS Table
- **Purpose**: Immutable audit trail for compliance
- **Isolation**: tenant_id (can be NULL for system actions)
- **Indexes**: tenant_id, user_id, created_at
- **Foreign Keys**: tenant_id → tenants.id (SET NULL), user_id → users.id (SET NULL)
- **Notes**: Immutable - no updates/deletes in normal operations

#### 6. SESSIONS Table (Optional)
- **Purpose**: Track active user sessions (only if not using JWT-only)
- **Isolation**: Via user_id → tenant_id relationship
- **Indexes**: token (UNIQUE), user_id, expires_at
- **Foreign Keys**: user_id → users.id (CASCADE)
- **Notes**: Can be omitted if using JWT-only authentication

---

## 3. API Architecture

### API Layer Design

The API layer is organized into logical modules with consistent response formats:

#### Response Format (All Endpoints)
```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {} | [] | null
}
```

#### Status Codes
| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE, PATCH |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission, limit exceeded |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/subdomain |
| 500 | Server Error | Unexpected server error |

### API Endpoints (19 Total)

#### Authentication Module (4 endpoints)
1. **POST /api/auth/register-tenant** - Register new tenant
2. **POST /api/auth/login** - User login
3. **GET /api/auth/me** - Get current user details
4. **POST /api/auth/logout** - User logout

#### Tenant Management Module (3 endpoints)
5. **GET /api/tenants/:tenantId** - Get tenant details
6. **PUT /api/tenants/:tenantId** - Update tenant
7. **GET /api/tenants** - List all tenants (super_admin only)

#### User Management Module (4 endpoints)
8. **POST /api/tenants/:tenantId/users** - Add user to tenant
9. **GET /api/tenants/:tenantId/users** - List tenant users
10. **PUT /api/users/:userId** - Update user
11. **DELETE /api/users/:userId** - Delete user

#### Project Management Module (4 endpoints)
12. **POST /api/projects** - Create project
13. **GET /api/projects** - List projects
14. **PUT /api/projects/:projectId** - Update project
15. **DELETE /api/projects/:projectId** - Delete project

#### Task Management Module (4 endpoints)
16. **POST /api/projects/:projectId/tasks** - Create task
17. **GET /api/projects/:projectId/tasks** - List project tasks
18. **PATCH /api/tasks/:taskId/status** - Update task status
19. **PUT /api/tasks/:taskId** - Update task

#### Health Check (1 endpoint)
20. **GET /api/health** - Health check with database status

---

## 4. Authentication & Authorization Flow

### JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "660e8400-e29b-41d4-a716-446655440000",
  "role": "tenant_admin",
  "iat": 1704255600,
  "exp": 1704342000
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "jwt_secret_key"
)
```

### Authentication Flow
```
1. User submits email + password + tenant_subdomain
                          ↓
2. Backend verifies tenant exists and is active
                          ↓
3. Backend queries user by (tenant_id, email)
                          ↓
4. Backend compares password hash using bcrypt
                          ↓
5. If valid: Generate JWT token with {userId, tenantId, role}
                          ↓
6. Return token to client
                          ↓
7. Client stores token in localStorage/sessionStorage
                          ↓
8. Client includes token in Authorization: Bearer {token} header
                          ↓
9. Backend validates token signature and expiry on each request
```

### Authorization Decision Tree
```
Request → Has JWT Token?
           ├─ No  → Return 401 Unauthorized
           └─ Yes → Verify Signature & Expiry
                    ├─ Invalid/Expired → Return 401
                    └─ Valid → Extract {userId, tenantId, role}
                              ↓
                              Check Resource Ownership?
                              ├─ Admin accessing other tenant → 403
                              ├─ User accessing other tenant resource → 403
                              ├─ User needs specific role → Check role
                              │  ├─ Role matches → Proceed ✓
                              │  └─ Role insufficient → 403
                              └─ Role OK → Check business logic
                                 ├─ Subscription limit exceeded → 403
                                 ├─ Constraint violation → 400
                                 └─ All checks pass → Execute ✓
```

---

## 5. Data Flow Examples

### Example 1: Tenant Registration
```
POST /api/auth/register-tenant
{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "Pass@123",
  "adminFullName": "Jane Doe"
}
    ↓
1. Validate input (email format, password strength, subdomain format)
2. Check subdomain uniqueness
3. Hash password using bcryptjs
4. Start database transaction
5. Create tenant record with subscription_plan = 'free'
6. Create user record (role='tenant_admin', tenant_id=new_tenant.id)
7. Commit transaction
8. Return success response with tenant and user info
```

### Example 2: Task Creation
```
POST /api/projects/{projectId}/tasks
{
  "title": "Design homepage",
  "priority": "high",
  "assignedTo": "user-uuid",
  "dueDate": "2024-12-31"
}
    ↓
1. Extract userId and tenantId from JWT token
2. Verify project exists (query by projectId)
3. Verify project belongs to authenticated user's tenant
4. If assignedTo provided:
   - Query user by userId
   - Verify user belongs to same tenant
5. Check that current task count < max_projects (from tenant)
   ├─ Actually, this is project limit, not task limit - no check needed
6. Create task record with:
   - tenantId from project (not from JWT - for safety)
   - status = 'todo' (default)
7. Log action to audit_logs table
8. Return created task with assigned user details
```

---

## 6. Middleware & Cross-Cutting Concerns

### Middleware Stack (Request Processing Order)
```
1. CORS Middleware
   - Allow requests from FRONTEND_URL only
   - Enable credentials

2. Body Parser Middleware
   - Parse JSON request bodies
   - Limit payload size

3. Authentication Middleware
   - Extract JWT from Authorization header
   - Verify signature using JWT secret
   - Handle token expiry
   - Set req.user = {id, tenantId, role}

4. Tenant Context Middleware
   - Ensure req.user.tenantId is present (except for super_admin checking)
   - Available for authorization checks

5. Route Handlers
   - Role-based authorization
   - Business logic
   - Database operations
   - Audit logging

6. Error Handling Middleware
   - Catch all errors
   - Format response consistently
   - Never expose sensitive error details
```

---

## 7. Deployment Architecture

### Docker Container Structure
```
┌────────────────────────────────────────────┐
│         Docker Compose Network              │
├────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌────────────────────┐ │
│  │  Database    │  │  Backend Service   │ │
│  │  Container   │  │  Container         │ │
│  │  (postgres)  │  │  (Node.js/Express) │ │
│  │  Port: 5432  │  │  Port: 5000        │ │
│  └──────────────┘  └────────────────────┘ │
│        │                     │             │
│        │                     ▼             │
│        │            ┌──────────────────┐  │
│        │            │  Frontend Service│  │
│        │            │  Container       │  │
│        │            │  (React/Nginx)   │  │
│        │            │  Port: 3000      │  │
│        │            └──────────────────┘  │
│        └────────────────────┬─────────────┘
│                             │
│    Internal Docker Network  │
│    (service-to-service)     │
│                             │
└────────────────────────────┬────────────────┘
                             │
                    Host Machine Ports
                    ├─ 5432 → Database
                    ├─ 5000 → Backend
                    └─ 3000 → Frontend
```

---

## 8. Security Architecture

### Defense-in-Depth Strategy
```
Layer 1: Network Level
- HTTPS in production
- CORS configuration
- Docker network isolation

Layer 2: Authentication Level
- JWT with 24-hour expiry
- Bcrypt password hashing (10 salt rounds)
- Token signature verification

Layer 3: Authorization Level
- Role-based access control
- Tenant context verification
- Resource ownership checks

Layer 4: Data Level
- Row-level filtering by tenant_id
- Parameterized SQL queries
- Foreign key constraints

Layer 5: Audit Level
- All mutations logged
- User and tenant tracking
- Timestamp recording
- IP address logging (optional)
```

---

## 9. Scalability Considerations

### Horizontal Scaling Strategy
```
Current Architecture (Single Instance):
  Frontend ← (HTTPS) → Backend ← (TCP) → Database
  
Future Architecture (Multiple Backends):
  
  Frontend ← (HTTPS) → Load Balancer
                       ├─ Backend Instance 1
                       ├─ Backend Instance 2
                       ├─ Backend Instance 3
                       └─ ...
                       
                       All → Database (connection pool)
                       
Cache Layer (Optional):
  Redis Cache ← (TCP) → Backend Instances
                     (for session/token caching)
```

### Performance Optimization
1. **Database Indexing**: Indexes on tenant_id and frequently filtered columns
2. **Connection Pooling**: Reuse database connections
3. **Query Optimization**: Minimize N+1 queries, use JOINs
4. **Pagination**: Limit data transfer for list endpoints
5. **Caching**: Cache tenant configurations (optional)

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Final
