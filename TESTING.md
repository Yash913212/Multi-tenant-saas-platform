# Testing & Quality Assurance

## Manual API Testing

### Using cURL

#### Authentication Tests
```bash
# Register tenant
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Corp",
    "subdomain": "testcorp",
    "adminEmail": "admin@testcorp.com",
    "adminPassword": "TestPass@123",
    "adminFullName": "John Doe"
  }'

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testcorp.com",
    "password": "TestPass@123",
    "tenantSubdomain": "testcorp"
  }' | jq -r '.data.token')

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

#### Project Tests
```bash
# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Project",
    "description": "A test project"
  }'

# List projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

#### Task Tests
```bash
# Create task
curl -X POST http://localhost:5000/api/projects/:projectId/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Task description",
    "priority": "high"
  }'

# Update task status
curl -X PATCH http://localhost:5000/api/tasks/:taskId/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "in_progress"
  }'
```

## Testing Multi-Tenancy

### Verify Data Isolation
1. Create two tenants with different subdomains
2. Login to tenant 1, get projects
3. Get JWT token from tenant 1
4. Try to access tenant 2's data with tenant 1's token
5. **Expected**: 403 Forbidden or empty results

```bash
# Create tenant 1
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Tenant One",
    "subdomain": "tenantone",
    "adminEmail": "admin@tenantone.com",
    "adminPassword": "Pass@123",
    "adminFullName": "Admin One"
  }'

# Create tenant 2
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Tenant Two",
    "subdomain": "tenanttwo",
    "adminEmail": "admin@tenanttwo.com",
    "adminPassword": "Pass@123",
    "adminFullName": "Admin Two"
  }'

# Login to tenant 1
TOKEN1=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenantone.com",
    "password": "Pass@123",
    "tenantSubdomain": "tenantone"
  }' | jq -r '.data.token')

# Create project in tenant 1
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"name": "Tenant 1 Project"}'

# Login to tenant 2
TOKEN2=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenanttwo.com",
    "password": "Pass@123",
    "tenantSubdomain": "tenanttwo"
  }' | jq -r '.data.token')

# Try to access tenant 1's projects with tenant 2's token
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN2"
# Should NOT include tenant 1's project
```

## Testing Subscription Limits

### Verify Project Limit
```bash
# Free plan: 3 projects max
TOKEN="<token-from-free-tenant>"

# Create 3 projects (should succeed)
for i in {1..3}; do
  curl -X POST http://localhost:5000/api/projects \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\": \"Project $i\"}"
done

# Create 4th project (should fail with 403)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Project 4"}'
# Expected: 403 Forbidden - "Project limit exceeded"
```

## Frontend Testing

### Login Flow
1. Open http://localhost:3000
2. Go to /login
3. Enter credentials: admin@demo.com / Demo@123 / demo
4. Click "Sign In"
5. Should redirect to /dashboard

### Dashboard
1. Verify stats cards display
2. Verify recent projects shown
3. Verify task count correct
4. Try filtering tasks

### Projects
1. Go to /projects
2. Click "Create Project"
3. Fill form and submit
4. New project should appear
5. Click project to view details

### Project Details
1. View project page
2. Click "Add Task"
3. Create a task
4. Update task status
5. Edit and delete task

### Users (Admin Only)
1. Go to /users (admin only page)
2. Click "Add User"
3. Add new user
4. Edit user role
5. Delete user (cannot delete self)

## Browser DevTools Testing

### Network Tab
- Check all API calls return proper status codes
- Verify Authorization header present
- Check CORS headers

### Console Tab
- Look for JavaScript errors
- Verify no sensitive data logged
- Check performance warnings

### Storage Tab
- Verify JWT token in localStorage
- Check cookie settings (if used)

## Performance Testing

### API Response Times
```bash
time curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Database Query Performance
```sql
-- Check slow queries
SELECT query, mean_time FROM pg_stat_statements
WHERE query LIKE '%projects%'
ORDER BY mean_time DESC;
```

## Test Results Checklist

- [ ] Registration creates tenant and admin user
- [ ] Login returns valid JWT token
- [ ] Token includes correct payload
- [ ] Token expires after 24 hours
- [ ] Projects limited by subscription plan
- [ ] Users limited by subscription plan
- [ ] Data isolation verified
- [ ] Password hashing verified
- [ ] Audit logs created
- [ ] Role-based access working
- [ ] Pagination working
- [ ] Filtering working
- [ ] Search working
- [ ] Error messages user-friendly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable

## Automated Testing (Future)

```bash
# Jest setup
npm install --save-dev jest supertest

# Run tests
npm test

# Coverage report
npm test -- --coverage
```

**Version**: 1.0.0
