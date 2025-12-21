# Technical Specification
## Multi-Tenant SaaS Platform - Implementation Guide

---

## 1. Project Structure

### Backend Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection & pool configuration
│   │   └── environment.js       # Environment variables validation
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & extraction
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── cors.js              # CORS configuration
│   │   └── validation.js        # Input validation middleware
│   ├── controllers/
│   │   ├── authController.js    # Login, register-tenant, logout, get-me
│   │   ├── tenantController.js  # Tenant CRUD operations
│   │   ├── userController.js    # User management
│   │   ├── projectController.js # Project CRUD operations
│   │   ├── taskController.js    # Task CRUD operations
│   │   └── healthController.js  # Health check endpoint
│   ├── services/
│   │   ├── authService.js       # JWT generation, password hashing
│   │   ├── tenantService.js     # Tenant business logic
│   │   ├── userService.js       # User business logic
│   │   ├── projectService.js    # Project business logic
│   │   ├── taskService.js       # Task business logic
│   │   └── auditService.js      # Audit logging
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── tenants.js           # Tenant endpoints
│   │   ├── users.js             # User endpoints
│   │   ├── projects.js          # Project endpoints
│   │   ├── tasks.js             # Task endpoints
│   │   └── health.js            # Health check endpoint
│   ├── utils/
│   │   ├── database.js          # Database query helpers
│   │   ├── validators.js        # Input validation schemas
│   │   ├── errors.js            # Custom error classes
│   │   └── response.js          # Response formatting helpers
│   ├── migrations/
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_projects.sql
│   │   ├── 004_create_tasks.sql
│   │   ├── 005_create_audit_logs.sql
│   │   └── 006_create_sessions.sql (optional)
│   └── app.js                    # Express app setup
├── seeds/
│   └── seed.js                   # Database seed script
├── scripts/
│   └── init-db.js                # Database initialization script
├── .env                          # Environment variables (test/dev values)
├── .env.example                  # Template for environment variables
├── .gitignore
├── package.json
├── Dockerfile
└── README.md
```

### Frontend Project Structure

```
frontend/
├── public/
│   ├── index.html               # Main HTML file
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx       # Navigation bar with user menu
│   │   │   └── ProtectedRoute.jsx  # Protected route wrapper
│   │   ├── Auth/
│   │   │   ├── RegisterForm.jsx # Tenant registration form
│   │   │   └── LoginForm.jsx    # User login form
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx    # Dashboard page with stats
│   │   │   └── StatsCard.jsx    # Reusable stats card
│   │   ├── Projects/
│   │   │   ├── ProjectsList.jsx # List of projects
│   │   │   ├── ProjectCard.jsx  # Project display card
│   │   │   ├── ProjectForm.jsx  # Create/edit project form
│   │   │   ├── ProjectDetails.jsx # Project details page
│   │   │   ├── TaskCard.jsx     # Task display card
│   │   │   └── TaskForm.jsx     # Create/edit task form
│   │   └── Users/
│   │       ├── UsersList.jsx    # List of tenant users
│   │       ├── UserRow.jsx      # User table row
│   │       └── UserForm.jsx     # Add/edit user form
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── services/
│   │   └── api.js               # Axios instance with interceptors
│   ├── pages/
│   │   ├── Register.jsx         # Registration page
│   │   ├── Login.jsx            # Login page
│   │   ├── Dashboard.jsx        # Dashboard page
│   │   ├── Projects.jsx         # Projects list page
│   │   ├── ProjectDetails.jsx   # Project details page
│   │   └── Users.jsx            # Users management page
│   ├── hooks/
│   │   └── useAuth.jsx          # Custom hook for auth context
│   ├── styles/
│   │   └── index.css            # Global styles
│   ├── utils/
│   │   ├── constants.js         # API endpoints, roles, etc.
│   │   └── helpers.js           # Utility functions
│   ├── App.jsx                  # Main app component
│   ├── App.css
│   └── index.js
├── package.json
├── Dockerfile
├── .gitignore
└── README.md
```

### Database Project Structure

```
database/
├── migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_users.sql
│   ├── 003_create_projects.sql
│   ├── 004_create_tasks.sql
│   ├── 005_create_audit_logs.sql
│   └── 006_create_sessions.sql (optional)
└── seeds/
    └── seed_data.sql            # Initial data for testing
