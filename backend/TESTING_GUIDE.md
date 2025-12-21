# Complete API Testing Guide

## Setup Before Testing

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (ensure it's running)

# 3. Initialize database
npm run init-db
# This creates all tables and loads default data

# 4. Start server
npm start
# Should show: "Server running on http://localhost:3000"
```

## Test All 19 Endpoints

### Testing Tools
- cURL (command line examples below)
- Postman (import endpoints)
- VS Code REST Client
- Thunder Client

---

## 1️⃣ HEALTH CHECK (No Auth Required)

### GET /api/health
```bash
curl http://localhost:3000/api/health
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 2️⃣ REGISTER & LOGIN

### POST /api/auth/register (Super Admin)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@newcompany.com",
    "password": "Admin@123",
    "full_name": "Company Admin"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "admin@newcompany.com",
      "full_name": "Company Admin",
      "role": "super_admin",
      "tenant_id": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save this token:**
```bash
export SA_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### POST /api/auth/register (New Tenant)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "Acme@123",
    "full_name": "ACME Admin",
    "subdomain": "acme"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "admin@acme.com",
      "full_name": "ACME Admin",
      "role": "tenant_admin",
      "tenant_id": "660e8400-..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenant": {
      "id": "660e8400-...",
      "name": "ACME Admin",
      "subdomain": "acme",
      "status": "active",
      "subscription_plan": "free",
      "max_users": 5,
      "max_projects": 5
    }
  }
}
```

**Save this token:**
```bash
export TENANT_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### POST /api/auth/login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "admin@demo.com",
      "full_name": "Demo Admin",
      "role": "tenant_admin",
      "tenant_id": "660e8400-..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save this token:**
```bash
export DEMO_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
export DEMO_TENANT_ID='660e8400-...'
```

---

## 3️⃣ TENANT ENDPOINTS

### POST /api/tenants (Super Admin Only)
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Authorization: Bearer $SA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "subdomain": "acme-corp",
    "subscription_plan": "pro",
    "max_users": 50,
    "max_projects": 20
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "id": "770e8400-...",
    "name": "Acme Corp",
    "subdomain": "acme-corp",
    "status": "active",
    "subscription_plan": "pro",
    "max_users": 50,
    "max_projects": 20,
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

**Save this ID:**
```bash
export NEW_TENANT_ID='770e8400-...'
```

### GET /api/tenants/:id
```bash
curl http://localhost:3000/api/tenants/$NEW_TENANT_ID \
  -H "Authorization: Bearer $SA_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": "770e8400-...",
    "name": "Acme Corp",
    "subdomain": "acme-corp",
    "status": "active",
    "subscription_plan": "pro",
    "max_users": 50,
    "max_projects": 20,
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

### PATCH /api/tenants/:id (Super Admin Only)
```bash
curl -X PATCH http://localhost:3000/api/tenants/$NEW_TENANT_ID \
  -H "Authorization: Bearer $SA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp Updated",
    "subscription_plan": "enterprise",
    "max_users": 100
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "770e8400-...",
    "name": "Acme Corp Updated",
    "status": "active",
    "subscription_plan": "enterprise",
    "max_users": 100,
    "max_projects": 20,
    "updated_at": "2025-12-21T10:31:00Z"
  }
}
```

---

## 4️⃣ USER ENDPOINTS

### POST /api/users (Tenant Admin)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@demo.com",
    "password": "Dev@123",
    "full_name": "Developer",
    "role": "user"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "880e8400-...",
    "tenant_id": "660e8400-...",
    "email": "developer@demo.com",
    "full_name": "Developer",
    "role": "user",
    "is_active": true,
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

**Save this ID:**
```bash
export NEW_USER_ID='880e8400-...'
```

### GET /api/users (List Users)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": "550e8400-...",
        "tenant_id": "660e8400-...",
        "email": "admin@demo.com",
        "full_name": "Demo Admin",
        "role": "tenant_admin",
        "is_active": true,
        "created_at": "2025-12-21T10:00:00Z",
        "updated_at": "2025-12-21T10:00:00Z"
      },
      {
        "id": "880e8400-...",
        "email": "developer@demo.com",
        "full_name": "Developer",
        "role": "user",
        "is_active": true
      }
    ],
    "total": 2,
    "limit": 100,
    "offset": 0
  }
}
```

### GET /api/users/:id
```bash
curl http://localhost:3000/api/users/$NEW_USER_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "880e8400-...",
    "tenant_id": "660e8400-...",
    "email": "developer@demo.com",
    "full_name": "Developer",
    "role": "user",
    "is_active": true,
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

### PATCH /api/users/:id
```bash
curl -X PATCH http://localhost:3000/api/users/$NEW_USER_ID \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Senior Developer",
    "role": "tenant_admin"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "880e8400-...",
    "email": "developer@demo.com",
    "full_name": "Senior Developer",
    "role": "tenant_admin",
    "is_active": true,
    "updated_at": "2025-12-21T10:31:00Z"
  }
}
```

### DELETE /api/users/:id
```bash
curl -X DELETE http://localhost:3000/api/users/$NEW_USER_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "880e8400-..."
  }
}
```

---

