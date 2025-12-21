# Troubleshooting Guide

Comprehensive troubleshooting guide for the Multi-Tenant SaaS Platform.

## Common Issues and Solutions

### 1. Port Already in Use

**Problem**: Error `EADDRINUSE: address already in use :::5000` when starting backend

**Solutions**:

**On Windows (PowerShell)**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use the lsof alternative
Get-NetTCPConnection -LocalPort 5000 | Select-Object ProcessName, PID
Stop-Process -Id <PID> -Force
```

**On macOS/Linux**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**Alternative**: Change PORT in .env file:
```env
PORT=5001
```

---

### 2. Database Connection Failed

**Problem**: Error `connect ECONNREFUSED 127.0.0.1:5432`

**Causes and Solutions**:

**PostgreSQL not running**:
```bash
# Windows
pg_isready

# macOS (if installed via Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**Wrong connection parameters**:
- Check `.env` file has correct values:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASSWORD=postgres
  DB_NAME=saas_db
  ```

**Database doesn't exist**:
```bash
# Connect as superuser and create database
psql -U postgres -c "CREATE DATABASE saas_db;"
```

**Using Docker - service name vs localhost**:
- Inside Docker network, use service name: `DB_HOST=database`
- From host machine, use: `DB_HOST=localhost`

---

### 3. Migration Fails on Startup

**Problem**: Error during database migration initialization

**Solutions**:

**Check migration files exist**:
```bash
ls database/migrations/
```

**Manually run migrations**:
```bash
node scripts/init-db.js
```

**Reset database and re-run**:
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS saas_db; CREATE DATABASE saas_db;"

# Backend will auto-run migrations on next start
npm start
```

**View migration errors**:
```bash
# Set log level to debug
LOG_LEVEL=debug npm start
```

---

### 4. Authentication Issues

**Problem**: Login fails with 401 Unauthorized

**Causes and Solutions**:

**Invalid credentials**:
- Default credentials: `superadmin@system.com` / `Admin@123`
- Demo tenant: `admin@demo.com` / `Demo@123` with subdomain `demo`
- Check spelling and case (password is case-sensitive)

**JWT token expired**:
- Default expiration: 24 hours
- Token stored in `localStorage`
- Clear browser storage and login again:
  ```javascript
  localStorage.clear();
  // Then refresh page and login
  ```

**JWT_SECRET mismatch**:
- Ensure backend `.env` JWT_SECRET matches everywhere
- If changed, users must login again

**Check token in browser**:
```javascript
// In browser console
console.log(localStorage.getItem('token'));
```

---

### 5. CORS Errors in Browser

**Problem**: Browser shows CORS error when frontend calls backend API

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:

**Check CORS configuration**:
```env
# .env file
CORS_ORIGIN=http://localhost:3000
```

**Verify origin matches**:
- Frontend running on: http://localhost:3000 ✓
- If frontend on different URL, update `CORS_ORIGIN`

**For Docker environment**:
```yaml
# docker-compose.yml
backend:
  environment:
    - CORS_ORIGIN=http://frontend:3000  # Use service name
```

**Check frontend API URL**:
```javascript
// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
// Should be: http://localhost:5000/api (local)
// Or: http://backend:5000/api (Docker)
```

---

### 6. Docker Issues

**Problem**: Docker containers fail to start

**Solutions**:

**Check Docker daemon running**:
```bash
# Windows
docker ps

# If fails, restart Docker Desktop
```

**View container logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f frontend
```

**Container exits immediately**:
```bash
# Check specific container logs
docker-compose logs backend

# Common causes: connection failures, missing env vars
```

**Port already in use by another container**:
```bash
# Stop all containers
docker-compose down

# Or use different ports in docker-compose.yml
```

**Database initialization timeout**:
```bash
# Increase healthcheck timeout in docker-compose.yml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "postgres"]
  interval: 10s
  timeout: 15s  # Increase this
  retries: 5
```

**Rebuild images after code changes**:
```bash
docker-compose up -d --build
```

---

### 7. Frontend Not Loading

**Problem**: Browser shows blank page or 404 when accessing http://localhost:3000

**Solutions**:

**Check frontend service running**:
```bash
docker ps
# Look for "frontend" in NAMES column

# Or locally
npm start  # in frontend/ directory
```

**Check build errors**:
```bash
# In frontend directory
npm run build

# View any build errors and fix them
```

**Clear React development server cache**:
```bash
# Kill frontend process
# Delete node_modules and reinstall
rm -r frontend/node_modules
npm install

# Restart
npm start
```

**API URL mismatch**:
```javascript
// Check .env or environment
REACT_APP_API_BASE_URL=http://localhost:5000/api

// If wrong, update and restart frontend
```

---

### 8. Seed Data Not Loading

**Problem**: No test data in database after startup

**Solutions**:

**Check RUN_SEEDS is enabled**:
```env
RUN_SEEDS=true
```

**Manually run seed**:
```bash
# In backend directory
psql -U postgres -d saas_db -f src/seeds/seed.sql
```

**View seed file**:
```bash
cat backend/src/seeds/seed.sql
```

**Verify data inserted**:
```bash
# Connect to database
psql -U postgres -d saas_db

