# API Documentation
## Multi-Tenant SaaS Platform - Complete API Reference

**Base URL**: `http://localhost:5000/api`  
**Production Base URL**: `http://backend:5000/api` (in Docker)

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Tenant Management Endpoints](#tenant-management-endpoints)
3. [User Management Endpoints](#user-management-endpoints)
4. [Project Management Endpoints](#project-management-endpoints)
5. [Task Management Endpoints](#task-management-endpoints)
6. [Health Check Endpoint](#health-check-endpoint)
7. [Response Format](#response-format)
8. [Error Codes](#error-codes)

---

## Authentication Endpoints

### 1. Register Tenant
**POST** `/auth/register-tenant`

Register a new organization (tenant) on the platform.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "tenantName": "string (required, 1-255 chars)",
  "subdomain": "string (required, unique, alphanumeric, 3-50 chars)",
  "adminEmail": "string (required, valid email format)",
  "adminPassword": "string (required, minimum 8 characters)",
  "adminFullName": "string (required, 1-255 chars)"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp",
    "subdomain": "acme",
    "status": "active",
    "subscriptionPlan": "free",
    "maxUsers": 5,
    "maxProjects": 3,
    "adminUser": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "admin@acme.com",
      "fullName": "Jane Doe",
      "role": "tenant_admin"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input (validation error)
- 409: Subdomain or email already exists

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Company",
    "subdomain": "testco",
    "adminEmail": "admin@testco.com",
    "adminPassword": "SecurePass@123",
    "adminFullName": "John Doe"
  }'
```

---

### 2. Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)",
  "tenantSubdomain": "string (required) OR tenantId: string"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@acme.com",
      "fullName": "Jane Doe",
      "role": "tenant_admin",
      "isActive": true,
      "tenantId": "660e8400-e29b-41d4-a716-446655440000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses**:
- 400: Validation error (missing fields)
- 401: Invalid credentials or account inactive
- 404: Tenant not found
- 403: Tenant is suspended

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePass@123",
    "tenantSubdomain": "acme"
  }'
```

---

### 3. Get Current User
**GET** `/auth/me`

Retrieve current authenticated user's details and tenant information.

**Authentication**: Required (JWT Token)

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@acme.com",
    "fullName": "Jane Doe",
    "role": "tenant_admin",
    "isActive": true,
    "tenant": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corp",
      "subdomain": "acme",
      "status": "active",
      "subscriptionPlan": "pro",
      "maxUsers": 25,
      "maxProjects": 15
    }
  }
}
```

**Error Responses**:
- 401: Missing or invalid token
- 404: User not found

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {jwt_token}"
```

---

### 4. Logout
**POST** `/auth/logout`

Logout user and invalidate session.

**Authentication**: Required (JWT Token)

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer {jwt_token}"
```

---

## Tenant Management Endpoints

### 5. Get Tenant Details
**GET** `/tenants/:tenantId`

Get details about a specific tenant.

**Authentication**: Required

**Authorization**: User must belong to this tenant OR be super_admin

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp",
    "subdomain": "acme",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 25,
    "maxProjects": 15,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z",
    "stats": {
      "totalUsers": 8,
      "totalProjects": 5,
      "totalTasks": 42
    }
  }
}
```

**Error Responses**:
- 401: Not authenticated
- 403: Unauthorized access (doesn't belong to tenant)
- 404: Tenant not found

---

### 6. Update Tenant
**PUT** `/tenants/:tenantId`

Update tenant details.

**Authentication**: Required

**Authorization**: tenant_admin (can update name only) OR super_admin (can update all)

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Request Body**:
```json
{
  "name": "string (optional)",
  "status": "enum: 'active'|'suspended'|'trial' (optional, super_admin only)",
  "subscriptionPlan": "enum: 'free'|'pro'|'enterprise' (optional, super_admin only)",
  "maxUsers": "integer (optional, super_admin only)",
  "maxProjects": "integer (optional, super_admin only)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Name",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 25,
    "maxProjects": 15,
    "updatedAt": "2024-01-20T15:00:00Z"
  }
}
```

**Error Responses**:
- 403: Insufficient permissions or trying to update restricted fields as tenant_admin
- 404: Tenant not found

---

### 7. List All Tenants
**GET** `/tenants`

List all tenants (super_admin only).

**Authentication**: Required

**Authorization**: super_admin ONLY

**Query Parameters**:
- `page`: integer (optional, default: 1)
- `limit`: integer (optional, default: 10, max: 100)
- `status`: enum filter (optional) - 'active'|'suspended'|'trial'
- `subscriptionPlan`: enum filter (optional) - 'free'|'pro'|'enterprise'
- `search`: string filter (optional) - search by name

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "Acme Corp",
        "subdomain": "acme",
        "status": "active",
        "subscriptionPlan": "pro",
        "maxUsers": 25,
        "maxProjects": 15,
        "totalUsers": 8,
        "totalProjects": 5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTenants": 47,
      "limit": 10
    }
  }
}
```

**Error Responses**:
- 403: Not super_admin

---

## User Management Endpoints

### 8. Add User to Tenant
**POST** `/tenants/:tenantId/users`

Add a new user to a tenant.

**Authentication**: Required

**Authorization**: tenant_admin only

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Request Body**:
```json
{
  "email": "string (required, valid email, unique per tenant)",
  "password": "string (required, minimum 8 characters)",
  "fullName": "string (required)",
  "role": "enum: 'user'|'tenant_admin' (optional, default: 'user')"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@acme.com",
    "fullName": "Alice Johnson",
    "role": "user",
    "tenantId": "660e8400-e29b-41d4-a716-446655440000",
    "isActive": true,
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

**Error Responses**:
- 403: User limit exceeded (subscription limit)
- 409: Email already exists in this tenant
- 404: Tenant not found

---

### 9. List Tenant Users
**GET** `/tenants/:tenantId/users`

List all users in a tenant.

**Authentication**: Required

**Authorization**: User must belong to this tenant

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Query Parameters**:
- `search`: string (optional) - search by name or email
- `role`: enum filter (optional) - 'user'|'tenant_admin'|'super_admin'
- `page`: integer (optional, default: 1)
- `limit`: integer (optional, default: 50, max: 100)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@acme.com",
        "fullName": "Jane Doe",
        "role": "tenant_admin",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 8,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

---

### 10. Update User
**PUT** `/users/:userId`

Update a user's details.

**Authentication**: Required

**Authorization**: User can update own profile (limited fields) OR tenant_admin

**URL Parameters**:
- `userId`: UUID of the user

**Request Body**:
```json
{
  "fullName": "string (optional)",
  "role": "enum: 'user'|'tenant_admin' (optional, tenant_admin only)",
  "isActive": "boolean (optional, tenant_admin only)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@acme.com",
    "fullName": "Jane Smith",
    "role": "tenant_admin",
    "isActive": true,
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### 11. Delete User
**DELETE** `/users/:userId`

Delete a user from their tenant.

**Authentication**: Required

**Authorization**: tenant_admin only (cannot delete self)

**URL Parameters**:
- `userId`: UUID of the user

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:
- 403: Cannot delete self or not authorized
- 404: User not found

---

## Project Management Endpoints

### 12. Create Project
**POST** `/projects`

Create a new project.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "status": "enum: 'active'|'archived'|'completed' (optional, default: 'active')"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "tenantId": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-20T16:30:00Z"
  }
}
```

**Error Responses**:
- 403: Project limit exceeded (subscription limit)

---

### 13. List Projects
**GET** `/projects`

List all projects for the user's tenant.

**Authentication**: Required

**Query Parameters**:
- `status`: enum filter (optional) - 'active'|'archived'|'completed'
- `search`: string (optional) - search by project name
- `page`: integer (optional, default: 1)
- `limit`: integer (optional, default: 20, max: 100)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "active",
        "createdBy": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "fullName": "Jane Doe"
        },
        "taskCount": 12,
        "completedTaskCount": 5,
        "createdAt": "2024-01-20T16:30:00Z"
      }
    ],
    "total": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 20
    }
  }
}
```

---

### 14. Update Project
**PUT** `/projects/:projectId`

Update project details.

**Authentication**: Required

**Authorization**: project creator or tenant_admin

**URL Parameters**:
- `projectId`: UUID of the project

**Request Body**:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "status": "enum: 'active'|'archived'|'completed' (optional)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "archived",
    "updatedAt": "2024-01-20T17:00:00Z"
  }
}
```

