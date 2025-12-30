# Product Requirements Document (PRD)

## User personas
- **Super Admin**: manages platform tenants, toggles plans/status, views all; goals: uptime, compliance, fast onboarding; pains: noisy neighbors, broken migrations.
- **Tenant Admin**: owns one org; manages users/projects/tasks and settings; goals: quick setup, enforce limits, clear audit; pains: accidental cross-tenant leakage, slow UI.
- **End User**: collaborates on projects/tasks; goals: clear tasks, minimal friction; pains: cluttered UI, auth issues.

## Functional requirements (FR)
- FR-001 The system shall allow tenant registration with unique subdomain.
- FR-002 The system shall enforce subscription plan limits on users and projects.
- FR-003 The system shall isolate tenant data via tenant_id on every record.
- FR-004 The system shall support roles: super_admin, tenant_admin, user.
- FR-005 The system shall provide JWT-based authentication with 24h expiry.
- FR-006 The system shall let users login with email, password, and tenant subdomain.
- FR-007 The system shall allow super_admin to list all tenants with filters and pagination.
- FR-008 The system shall allow tenant_admin to view and update own tenant name.
- FR-009 The system shall allow super_admin to update tenant status/plan/limits.
- FR-010 The system shall allow tenant_admin to create users within limits.
- FR-011 The system shall allow tenant_admin and super_admin to delete users (not self for tenant_admin).
- FR-012 The system shall list users of a tenant with search/filter/pagination.
- FR-013 The system shall allow creating projects scoped to tenant within limits.
- FR-014 The system shall list projects with search/filter/pagination and task counts.
- FR-015 The system shall allow updating and deleting projects by creator or tenant_admin.
- FR-016 The system shall allow creating tasks under a project with optional assignee.
- FR-017 The system shall list tasks with filters (status, assignee, priority, search).
- FR-018 The system shall allow updating task status by any tenant user.
- FR-019 The system shall allow full task updates (title, description, priority, assignedTo, dueDate).

## Non-functional requirements (NFR)
- NFR-001 Availability: 99% uptime target for services (dockerized stack).
- NFR-002 Performance: API p95 under 300ms for common queries at small scale.
- NFR-003 Security: All passwords hashed with bcrypt; JWT expiry 24h; CORS restricted to configured origin.
- NFR-004 Scalability: Support at least 100 concurrent users per tenant; DB indexed on tenant_id.
- NFR-005 Usability: Responsive UI for desktop/mobile with protected routes and clear error states.
