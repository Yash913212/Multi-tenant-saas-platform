# Architecture

## High-level
- **Frontend** (React + Vite) calls the backend API.
- **Backend** (Node/Express) enforces auth, RBAC, and tenant isolation.
- **Database** (PostgreSQL) stores all tenant-scoped entities.

See diagrams:
- Required PNGs:
	- `docs/images/system-architecture.png`
	- `docs/images/database-erd.png`
- Source SVGs (higher fidelity for zooming):
	- `docs/images/architecture.svg`
	- `docs/images/er-diagram.svg`

## API endpoint list (summary)

Base path: `/api`

Health
- `GET /health`

Auth
- `POST /auth/register-tenant`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Tenants (super_admin scoped)
- `GET /tenants`
- `GET /tenants/:tenantId`
- `PUT /tenants/:tenantId`

Users
- `POST /users/:tenantId/users`
- `GET /users/:tenantId/users`
- `PUT /users/:userId`
- `DELETE /users/:userId`

Projects
- `POST /projects`
- `GET /projects`
- `PUT /projects/:projectId`
- `DELETE /projects/:projectId`

Tasks
- `POST /tasks/projects/:projectId/tasks`
- `GET /tasks/projects/:projectId/tasks`
- `PATCH /tasks/:taskId/status`
- `PUT /tasks/:taskId`

## Request flow
1. User logs in and receives a JWT.
2. Frontend stores token and sends `Authorization: Bearer <token>`.
3. Backend verifies token and scopes queries by `tenant_id` (except super_admin).

## Tenancy model
- `users.tenant_id` is NULL for super_admin.
- `tenants.id` identifies an organization.
- `projects.tenant_id`, `tasks.tenant_id` ensure scoping.

## Initialization
On backend container startup:
- Ensure required Postgres extensions.
- Apply SQL migrations.
- Run idempotent seed script.
- Mark `/api/health` as ready only after completion.