**Error Responses**:
- 403: Not authorized (not creator/admin)
- 404: Project not found

---

### 15. Delete Project
**DELETE** `/projects/:projectId`

Delete a project and its associated tasks.

**Authentication**: Required

**Authorization**: project creator or tenant_admin

**URL Parameters**:
- `projectId`: UUID of the project

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Task Management Endpoints

### 16. Create Task
**POST** `/projects/:projectId/tasks`

Create a new task in a project.

**Authentication**: Required

**URL Parameters**:
- `projectId`: UUID of the project

**Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "assignedTo": "string UUID (optional)",
  "priority": "enum: 'low'|'medium'|'high' (optional, default: 'medium')",
  "dueDate": "string date YYYY-MM-DD (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "projectId": "770e8400-e29b-41d4-a716-446655440000",
    "tenantId": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity design",
    "status": "todo",
    "priority": "high",
    "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
    "dueDate": "2024-02-15",
    "createdAt": "2024-01-20T17:30:00Z"
  }
}
```

**Error Responses**:
- 400: assignedTo user doesn't belong to same tenant
- 403: Project doesn't belong to user's tenant

---

### 17. List Project Tasks
**GET** `/projects/:projectId/tasks`

List all tasks in a project.

**Authentication**: Required

**URL Parameters**:
- `projectId`: UUID of the project

**Query Parameters**:
- `status`: enum filter (optional) - 'todo'|'in_progress'|'completed'
- `assignedTo`: string UUID filter (optional)
- `priority`: enum filter (optional) - 'low'|'medium'|'high'
- `search`: string (optional) - search by title
- `page`: integer (optional, default: 1)
- `limit`: integer (optional, default: 50, max: 100)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "title": "Design homepage mockup",
        "description": "Create high-fidelity design",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "fullName": "Alice Johnson",
          "email": "alice@acme.com"
        },
        "dueDate": "2024-02-15",
        "createdAt": "2024-01-20T17:30:00Z"
      }
    ],
    "total": 12,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "limit": 50
    }
  }
}
```

