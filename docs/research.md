# Research & Requirements Analysis

> Word count target: 1700+ words. This document expands the earlier summary with deeper multi-tenancy analysis, technology choices, and security considerations.

## Multi-tenancy analysis

### Approaches compared

| Model | Isolation | Operational complexity | Cost efficiency | Migration story | Performance considerations | When it shines | Drawbacks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shared DB + **shared schema** (chosen) | Row-level (tenant_id on every table) | Low: single schema, single pool | High: one cluster | Simple: one set of DDLs | Needs careful indexing on tenant_id; risk of noisy neighbors | Early-stage SaaS, many small tenants, rapid iteration | Strong query discipline required; potential cross-tenant bugs if filters missed |
| Shared DB + **separate schema per tenant** | Schema-level | Medium/High: many schemas, pool management | Medium: fewer clusters, but more objects | Harder: fan-out DDL across schemas | Schema bloat; connection pool per schema needed for scale | Mid-size tenants needing stronger logical isolation | Migration blast radius; more deploy time; tooling complexity |
| **Separate DB per tenant** | DB-level, strongest | High: provision per tenant, backups per DB | Low for small tenants, high infra overhead | Hardest: orchestrate migrations across DB fleet | Connection churn; operational overhead dominates | Large enterprise tenants with strict isolation/SLA | Costly, slow onboarding, harder analytics across tenants |

We select **shared DB + shared schema** because:
- **Speed & cost**: one schema, one migration path, fastest to deliver and cheapest to run initially.
- **Operational simplicity**: single pool, straightforward backups, uniform observability.
- **Performance**: with `tenant_id` indexes, pagination, and query filters, small-to-mid workloads are efficient. Future scaling can add partitioning on `tenant_id`, connection pooling via pgbouncer, and read replicas.
- **Security posture**: strict API-layer tenant scoping plus DB constraints (FKs and composite uniques) reduce leakage risk.

Mitigations for noisy-neighbor risk and isolation bugs:
- Enforce `tenant_id` in middleware and controllers; do not accept client-supplied tenant_id except where role=super_admin.
- Add `tenant_id` indexes on all domain tables; consider partial indexes by status for hot paths.
- Keep migrations additive and safe; use transactions for DDL where supported.

### Data modeling choices
- Every domain table includes `tenant_id` (nullable only for super_admin rows in `users`).
- Composite unique constraints (tenant_id, email) on users to allow same email across tenants.
- FK cascades on tenants → users/projects/tasks/audit_logs; tasks reference project_id and tenant_id for double-check integrity.
- Audit logs include tenant_id to preserve isolation in observability.

### Tenant lifecycle
- **Creation**: POST /auth/register-tenant wraps tenant + admin user creation in a DB transaction; defaults to `free` limits from `plans.js`.
- **Status**: tenants can be `active`, `suspended`, `trial`; login and create flows reject suspended tenants.
- **Deletion (future work)**: would cascade through FK constraints; current scope retains tenants.

### Scaling roadmap (beyond MVP)
- Add Postgres partitioning by tenant_id for very large tenant counts.
- Introduce background job queue for heavy tasks (exports, bulk imports).
- Add Redis cache for frequent reads (plan metadata, feature flags).
- Implement per-tenant rate limiting at the API gateway.
- Introduce read replicas and connection pooling (pgbouncer) for bursty workloads.

## Technology stack justification

### Backend: Node.js + Express
- **Fit**: Lightweight, unopinionated, fast to iterate; rich middleware ecosystem (cors, helmet, express-validator) suits auth + validation quickly.
- **Alternatives considered**: NestJS (more structure, DI, decorators) but heavier for a small team; Fastify (faster baseline) but Express familiarity wins and performance is sufficient.

### Database: PostgreSQL
- **Fit**: Strong relational integrity, transactions, FK cascade support, powerful JSON/CTE support for flexible queries, good indexing capabilities, extensions (pgcrypto) if needed.
- **Alternatives**: MySQL (less CTE ergonomics), MongoDB (document-first but weaker relational guarantees for RBAC), separate-schema approach (added operational drag).

### Frontend: React + Vite
- **Fit**: React 18 for component model, Vite for fast dev server and lean build; simple env handling (`VITE_API_URL`), easy containerization.
- **Alternatives**: Next.js (SSR/SSG not required for this SPA), Vue (similar fit but team skills assumed React), CRA (slower builds).

