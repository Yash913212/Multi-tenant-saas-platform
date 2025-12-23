# API (short & clear)

Base URL (Docker): `http://localhost:5000/api`  
Frontend proxy (Docker): `http://localhost:3000/api`

Most endpoints require a JWT:

`Authorization: Bearer <token>`

Roles:
- `super_admin` (platform)
- `tenant_admin` (one tenant)
- `user` (one tenant)

Response format (most endpoints):
- Success: `{ "success": true, "data": ..., "message"?: string }`
- Error: `{ "success": false, "message": string }`

## Health
- `GET /health` → readiness (`503` while initializing; `200` when ready)

## Auth
- `POST /auth/register-tenant` (create tenant + first tenant admin)
  - body: `tenantName, subdomain, adminEmail, adminPassword, adminFullName`
- `POST /auth/login`
  - body: `email, password` + (`tenantSubdomain` or `tenantId`) for tenant users
  - super admin login needs only `email, password`
- `GET /auth/me` (auth required)
- `POST /auth/logout` (auth required)

## Tenants (super admin)
- `GET /tenants` (super_admin)
  - query: `page, limit, status, subscriptionPlan`
- `GET /tenants/:tenantId` (own tenant for tenant_admin OR any tenant for super_admin)
- `PUT /tenants/:tenantId`
  - super_admin: can update `name, status, subscriptionPlan, maxUsers, maxProjects`
  - tenant users: can update only `name`

## Users
- `POST /users/:tenantId/users` (tenant_admin)
  - body: `email, password, fullName, role?`
- `GET /users/:tenantId/users` (tenant scoped)
  - query: `search, role, page, limit`
- `PUT /users/:userId` (auth required)
  - user: can update own `fullName`
  - tenant_admin: can update `role` and `isActive` within tenant
- `DELETE /users/:userId` (tenant_admin; cannot delete self)

## Projects
- `POST /projects` (enforces max_projects)
  - body: `name, description?, status?`
- `GET /projects` (tenant scoped)
  - query: `status, search, page, limit`
- `PUT /projects/:projectId`
- `DELETE /projects/:projectId`

## Tasks
- `POST /tasks/projects/:projectId/tasks`
  - body: `title, description?, assignedTo?, priority?, dueDate?` (status starts as `todo`)
- `GET /tasks/projects/:projectId/tasks`
  - query: `status, assignedTo, priority, search, page, limit`
- `PATCH /tasks/:taskId/status`
  - body: `status` where status ∈ `todo | in_progress | done | cancelled`
- `PUT /tasks/:taskId`
  - body: any of `title, description, status, priority, assignedTo, dueDate`

## Tiny cURL examples

Tenant admin login:
```bash
curl -s http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Demo@123","tenantSubdomain":"demo"}'
```

Update task status:
```bash
curl -s -X PATCH http://localhost:5000/api/tasks/<taskId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"done"}'
```