# Check tables
\dt
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
```

---

### 9. API Requests Failing

**Problem**: API calls return 5xx errors

**Solutions**:

**Check health endpoint**:
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","database":"connected"}
```

**View backend logs**:
```bash
# Local
npm start  # in backend/ directory, see console output

# Docker
docker-compose logs backend
```

**Check required environment variables**:
```bash
# Backend should log missing vars on startup
# Check .env file completeness
cat .env
```

**Database connectivity**:
```javascript
// Health endpoint checks this
GET /api/health
```

---

### 10. Authentication Token Issues

**Problem**: Token appears valid but requests fail with 401

**Solutions**:

**Check token format**:
```bash
# Token should be in Authorization header
Authorization: Bearer <token>

# Check request headers
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users
```

**Token expiration**:
```javascript
// Decode token (use jwt.io or online decoder)
// Check 'exp' claim - should be in future
// If expired, login again to get new token
```

**Verify user still exists**:
```bash
# Check in database
psql -U postgres -d saas_db
SELECT * FROM users WHERE email = 'admin@demo.com';
```

**JWT_SECRET changed**:
- All existing tokens become invalid
- Users must login again
- Don't change JWT_SECRET in production without planning

---

### 11. Task Creation Fails

**Problem**: Creating tasks returns error

**Solutions**:

**Check subscription limits**:
```javascript
// Error: "Max tasks limit reached"
// Upgrade subscription plan or delete unused tasks
```

**Project not found (403)**:
- Verify project_id exists and belongs to your tenant
- Check you're not accessing another tenant's project

**Assigned user not in project**:
- User might not have access to this project
- Check user's role and permissions

---

### 12. User Not Seeing Data

**Problem**: Dashboard shows no projects or tasks

**Solutions**:

**Check user role and permissions**:
```bash
# Verify in database
psql -U postgres -d saas_db
SELECT id, email, role FROM users WHERE tenant_id = '<tenant_id>';
```

**Verify data belongs to user's tenant**:
- All queries filtered by `tenant_id` from JWT
- If in different tenant, won't see other tenant's data

**Create test data**:
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Test"}'
```

---

### 13. Email/Password Issues

**Problem**: Account locked or reset needed

**Solutions**:

**Reset user password via database**:
```bash
# Get bcrypt hash for new password
# Use: npm install -g bcryptjs
# Then: bcryptjs hash "NewPassword@123"

# Update in database
psql -U postgres -d saas_db
UPDATE users SET password_hash = '<new_hash>' WHERE email = 'user@example.com';
```

**Reactivate disabled user**:
```bash
UPDATE users SET is_active = true WHERE email = 'user@example.com';
```

---

### 14. Performance Issues

**Problem**: Application is slow or requests timeout

**Solutions**:

**Check database performance**:
```bash
# Check slow query log
psql -U postgres -d saas_db
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

**Increase connection pool**:
```env
DB_POOL_MIN=5
DB_POOL_MAX=50
```

**Check resource usage**:
```bash
# Docker
docker stats

# Shows CPU, memory usage per container
```

**Optimize indexes**:
```bash
# Add index for frequently filtered columns
psql -U postgres -d saas_db
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
```

---

### 15. Deployment Issues

**Problem**: Application fails in production

**Solutions**:

**Check environment variables**:
```bash
# Verify all required vars set
env | grep DB_
env | grep JWT_
```

**Check database accessibility**:
```bash
# From production server
psql -h <db_host> -U <db_user> -d <db_name>
```

**Review production logs**:
```bash
# Check application logs
tail -f /var/log/app/backend.log

# Check system logs
journalctl -u app-backend -f
```

**Monitor resource limits**:
- Ensure sufficient memory for Node.js process
- Check disk space for database
- Monitor CPU usage

---

## Getting More Help

### Debug Logging

Enable debug logging for detailed troubleshooting:

```env
LOG_LEVEL=debug
```

This will output detailed information about:
- Database queries
- JWT token operations
- Request/response details
- Authentication checks

### Check Documentation

1. [README.md](README.md) - Main documentation
2. [GETTING_STARTED.md](GETTING_STARTED.md) - Setup guide
3. [docs/API.md](docs/API.md) - API reference
4. [SECURITY.md](SECURITY.md) - Security concerns
5. [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - Configuration

### Reproduce Issue Systematically

1. **Note exact error message**
2. **Record steps to reproduce**
3. **Check logs with debug enabled**
4. **Test in isolation** (Docker vs local, etc.)
5. **Search documentation**
6. **Try minimal reproduction case**

### Common Command Reference

```bash
# Start development
npm start

# Start with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up -d

# Connect to database
psql -U postgres -d saas_db

# Check service health
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@system.com","password":"Admin@123","subdomain":"system"}'
```

## Still Need Help?

If you've tried these solutions:
1. Review application logs with `LOG_LEVEL=debug`
2. Check if issue is documented in [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md)
3. Review Git history for related changes
4. Check database state directly with `psql`
5. Test with simple curl commands before complex operations
