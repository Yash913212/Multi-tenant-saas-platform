# Multi-Tenant SaaS Platform
## Project & Task Management System

A production-ready, multi-tenant SaaS application where multiple organizations can independently register, manage their teams, create projects, and track tasks. Built with Node.js/Express, React, PostgreSQL, and Docker.

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This multi-tenant SaaS platform enables organizations to:
- **Register** with unique subdomains for multi-tenancy
- **Manage Teams** with role-based access control (RBAC)
- **Create Projects** within subscription plan limits
- **Track Tasks** with status, priority, and assignments
- **Ensure Data Isolation** between tenants at database and application levels

The application demonstrates production-ready patterns for:
- Multi-tenancy architecture with row-level isolation
- JWT-based stateless authentication
- Database transactions and ACID compliance
- RESTful API design with proper error handling
- Docker containerization and orchestration

---

## Key Features

### 🔐 **Multi-Tenancy & Security**
- Complete data isolation between tenants
- Row-level security at the database and application layers
- JWT tokens with 24-hour expiration
- Bcrypt password hashing (10 salt rounds)
- Role-based access control (super_admin, tenant_admin, user)

### 👥 **Team Management**
- Tenant registration with unique subdomains
- User management with role assignment
- User invitation and team collaboration
- Subscription plan-based user limits

### 📋 **Project & Task Management**
- Create projects within subscription limits
- Comprehensive task management (create, read, update, delete)
- Task assignments and status tracking
- Task priorities and due dates
- Task filtering and search capabilities

### 📊 **Dashboard & Analytics**
- Overview statistics (projects, tasks, completion rates)
- Recent activity tracking
- Project and task filtering
- User-friendly dashboard

### 🏗️ **Architecture**
- Three-tier architecture (frontend, backend, database)
- Responsive design (mobile, tablet, desktop)
- Pagination for large datasets
- Comprehensive audit logging

### 🐳 **Containerization**
- Docker and Docker Compose setup
- Automatic database initialization
- Health check endpoints
- Production-ready configuration

---

## Technology Stack

### **Frontend**
- **React 18+** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

### **Backend**
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18+** - Web framework
- **PostgreSQL 13+** - Relational database
- **jsonwebtoken** - JWT generation/verification
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **pg** - PostgreSQL client

### **DevOps & Deployment**
- **Docker** - Container runtime
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control

### **Development Tools**
- **npm** - Package manager
- **Jest** - Testing framework (optional)
- **Postman** - API testing (optional)

---

## Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────┐
│         React Frontend (Port 3000)          │
│    ├─ Registration & Login Pages           │
│    ├─ Dashboard with Statistics            │
│    ├─ Project Management UI                │
│    ├─ Task Management UI                   │
│    └─ User Management (Admin)              │
└────────────────┬────────────────────────────┘
                 │ (HTTPS/REST)
                 ▼
┌─────────────────────────────────────────────┐
│      Express.js Backend (Port 5000)        │
│    ├─ Authentication Module                │
│    ├─ Tenant Management                    │
│    ├─ User Management                      │
│    ├─ Project Management                   │
│    ├─ Task Management                      │
│    └─ Audit Logging                        │
└────────────────┬────────────────────────────┘
                 │ (TCP)
                 ▼
┌─────────────────────────────────────────────┐
│   PostgreSQL Database (Port 5432)          │
│    ├─ tenants table                        │
│    ├─ users table                          │
│    ├─ projects table                       │
│    ├─ tasks table                          │
│    └─ audit_logs table                     │
└─────────────────────────────────────────────┘
```

### **Data Isolation Strategy**

1. **Row-Level Isolation**: Each row has `tenant_id` column
2. **Application-Level Filtering**: JWT contains `tenantId`, all queries filtered by it
3. **Database Constraints**: Foreign keys and unique constraints enforce integrity
4. **Authorization Checks**: Role-based access control at endpoint level

---

## Prerequisites

### **Required Software**
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 13+** - [Download](https://www.postgresql.org/download/)
- **Docker & Docker Compose** (optional, for containerized setup) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

### **System Requirements**
- 4GB RAM minimum
- 2GB free disk space
- macOS, Linux, or Windows (WSL2 recommended)

### **Verification**
```bash
node --version          # Should be v16+
npm --version          # Should be v7+
psql --version         # Should be 13+
docker --version       # Should be 20.10+ (optional)
```

---

## Quick Start

### **Option 1: Local Development (Without Docker)**

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd multi-tenant-saas-platform
```