## 5️⃣ PROJECT ENDPOINTS

### POST /api/projects
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Development",
    "description": "Native iOS and Android app"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "990e8400-...",
    "tenant_id": "660e8400-...",
    "name": "Mobile App Development",
    "description": "Native iOS and Android app",
    "status": "active",
    "created_by": "550e8400-...",
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

**Save this ID:**
```bash
export PROJECT_ID='990e8400-...'
```

### GET /api/projects
```bash
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "data": [
      {
        "id": "990e8400-...",
        "tenant_id": "660e8400-...",
        "name": "Mobile App Development",
        "description": "Native iOS and Android app",
        "status": "active",
        "created_by": "550e8400-...",
        "created_at": "2025-12-21T10:30:00Z",
        "updated_at": "2025-12-21T10:30:00Z"
      }
    ],
    "total": 3,
    "limit": 100,
    "offset": 0
  }
}
```

### GET /api/projects/:id
```bash
curl http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "id": "990e8400-...",
    "tenant_id": "660e8400-...",
    "name": "Mobile App Development",
    "description": "Native iOS and Android app",
    "status": "active",
    "created_by": "550e8400-...",
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

### PATCH /api/projects/:id
```bash
curl -X PATCH http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App & Web Platform",
    "status": "active"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "990e8400-...",
    "name": "Mobile App & Web Platform",
    "status": "active",
    "updated_at": "2025-12-21T10:31:00Z"
  }
}
```

### DELETE /api/projects/:id
```bash
curl -X DELETE http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "id": "990e8400-..."
  }
}
```

---

## 6️⃣ TASK ENDPOINTS

### POST /api/tasks
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "'$PROJECT_ID'",
    "title": "Design UI mockups",
    "description": "Create wireframes and mockups for app",
    "priority": "high",
    "assigned_to": "550e8400-...",
    "due_date": "2025-12-31T17:00:00Z"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "aa0e8400-...",
    "project_id": "990e8400-...",
    "tenant_id": "660e8400-...",
    "title": "Design UI mockups",
    "description": "Create wireframes and mockups for app",
    "status": "todo",
    "priority": "high",
    "assigned_to": "550e8400-...",
    "due_date": "2025-12-31T17:00:00Z",
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

**Save this ID:**
```bash
export TASK_ID='aa0e8400-...'
```

### GET /api/tasks
```bash
curl "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "data": [
      {
        "id": "aa0e8400-...",
        "project_id": "990e8400-...",
        "title": "Design UI mockups",
        "status": "todo",
        "priority": "high",
        "created_at": "2025-12-21T10:30:00Z"
      }
    ],
    "total": 8,
    "limit": 100,
    "offset": 0
  }
}
```

### GET /api/tasks/:id
```bash
curl http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "aa0e8400-...",
    "project_id": "990e8400-...",
    "tenant_id": "660e8400-...",
    "title": "Design UI mockups",
    "description": "Create wireframes and mockups for app",
    "status": "todo",
    "priority": "high",
    "assigned_to": "550e8400-...",
    "due_date": "2025-12-31T17:00:00Z",
    "created_at": "2025-12-21T10:30:00Z",
    "updated_at": "2025-12-21T10:30:00Z"
  }
}
```

### PATCH /api/tasks/:id
```bash
curl -X PATCH http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "urgent"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "aa0e8400-...",
    "status": "in_progress",
    "priority": "urgent",
    "updated_at": "2025-12-21T10:31:00Z"
  }
}
```

### DELETE /api/tasks/:id
```bash
curl -X DELETE http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $DEMO_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": "aa0e8400-..."
  }
}
```

---

## ✅ Test Checklist

- [ ] Health check returns 200
- [ ] Register super admin works
- [ ] Register tenant works
- [ ] Login works and returns token
- [ ] Create tenant works (super admin only)
- [ ] Get tenant works
- [ ] Update tenant works (super admin only)
- [ ] Create user works
- [ ] List users works with pagination
- [ ] Get user works
- [ ] Update user works
- [ ] Delete user works
- [ ] Create project works
- [ ] List projects works
- [ ] Get project works
- [ ] Update project works
- [ ] Delete project works
- [ ] Create task works
- [ ] List tasks works with optional filtering
- [ ] Get task works
- [ ] Update task works
- [ ] Delete task works
- [ ] Tenant isolation works (can't access other tenant's data)
- [ ] Auth errors return 401
- [ ] Permission errors return 403
- [ ] Validation errors return 400 with details

---

## 🐛 Troubleshooting

### Invalid Token Error (401)
```json
{
  "success": false,
  "message": "Invalid token",
  "data": null
}
```
**Solution:** Ensure token is correctly copied and Authorization header is `Bearer <token>`

### Access Denied (403)
```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```
**Solution:** Check user role - may need higher permissions (e.g., tenant_admin)

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "data": [...]
}
```
**Solution:** Check request body matches schema in error details

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```
**Solution:** Verify ID is correct and resource exists in your tenant

### Subscription Limit (402)
```json
{
  "success": false,
  "message": "Maximum users limit (5) reached for this tenant",
  "data": null
}
```
**Solution:** Upgrade subscription plan or contact admin to increase limits

