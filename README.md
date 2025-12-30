# TaskNest (Multi-Tenant SaaS Platform)

TaskNest is a production-ready multi-tenant project & task management SaaS with RBAC, subscription limits, Dockerized services, and a responsive React frontend.

## Features
- Multi-tenant architecture (shared DB/shared schema) with strict tenant_id scoping
- JWT auth with roles: super_admin, tenant_admin, user
- Tenant registration with unique subdomain
- Subscription limits (free/pro/enterprise) enforced on users/projects
- Projects & tasks CRUD with filtering, pagination, and assignment
- User management (tenant admin) and tenant listing (super admin)
- Audit logging of key actions
- One-command Docker Compose bring-up (database, backend, frontend)

## Architecture overview
- **Frontend**: React + Vite SPA, Axios client, role-based UI.
- **Backend**: Node.js + Express, Postgres, JWT auth, express-validator, helmet/cors/morgan.
- **Database**: PostgreSQL with tenant_id on all domain tables; FK cascades; composite uniques on (tenant_id, email).
- **Containerization**: docker-compose services `database` (5432), `backend` (5000), `frontend` (3000); service discovery by name.

Diagrams (see `docs/images`):
- System architecture: `docs/images/system-architecture.png`
- Database ERD: `docs/images/database-erd.png`

## Tech stack (versions)
- Backend: Node 18, Express 4, PostgreSQL 15, JWT, bcryptjs, express-validator
- Frontend: React 18, Vite 5, React Router 6, Axios 1.6
- Ops: Docker, docker-compose

## Environment variables
- Backend (`backend/.env` or compose env):
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - JWT_SECRET, JWT_EXPIRES_IN (default 24h)
  - PORT (5000), NODE_ENV, FRONTEND_URL (http://frontend:3000 in Docker)
- Frontend (`frontend/.env`):
  - VITE_API_URL (default http://backend:5000/api in Docker, http://localhost:5000/api locally)

## Running with Docker (recommended)
Prereqs: Docker + Docker Compose installed.

From repo root:
1. `docker-compose up -d`
2. Wait for health: http://localhost:5000/api/health should return status ok.
3. Open frontend: http://localhost:3000

Ports (fixed): DB 5432, API 5000, Frontend 3000.

## Local development (optional)
- Start Postgres locally matching `.env.example`.
- Backend: `cd backend && npm install && npm run migrate && npm run seed && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`

## Seed credentials (also in `submission.json`)
- Super admin: `superadmin@system.com` / `Admin@123`
- Demo tenant admin: `admin@demo.com` / `Demo@123` (subdomain: `demo`)
- Demo users: `user1@demo.com`, `user2@demo.com` with password `User@123`

## API documentation
- See `docs/API.md` for the 19 endpoints, auth rules, and examples.
- Health check: `GET /api/health`

## Demo video
- Placeholder: add YouTube link here once recorded.

## Documentation set
- Research: `docs/research.md`
- PRD: `docs/PRD.md`
- Architecture: `docs/architecture.md` (diagrams in `docs/images`)
- Technical spec: `docs/technical-spec.md`
- API docs: `docs/API.md`

## Notes
- Backend migrations and seeds run automatically at container start via `scripts/init.js`.
- CORS origin comes from `FRONTEND_URL`; set to `http://frontend:3000` in Docker network.