```

---

## 2. Development Setup Guide

### Prerequisites

**Required Software:**
- Node.js 16+ (https://nodejs.org/)
  - Verify: `node --version` should show v16.0.0 or higher
- PostgreSQL 13+ (https://www.postgresql.org/download/)
  - Verify: `psql --version` should show version 13+
- npm 7+ (comes with Node.js)
  - Verify: `npm --version` should show 7.0.0+
- Git (https://git-scm.com/)
- Docker & Docker Compose (optional, for containerized development)

**System Requirements:**
- 4GB RAM minimum
- 2GB free disk space
- macOS, Linux, or Windows (WSL2 recommended on Windows)

### Local Installation & Setup

#### Step 1: Clone Repository
```bash
cd /path/to/development/directory
git clone <repository-url> multi-tenant-saas
cd multi-tenant-saas
```

#### Step 2: Database Setup
```bash
# Create PostgreSQL database
createdb saas_db

# Or using psql
psql
psql=# CREATE DATABASE saas_db;
psql=# \q
```

#### Step 3: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Run migrations
npm run migrate

# Seed database with test data
npm run seed

# Start backend server
npm start
# Server runs on http://localhost:5000
```

#### Step 4: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
# Application runs on http://localhost:3000
# Automatically opens browser
```

#### Step 5: Verify Installation
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health
- Login with credentials from seed data (e.g., admin@demo.com / Demo@123)

---

## 3. Environment Variables

### Backend .env File Template

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-must-be-at-least-32-characters-long

### Docker Service Names and Fixed Ports (Mandatory)

All services are defined with fixed, public ports for evaluation:

- Database service: `database`
  - Ports: `5432` external → `5432` internal
  - Volume: `db_data:/var/lib/postgresql/data`
- Backend service: `backend`
  - Ports: `5000` external → `5000` internal
  - Healthcheck: `GET http://localhost:5000/api/health`
- Frontend service: `frontend`
  - Ports: `3000` external → `3000` internal
  - Environment: `REACT_APP_API_URL=http://backend:5000/api`

Network: `saas_network` (bridge)

JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Logging
LOG_LEVEL=debug

# Optional: Email Configuration (for future use)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Docker Environment Variables

In `docker-compose.yml`:
```yaml
environment:
  DB_HOST: database              # Use service name, not localhost
  DB_PORT: 5432
  DB_NAME: saas_db
  DB_USER: postgres
  DB_PASSWORD: postgres
  PORT: 5000
  NODE_ENV: production
  JWT_SECRET: your-secret-key-here
  JWT_EXPIRES_IN: 24h
  FRONTEND_URL: http://frontend:3000  # Use service name
```

---

## 4. Database Migrations

### Running Migrations

**Automatically (via backend startup):**
```javascript
// In backend app.js
const initDb = require('./scripts/init-db');
initDb().then(() => {
  app.listen(PORT, () => console.log('Server running...'));
});
```

**Manually:**
```bash
cd backend
npm run migrate
```

### Migration Files Structure

Each migration file (`XXXXX_description.sql`) contains:
```sql
-- Up migration (CREATE tables, add columns, create indexes)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  subscription_plan VARCHAR(20) DEFAULT 'free',
  max_users INTEGER DEFAULT 5,
  max_projects INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
```

---

## 5. Testing Guide

### Unit Testing (Optional but Recommended)

**Setup Jest:**
```bash
npm install --save-dev jest supertest
```

**Example test file (`src/tests/auth.test.js`):**
```javascript
const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  test('POST /api/auth/login should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
        tenantSubdomain: 'demo'
      });
    expect(res.statusCode).toBe(401);
  });
});
```

**Run tests:**
```bash
npm test
```

### Manual API Testing

**Using curl:**
```bash
# Register new tenant
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "subdomain": "test",
    "adminEmail": "admin@test.com",
    "adminPassword": "Test@123",
    "adminFullName": "Test Admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test@123",
    "tenantSubdomain": "test"
  }'
```

**Using Postman:**
1. Import API documentation
2. Set variables: `base_url`, `token`
3. Execute requests in sequence
4. Verify responses match specifications

---

## 6. Building for Production

### Backend Production Build

