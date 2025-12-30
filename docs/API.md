# API Documentation

Base URL: `http://localhost:5000/api` (configurable via `VITE_API_URL`). All JSON responses follow `{ success, message?, data }`. Authenticated routes require `Authorization: Bearer <jwt>`.

## Health
- `GET /health` — returns `{ status, database, timestamp }` for readiness checks.

## Auth
- `POST /auth/register-tenant`
	- Body: `{ tenantName, subdomain, adminEmail, adminPassword, adminFullName }`
	- Response `201`: `{ tenantId, subdomain, adminUser }`
- `POST /auth/login`
	- Body: `{ email, password, tenantSubdomain?, tenantId? }`
	- Response: `{ user: { id, email, fullName, role, tenantId }, token, expiresIn }`
- `GET /auth/me` — returns current user and tenant summary.
- `POST /auth/logout` — audit log only; client should drop token.

## Tenants (super_admin unless noted)
- `GET /tenants` — list tenants with optional `status`, `subscriptionPlan`, `page`, `limit`.
- `GET /tenants/:tenantId` — super_admin or the tenant’s own admin; returns tenant stats (users/projects/tasks).
- `PUT /tenants/:tenantId`
	- Super admin: may update name/status/subscriptionPlan/maxUsers/maxProjects.
	- Tenant admin: may update `name` only.

## Users (tenant scoped)
- `POST /tenants/:tenantId/users` (super_admin or tenant_admin)
	- Body: `{ email, password, fullName, role?('user'|'tenant_admin') }`
	- Enforces user limit; response `201` returns created user summary.
- `GET /tenants/:tenantId/users?search&role&page&limit` — list users with pagination.
- `PUT /users/:userId` (self can edit name; tenant_admin/super_admin can change role/active)
	- Body: any of `{ fullName, role, isActive }`.
- `DELETE /users/:userId` (tenant_admin/super_admin; cannot delete self) — unassigns tasks then deletes user.

## Projects (tenant scoped)
- `POST /projects` — create project within caller’s tenant; enforces project limit.
	- Body: `{ name, description?, status?('active'|'archived'|'completed') }`
- `GET /projects?status&search&page&limit&tenantId(super_admin)` — list projects with task counts.
- `GET /projects/:projectId` — project detail.
- `PUT /projects/:projectId` — update `name`, `description`, `status` (tenant_admin or creator, or super_admin).
- `DELETE /projects/:projectId` — same permissions; cascades delete tasks.

## Tasks (tenant scoped via project)
- `POST /projects/:projectId/tasks`
	- Body: `{ title, description?, assignedTo?, priority?('low'|'medium'|'high'), dueDate? }`
- `GET /projects/:projectId/tasks?status&assignedTo&priority&search&page&limit` — list tasks with assignee info.
- `PATCH /tasks/:taskId/status` — Body: `{ status: 'todo'|'in_progress'|'completed' }` (any tenant user).
- `PUT /tasks/:taskId` — update title/description/status/priority/assignedTo/dueDate.

## Common error responses
- `401` `{ success:false, message:'Authentication token missing' | 'Invalid or expired token' }`
- `403` `{ success:false, message:'Forbidden' | 'Subscription ... limit reached' }`
- `404` `{ success:false, message:'... not found' }`
- Validation errors: `400` `{ success:false, message:'Validation failed', data:{ errors:[...] } }`

## Example login then list projects
1) `POST /auth/login`
```json
{
	"email": "admin@demo.com",
	"password": "Demo@123",
	"tenantSubdomain": "demo"
}
```
Response
```json
{
	"success": true,
	"data": {
		"user": {
			"id": "2222...",
			"email": "admin@demo.com",
			"fullName": "Demo Admin",
			"role": "tenant_admin",
			"tenantId": "1111..."
		},
		"token": "<jwt>",
		"expiresIn": 86400
	}
}
```
2) `GET /projects` with header `Authorization: Bearer <jwt>` → returns paginated projects with `taskCount` and `completedTaskCount`.
