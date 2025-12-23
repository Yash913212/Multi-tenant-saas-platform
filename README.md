# Multi-Tenant SaaS Platform (Projects & Tasks)

A simple, dockerized multi-tenant SaaS starter. Multiple organizations (tenants) can manage users, projects, and tasks.

This repo includes:
- strict tenant data isolation (via `tenant_id`)
- RBAC roles (`super_admin`, `tenant_admin`, `user`)
- subscription plan limits (max users/projects)
- automatic DB migrations + seed data on startup

## Run with Docker (recommended)

Start everything:

```powershell
cd "c:\Users\yaswa\OneDrive\Desktop\Multi-tenant-saas-platform"
docker-compose up -d
```

Open:
- Frontend UI: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Login credentials (seeded)

These are also recorded in `submission.json`.

- Super Admin (platform-wide)
  - `superadmin@system.com` / `Admin@123`

- Demo Tenant
  - subdomain: `demo`
  - Tenant Admin: `admin@demo.com` / `Demo@123`
  - Users: `user1@demo.com` / `User@123`, `user2@demo.com` / `User@123`

## Environment variables

Environment variables are provided in the committed `.env` (dev/test values).

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT`
- `FRONTEND_URL` (CORS)
- `VITE_API_URL` (frontend API base URL)

## API docs

See `docs/API.md` for the full endpoint documentation.

## Demo video

YouTube (Unlisted/Public, 5–12 minutes): **ADD_LINK_HERE**

## Notes

- Data isolation: the backend scopes tenant data using `tenant_id` from the JWT (except `super_admin`).
- DB init: the backend runs migrations + seed data automatically at startup.

## Diagrams

Required diagrams are under `docs/images/`:
- `system-architecture.png`
- `database-erd.png`

Source SVGs are also included for crisp zooming:
- `architecture.svg`
- `er-diagram.svg`