```bash
cd backend

# Optimize dependencies
npm ci  # Instead of npm install

# Build (if using TypeScript)
npm run build

# Start in production mode
NODE_ENV=production npm start
```

### Frontend Production Build

```bash
cd frontend

# Create optimized production build
npm run build

# Build output in build/ directory
# Ready to serve with web server (nginx, Apache, etc.)

# Or run with Node.js server
npm install -g serve
serve -s build -l 3000
```

---

## 7. Deployment with Docker

### Build Docker Images

```bash
# From repository root

# Build backend image
docker build -t saas-backend ./backend

# Build frontend image
docker build -t saas-frontend ./frontend

# Run docker-compose
docker-compose up -d
```

### Verify Deployment

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Access health check
curl http://localhost:5000/api/health

# Access frontend
open http://localhost:3000
```

### Health Check Monitoring
- Backend exposes `GET /api/health` with `status`, `database`, `timestamp`, `uptime`, `version`, and `env`
- Docker healthcheck polls the endpoint and restarts on failure (unless-stopped policy)
- Access locally: `http://localhost:5000/api/health`

### Troubleshooting Docker

```bash
# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f database

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
```

---

## 8. Common Commands

### Backend Commands
```bash
npm start              # Start development server
npm run migrate        # Run database migrations
npm run seed          # Seed database with test data
npm test              # Run tests
npm run lint          # Check code style
npm run build         # Build for production
```

### Frontend Commands
```bash
npm start             # Start development server (auto-open browser)
npm run build         # Create production build
npm test              # Run tests
npm run eject         # Eject from Create React App (irreversible)
```

### Database Commands
```bash
psql -U postgres saas_db              # Connect to database
\dt                                   # List all tables
\d table_name                        # Describe table
SELECT * FROM users;                 # Query users
\c saas_db                           # Switch database
\q                                    # Exit psql
```

---

## 9. Troubleshooting Guide

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Problem: "Database connection refused"
**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Check connection
psql -U postgres
```

### Problem: "CORS error in browser"
**Solution:**
- Verify `FRONTEND_URL` environment variable
- Check CORS middleware is applied before routes
- Ensure frontend URL matches exactly (no trailing slash)

### Problem: "Cannot find module 'jsonwebtoken'"
**Solution:**
```bash
cd backend
npm install
npm start
```

### Problem: "Jest cannot find test files"
**Solution:**
```bash
# Ensure tests follow naming convention
src/tests/**.test.js  or  src/**.test.js

# Run with specific pattern
npm test -- --testPathPattern=auth
```

---

## 10. Performance Optimization Checklist

- [ ] Database indexes created on tenant_id columns
- [ ] Connection pooling configured in backend
- [ ] Pagination implemented for list endpoints (max 100 items)
- [ ] Unused dependencies removed from package.json
- [ ] Frontend bundle optimized (npm run build)
- [ ] Caching headers configured (for static assets)
- [ ] Compression middleware enabled (gzip)
- [ ] Database queries optimized (no N+1 queries)
- [ ] Docker images built in multi-stage format (optional)
- [ ] Health check endpoints responding < 100ms

---

## 11. Security Checklist

- [ ] All passwords hashed with bcrypt (10+ salt rounds)
- [ ] JWT tokens have 24-hour expiration
- [ ] All environment variables use .env file (not in code)
- [ ] CORS configured to allow frontend URL only
- [ ] SQL injection prevented with parameterized queries
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented (optional but recommended)
- [ ] HTTPS configured in production
- [ ] Database backups scheduled
- [ ] Audit logs configured and tested
- [ ] Super admin users have tenant_id = NULL
- [ ] Email uniqueness enforced per-tenant only
- [ ] Authentication required for all endpoints except /register and /login
- [ ] Role-based authorization checked on protected endpoints

---

## 12. Monitoring & Logging

### Backend Logging
```javascript
// Simple console logging
console.log('User registered:', userId);
console.error('Database connection failed:', error);

// Or use logging library (winston, bunyan, etc.)
const logger = require('./config/logger');
logger.info('Server started on port 5000');
logger.error('Migration failed', { error });
```

### Application Monitoring
```bash
# Monitor resource usage
docker-compose stats

# View container logs in real-time
docker-compose logs -f backend

# Check database connections
psql -U postgres saas_db
# SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Technical Team