#### Step 2: Create PostgreSQL Database
```bash
# Using psql
psql -U postgres
psql=# CREATE DATABASE saas_db;
psql=# \q
```

#### Step 3: Setup Backend
```bash
cd backend
npm install

# Create and edit .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed data
npm run migrate
npm run seed

# Start backend server
npm start
# Backend runs on http://localhost:5000
```

#### Step 4: Setup Frontend
```bash
cd ../frontend
npm install

# Start frontend development server
npm start
# Frontend runs on http://localhost:3000
# Browser should open automatically
```

#### Step 5: Login
Use seed credentials:
- Email: `admin@demo.com`
- Password: `Demo@123`
- Subdomain: `demo`

---

### **Option 2: Docker Compose (Recommended)**

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd multi-tenant-saas-platform
```

#### Step 2: Start All Services
```bash
docker-compose up -d
```

This will:
- Create PostgreSQL database container
- Build and start backend API
- Build and start React frontend
- Run database migrations automatically
- Load seed data

#### Step 3: Wait for Health Check
```bash
# Check if services are healthy (wait max 1 minute)
docker-compose ps

# All services should show "Up"
```

#### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

#### Step 5: Login
```
Email: admin@demo.com
Password: Demo@123
Subdomain: demo
```

#### **Useful Docker Commands**
```bash
# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and reset database
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
```

---

## Project Structure

### **Backend**
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── app.js            # Express setup
├── scripts/              # Database scripts
├── migrations/           # Database migrations
├── .env                  # Environment variables
└── package.json
```

### **Frontend**
```
frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── context/          # Auth context
│   ├── services/         # API client
│   ├── utils/            # Utilities
│   ├── hooks/            # Custom hooks
│   └── App.jsx           # Main app
├── public/               # Static assets
└── package.json
```

### **Database**
```
database/
├── migrations/           # SQL migration files
└── seeds/               # Seed data
```

---

## Configuration

### **Environment Variables**

#### **Backend .env**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000
```

#### **Frontend .env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Deployment

### **Docker Deployment**

The application is fully containerized. Deploy with:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify health
curl http://localhost:5000/api/health
```

### **Production Considerations**

1. **Environment Variables**: Use production values, not test credentials
2. **HTTPS**: Enable HTTPS with Let's Encrypt or similar
3. **Database Backups**: Schedule regular PostgreSQL backups
4. **Monitoring**: Set up application and infrastructure monitoring
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Logging**: Centralize logs with ELK stack or similar

---

## API Documentation

Full API documentation is available in [docs/API.md](docs/API.md)

### **Quick Reference**

**Authentication**
```bash
# Register tenant
POST /api/auth/register-tenant

# Login
POST /api/auth/login

# Get current user
GET /api/auth/me

# Logout
POST /api/auth/logout
```

**Tenants**
```bash
GET /api/tenants/:tenantId        # Get tenant details
PUT /api/tenants/:tenantId        # Update tenant
GET /api/tenants                  # List all tenants (super_admin)
```

**Users**
```bash
POST /api/tenants/:tenantId/users      # Add user
GET /api/tenants/:tenantId/users       # List users
PUT /api/users/:userId                 # Update user
DELETE /api/users/:userId              # Delete user
```