---

### 18. Update Task Status
**PATCH** `/tasks/:taskId/status`

Quickly update task status.

**Authentication**: Required

**URL Parameters**:
- `taskId`: UUID of the task

**Request Body**:
```json
{
  "status": "enum: 'todo'|'in_progress'|'completed' (required)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Task status updated",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "updatedAt": "2024-01-20T18:00:00Z"
  }
}
```

---

### 19. Update Task
**PUT** `/tasks/:taskId`

Update all task details.

**Authentication**: Required

**URL Parameters**:
- `taskId`: UUID of the task

**Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "enum: 'todo'|'in_progress'|'completed' (optional)",
  "priority": "enum: 'low'|'medium'|'high' (optional)",
  "assignedTo": "string UUID (optional, can be null to unassign)",
  "dueDate": "string date YYYY-MM-DD (optional, can be null)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "high",
    "assignedTo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "Alice Johnson",
      "email": "alice@acme.com"
    },
    "dueDate": "2024-02-20",
    "updatedAt": "2024-01-20T18:15:00Z"
  }
}
```

---

## Health Check Endpoint

### 20. Health Check
**GET** `/health`

Check API and database health status.

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-20T18:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "env": "production"
}
```

**Error Response** (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Database connection failed"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data object or array
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Error Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, DELETE, PATCH |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing/invalid JWT token, expired |
| 403 | Forbidden | Insufficient permissions, limit exceeded |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, subdomain, or unique constraint violation |
| 500 | Server Error | Unexpected server error |
| 503 | Service Unavailable | Database connection failed |

---

## Authentication

All endpoints except `/auth/register-tenant` and `/auth/login` require JWT token in header:

```
Authorization: Bearer {jwt_token}
```

The JWT token contains:
- `userId`: User's UUID
- `tenantId`: Tenant's UUID (null for super_admin)
- `role`: User's role (super_admin, tenant_admin, user)
- `exp`: Token expiration timestamp (24 hours from issuance)

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: API Development Team