### Authentication: JWT (24h expiry)
- **Fit**: Stateless, easy to verify in middleware; payload contains only `{ userId, tenantId, role }` to avoid sensitive data; aligns with Docker scaling (no session store needed).
- **Alternatives**: Server sessions + Redis (adds infra) or opaque tokens (more DB lookups) — deferred until needed for revocation lists.

### Containerization: Docker + docker-compose
- **Fit**: One-command bootstrap with fixed ports 5432/5000/3000; service discovery by name; healthchecks wired.
- **Alternatives**: Kubernetes (overkill here); Podman (similar but compose is simpler for evaluation).

### Supporting libraries
- **express-validator** for input validation
- **bcryptjs** for password hashing (10 rounds)
- **jsonwebtoken** for JWT signing/verification
- **helmet/morgan/cors** for security headers, logging, and CORS policy

## Security considerations (expanded)

### Data isolation & authorization
- Every query uses `tenant_id` scoping except when `role=super_admin`. Controllers check role plus tenant match. Tenant ID is derived from JWT, not trusted from body/query (except super_admin overrides for listing tenants).
- FK constraints and indexes enforce tenant ownership across projects, tasks, audit_logs.
- Composite uniques prevent duplicate emails within a tenant but allow reuse across tenants.

### Authentication & credential safety
- Passwords hashed with bcrypt; no plaintext stored.
- JWT secret pulled from env; expiry default 24h (`JWT_EXPIRES_IN`).
- Token payload minimal: `{userId, tenantId, role}`. No PII in token.

### Transport & CORS
- CORS origin limited to `FRONTEND_URL` (http://frontend:3000 in Docker). In local dev, can be localhost.
- HTTPS is recommended in deployment (TLS termination at proxy); not configured in local compose scope.

### Input validation & error handling
- `express-validator` enforces email formats, password length, enum values, and subdomain regex.
- Consistent response envelope `{ success, message, data }` avoids leaking stack traces; server logs retain details.

### Audit logging
- `audit_logs` records actor, tenant_id, entity, action, timestamp, ip_address for key events (login/logout, CRUD across tenants/users/projects/tasks).
- Supports future alerting and anomaly detection (e.g., suspicious super_admin activity).

### Subscription enforcement
- Middleware `enforceUserLimit` and `enforceProjectLimit` check current counts vs tenant limits before creates, returning 403 on exhaustion.

### Defense in depth / future hardening
- Add rate limiting per tenant/user to reduce abuse.
- Add account lockout / incremental backoff on failed logins.
- Add content security policy (CSP) via helmet config.
- Add rotating JWT secret and refresh tokens if session longevity becomes a need.

## Plan limits recap
- **free**: max_users=5, max_projects=3
- **pro**: max_users=25, max_projects=15
- **enterprise**: max_users=100, max_projects=50
- Enforced on create user/project; default plan for new tenants is `free`.

## Deployment & operations notes
- **Docker-first**: compose brings up database, backend, frontend with healthchecks. Backend entrypoint runs migrations and seeds automatically.
- **Ports**: 5432 database, 5000 backend, 3000 frontend (fixed per spec).
- **Service names**: `database`, `backend`, `frontend` for in-network DNS.
- **Env handling**: `.env.example` documents required vars; compose supplies dev values; committed `.env` (dev) is allowed for evaluation convenience.

## Testing strategy (current and future)
- Manual verification via seeded credentials: super admin and demo tenant admin/users.
- Health check: GET `/api/health` for readiness (DB connectivity).
- Future work: add API smoke tests (login, CRUD flows), Jest for controllers/services, and Playwright/Cypress for UI flows (login, list/create/edit project/task, user management).

## Risks and mitigations
- **Cross-tenant leakage**: mitigated by strict controller checks, `tenant_id` filters, FK constraints, and super_admin special-casing only where intended.
- **Noisy neighbor**: mitigated by indexes and plan limits; future partitioning and rate limits.
- **JWT secret exposure**: stored in env; advise rotation and separate prod secrets.
- **Migration mishaps**: additive migrations, transaction-wrapped where possible; single schema keeps complexity low.

## Summary
This stack balances delivery speed and operational simplicity with solid isolation practices. Shared DB/shared schema is the pragmatic default; combined with enforced tenant scoping, RBAC, audit logs, and plan limits, it meets the current SaaS requirements while leaving headroom for scaling via partitioning, caching, and connection pooling.
