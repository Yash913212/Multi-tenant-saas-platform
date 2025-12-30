# Technical Specification

## Repository layout
- `backend/`: Express API, migrations, seeds, scripts, Dockerfile.
- `frontend/`: Vite + React SPA, Axios client, routing, shared styles, Dockerfile.
- `docs/`: research, PRD, architecture, technical spec, API docs.
- `docker-compose.yml`: spins up Postgres, backend, and frontend.

## Tech stack
- **Backend**: Node.js, Express, PostgreSQL, JWT auth, express-validator, helmet/cors/morgan, uuid, bcrypt.
- **Frontend**: React 18, React Router 6, Axios, Vite build tool.
- **Infra**: Docker/Compose, dotenv for config, Postgres official image.

## Environment variables
- Backend (`backend/.env` or Docker Compose env):
	- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
	- `JWT_SECRET`, `JWT_EXPIRES_IN`
	- `PORT` (default 5000), `NODE_ENV`
	- `FRONTEND_URL` (CORS allowlist, default http://localhost:3000)
- Frontend (`frontend/.env`):
	- `VITE_API_URL` (default http://localhost:5000/api)

## Setup & run (Docker)
1. Install Docker + Docker Compose.
2. From repo root: `docker-compose up -d`.
3. Services: frontend `http://localhost:3000`, backend `http://localhost:5000/api`, health `http://localhost:5000/api/health`, Postgres `localhost:5432`.
4. Seed credentials: super admin `superadmin@system.com` / `Admin@123`; tenant admin `admin@demo.com` / `Demo@123` (subdomain `demo`).

## Setup & run (local dev)
1. Start Postgres locally (match `.env.example`).
2. Backend: `cd backend && npm install && npm run migrate && npm run seed && npm run dev` (uses nodemon).
3. Frontend: `cd frontend && npm install && npm run dev` (runs on port 3000).

## Database migrations & seeds
- Migrations live in `backend/migrations/*.sql`; run with `npm run migrate`.
- Seeds live in `backend/seeds/seed_data.sql`; run with `npm run seed`.
- `npm run init` executes migrations + seeds then boots the server.

## API conventions
- Base URL: `${VITE_API_URL}` (default `http://localhost:5000/api`).
- Auth: `Authorization: Bearer <jwt>`; JWT expires in 24h by default.
- Responses: `{ success: boolean, message?: string, data?: any }`.
- Pagination: `page`, `limit` query params; list endpoints cap `limit` to 100.
- Tenant scoping: all domain routes require JWT; server derives `tenantId` from token or query when allowed (super admin only).

## Testing & linting
- No automated tests yet; recommended to add API smoke tests (super admin and tenant admin flows) and UI happy-path checks.
- Use Postman/Thunder Client against `docker-compose` stack for quick verification.
