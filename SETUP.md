# Multi-Tenant SaaS Platform - Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Ports 3000, 5000, and 5432 available

### Running the Application

1. **Start all services:**
```bash
docker compose up -d
```

2. **Verify services are running:**
```bash
docker compose ps
```

All three services should show as "healthy" or "Up":
- `database` - PostgreSQL database (port 5432)
- `backend` - Node.js API server (port 5000)
- `frontend` - React application (port 3000)

3. **Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Stop the Application

```bash
docker compose down
```

To stop and remove all data (including database):
```bash
docker compose down -v
```

## Test Credentials

### Super Admin
- **Email:** superadmin@system.com
- **Password:** Admin@123
- **Access:** All tenants and system management

### Demo Company Tenant
- **Subdomain:** demo
- **Subscription:** Pro plan
- **Admin:**
  - Email: admin@demo.com
  - Password: Demo@123
- **Users:**
  - user1@demo.com / User@123 (User One)
  - user2@demo.com / User@123 (User Two)

### TechStart Inc Tenant
- **Subdomain:** techstart
- **Subscription:** Free plan
- **Admin:**
  - Email: admin@techstart.com
  - Password: Tech@123
- **Users:**
  - dev@techstart.com / Dev@123 (Mike Chen)

## Automatic Database Setup

On first startup, the backend automatically:
1. **Runs migrations** - Creates all database tables and indexes
2. **Seeds data** - Populates with test users, tenants, projects, and tasks
3. **Starts server** - Begins serving API requests

All migrations are idempotent and can be safely re-run.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration

### Health Check
- `GET /api/health` - Server and database status

### Protected Routes (requires JWT token)
- `GET /api/tenants` - List tenants (super admin only)
- `GET /api/projects` - List projects for tenant
- `GET /api/tasks` - List tasks for tenant
- `GET /api/users` - List users for tenant

## Troubleshooting

### Services won't start
```bash
# Check logs for specific service
docker compose logs backend
docker compose logs database
docker compose logs frontend

# Restart specific service
docker compose restart backend
```

### Database connection issues
```bash
# Check database is healthy
docker compose ps database

# View database logs
docker compose logs database

# Reset database
docker compose down -v
docker compose up -d
```

### Port conflicts
If ports 3000, 5000, or 5432 are already in use:
1. Stop conflicting services
2. Or modify port mappings in `docker-compose.yml`

### Clear all data and restart fresh
```bash
docker compose down -v
docker compose up -d
```

## Development

### View live logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### Rebuild after code changes
```bash
# Rebuild specific service
docker compose up -d --build backend

# Rebuild all services
docker compose up -d --build
```

### Access database directly
```bash
docker exec -it database psql -U postgres -d saas_db
```

## Architecture

- **Frontend:** React 18 with React Router and Axios
- **Backend:** Node.js 18 with Express 4
- **Database:** PostgreSQL 15
- **Authentication:** JWT-based with bcrypt password hashing
- **Containerization:** Docker with multi-stage builds

## Files and Structure

```
├── backend/
│   ├── src/              # Application code
│   ├── scripts/          # Database initialization
│   ├── migrations/       # SQL migration files
│   ├── Dockerfile        # Backend container config
│   └── entrypoint.sh     # Startup script
├── frontend/
│   ├── src/              # React application code
│   ├── public/           # Static assets
│   └── Dockerfile        # Frontend container config
├── docs/                 # Project documentation
├── docker-compose.yml    # Service orchestration
├── submission.json       # Test credentials reference
└── README.md            # Project overview
```

## Additional Resources

- **API Documentation:** See `docs/API.md`
- **Architecture Details:** See `docs/architecture.md`
- **Technical Specification:** See `docs/technical-spec.md`