**Projects**
```bash
POST /api/projects                # Create project
GET /api/projects                 # List projects
PUT /api/projects/:projectId      # Update project
DELETE /api/projects/:projectId   # Delete project
```

**Tasks**
```bash
POST /api/projects/:projectId/tasks           # Create task
GET /api/projects/:projectId/tasks            # List tasks
PUT /api/tasks/:taskId                        # Update task
PATCH /api/tasks/:taskId/status               # Update status
DELETE /api/tasks/:taskId                     # Delete task
```

**Health**
```bash
GET /api/health                   # Health check
```

---

## Database Schema

### **Tables**

**tenants**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `subdomain` (VARCHAR, UNIQUE)
- `status` (ENUM: active, suspended, trial)
- `subscription_plan` (ENUM: free, pro, enterprise)
- `max_users` (INTEGER)
- `max_projects` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**users**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants, NULL for super_admin)
- `email` (VARCHAR)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (ENUM: super_admin, tenant_admin, user)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- *Unique: (tenant_id, email)*

**projects**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants)
- `name` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: active, archived, completed)
- `created_by` (UUID, FK → users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**tasks**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects)
- `tenant_id` (UUID, FK → tenants)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: todo, in_progress, completed)
- `priority` (ENUM: low, medium, high)
- `assigned_to` (UUID, FK → users, nullable)
- `due_date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**audit_logs**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK → tenants)
- `user_id` (UUID, FK → users, nullable)
- `action` (VARCHAR)
- `entity_type` (VARCHAR)
- `entity_id` (VARCHAR)
- `ip_address` (VARCHAR)
- `created_at` (TIMESTAMP)

---

## Testing

### **Manual Testing with cURL**

```bash
# Register new tenant
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "My Company",
    "subdomain": "mycompany",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "SecurePass@123",
    "adminFullName": "John Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "SecurePass@123",
    "tenantSubdomain": "mycompany"
  }'

# Get current user (use token from login response)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {jwt_token}"
```

### **Postman Testing**

1. Import the API documentation from [docs/API.md](docs/API.md)
2. Set variables: `base_url`, `token`
3. Execute requests sequentially
4. Verify responses

---

## Troubleshooting

### **Port Already in Use**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### **Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Connect to database
psql -U postgres -d saas_db

# If not exists, create it
createdb saas_db
```

### **Frontend Can't Connect to Backend**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify FRONTEND_URL in .env

### **JWT Token Errors**
- Ensure JWT_SECRET is at least 32 characters
- Check token hasn't expired (24-hour expiry)
- Verify token format in Authorization header

### **Docker Issues**
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose down -v
docker-compose up -d
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style
- Add tests for new features
- Update documentation
- Use meaningful commit messages

---

## Security Considerations

### **Implemented Security Measures**
✅ JWT authentication with 24-hour expiry
✅ Bcrypt password hashing (10 salt rounds)
✅ CORS configured for frontend URL only
✅ SQL injection prevention (parameterized queries)
✅ Role-based access control
✅ Row-level data isolation
✅ Audit logging for compliance
✅ Environment variables for secrets

### **Production Checklist**
- [ ] Use HTTPS only
- [ ] Generate strong JWT_SECRET (32+ chars, random)
- [ ] Configure production database credentials
- [ ] Enable database backups
- [ ] Set up monitoring and alerting
- [ ] Implement rate limiting
- [ ] Use environment variables for all secrets
- [ ] Enable audit logging
- [ ] Test data isolation

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Support

For issues, questions, or suggestions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [API documentation](docs/API.md)
3. Check [Technical Specification](docs/technical-spec.md)
4. Open an issue on GitHub

---

## Roadmap

### **Planned Features**
- [ ] Email notifications
- [ ] Real-time collaboration
- [ ] File attachments on tasks
- [ ] Advanced analytics and reporting
- [ ] Slack integration
- [ ] Two-factor authentication
- [ ] SSO/OAuth support
- [ ] Dark mode

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
