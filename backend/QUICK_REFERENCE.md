# Quick Reference Guide

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup database (PostgreSQL must be running)
createdb saas_db
npm run init-db

# 3. Start server
npm start

# 4. Test
curl http://localhost:3000/api/health
```

## 🔑 Authentication

Every request except `/health`, `/register`, `/login` requires:
```
Authorization: Bearer <jwt_token>
```

### Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123"
  }'
```

Response includes `data.token` - use this for all authenticated requests.

## 📋 19 Endpoints Overview

| # | Method | Endpoint | Auth | Role |
|---|--------|----------|------|------|
| 1 | GET | `/api/health` | ❌ | - |
| 2 | POST | `/api/auth/register` | ❌ | - |
| 3 | POST | `/api/auth/login` | ❌ | - |
| 4 | POST | `/api/tenants` | ✅ | super_admin |
| 5 | GET | `/api/tenants/:id` | ✅ | all |
| 6 | PATCH | `/api/tenants/:id` | ✅ | super_admin |
| 7 | POST | `/api/users` | ✅ | tenant_admin |
| 8 | GET | `/api/users` | ✅ | all |
| 9 | GET | `/api/users/:id` | ✅ | all |
| 10 | PATCH | `/api/users/:id` | ✅ | self/admin |
| 11 | DELETE | `/api/users/:id` | ✅ | tenant_admin |
| 12 | POST | `/api/projects` | ✅ | all |
| 13 | GET | `/api/projects` | ✅ | all |
| 14 | GET | `/api/projects/:id` | ✅ | all |
| 15 | PATCH | `/api/projects/:id` | ✅ | all |
| 16 | DELETE | `/api/projects/:id` | ✅ | all |
| 17 | POST | `/api/tasks` | ✅ | all |
| 18 | GET | `/api/tasks` | ✅ | all |
| 19 | GET | `/api/tasks/:id` | ✅ | all |
| + | PATCH | `/api/tasks/:id` | ✅ | all |
| + | DELETE | `/api/tasks/:id` | ✅ | all |

## 🧪 Test Examples

### 1. Health Check
```bash
curl http://localhost:3000/api/health
# {status: "ok", database: "connected", timestamp: "..."}
```

### 2. Register & Get Token
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcompany@example.com",
    "password": "Password123",
    "full_name": "New Company",
    "subdomain": "newco"
  }'

# Save the token from response
export TOKEN='<token_from_response>'
```

### 3. Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'
```

### 4. Create Task
```bash
# First get project ID from previous response
export PROJECT_ID='<project_id>'

curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "'$PROJECT_ID'",
    "title": "Task Title",
    "priority": "high",
    "description": "Task description"
  }'
```

### 5. Update Task
```bash
export TASK_ID='<task_id>'

curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "urgent"
  }'
```

### 6. List All Tasks
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Filter by project
curl http://localhost:3000/api/tasks?project_id=$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Pagination
curl "http://localhost:3000/api/tasks?limit=10&offset=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Create User (Admin)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teamlead@company.com",
    "password": "Password123",
    "full_name": "Team Lead",
    "role": "user"
  }'
```

## 📊 Response Examples

### Success Response (201)
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "My Project",
    "description": "Project description",
    "status": "active",
    "created_by": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Validation error",
  "data": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### Auth Error (401)
```json
{
  "success": false,
  "message": "Invalid token",
  "data": null
}
```

### Permission Error (403)
```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Project not found",
  "data": null
}
```

### Limit Exceeded (402)
```json
{
  "success": false,
  "message": "Maximum projects limit (5) reached for this tenant",
  "data": null
}
```

## 🔐 Default Credentials

| User | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@system.com` | `Admin@123` |
| Tenant Admin | `admin@demo.com` | `Demo@123` |
| User 1 | `user1@demo.com` | `User@123` |
| User 2 | `user2@demo.com` | `User@123` |

## 📁 Key Files

| File | Purpose |
|------|---------|
| `index.js` | Entry point - starts server |
| `src/app.js` | Express app configuration |
| `src/config/database.js` | PostgreSQL connection |
| `src/middleware/auth.js` | JWT verification |
| `scripts/init-db.js` | Database setup |
| `database/migrations/` | SQL migration files |
| `src/routes/` | API endpoints |
| `src/controllers/` | Business logic |
| `src/services/` | Data access layer |

## 🐛 Debugging

### Check Database Connection
```bash
# Server logs will show:
# ✓ Database connected
# Server running on http://localhost:3000
```

### View Database Contents
```bash
psql saas_db

# List tables
\dt

# Query users
SELECT id, email, role, tenant_id FROM users;

# Check audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC;
```

### Check Available Routes
```bash
grep -r "router\." src/routes/
```

### Test All Endpoints
Use Postman collection or equivalent:
1. Import `API_DOCUMENTATION.md` endpoints
2. Set authorization to Bearer token
3. Test each endpoint

## 🔧 Common Issues

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Start PostgreSQL
```bash
# Windows: Services > PostgreSQL > Start
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change PORT in .env or kill process
```bash
# Windows: netstat -ano | findstr :3000
# Linux: lsof -i :3000 | kill -9 <PID>
```

### Migration Failed
```
Error: relation "users" already exists
```
**Solution:** Drop database and reinit
```bash
dropdb saas_db
createdb saas_db
npm run init-db
```

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for:
- Complete endpoint specifications
- All request/response examples
- Database schema details
- Error codes and meanings
- Workflow examples

## 🚨 Production Checklist

Before deploying:
- [ ] Change JWT_SECRET in .env to strong value
- [ ] Change CORS_ORIGIN to production domain
- [ ] Set NODE_ENV=production
- [ ] Use production database credentials
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure database backups
- [ ] Add rate limiting
- [ ] Use environment-specific configs

## 💡 Tips

1. **Always include Authorization header** for authenticated endpoints
2. **Use UUIDs** for all IDs (auto-generated)
3. **Pagination:** Use limit and offset query params
4. **Filtering:** Check query params in endpoints
5. **Timestamps:** Use ISO 8601 format (automatic)
6. **Errors:** Check status code + message for details

