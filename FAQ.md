# Frequently Asked Questions (FAQ)

Common questions and answers about the Multi-Tenant SaaS Platform.

## General Questions

### Q: What is a multi-tenant SaaS application?
**A:** A multi-tenant application serves multiple customers (tenants) from a single instance. Each tenant's data is completely isolated - they cannot see each other's data. This is cost-effective (one database, one server) while maintaining security and privacy.

### Q: How is data isolation implemented?
**A:** This application uses **row-level isolation** in a shared database:
- Every table has a `tenant_id` column
- Every query filters by the user's `tenant_id` (from their JWT token)
- Users can only see data belonging to their tenant
- The isolation happens at both the database and application level

### Q: Can I run this locally?
**A:** Yes! You have two options:
1. **Docker** (recommended): `docker-compose up -d`
2. **Local development**: Install PostgreSQL, Node.js, configure .env, run migrations

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed instructions.

### Q: What are the default test credentials?
**A:** 
- **Super Admin**: `superadmin@system.com` / `Admin@123` (system tenant)
- **Demo Tenant Admin**: `admin@demo.com` / `Demo@123` (demo subdomain)
- **Demo Users**: `user1@demo.com` / `User@123` and `user2@demo.com` / `User@123`

### Q: How do I access the application?
**A:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:5432

---

## Architecture & Design

### Q: Why use PostgreSQL and not MongoDB?
**A:** PostgreSQL was chosen for:
1. **ACID compliance** - Ensures data integrity for financial/sensitive operations
2. **Foreign keys** - Enforces referential integrity across tenants
3. **Row-level security** - Built-in support for tenant isolation
4. **Transactions** - Multiple operations fail together (no partial updates)
5. **Cost** - PostgreSQL is free and well-supported

### Q: Why JWT instead of sessions?
**A:** JWT advantages:
1. **Stateless** - No server-side session storage needed
2. **Scalable** - Works across multiple servers
3. **Mobile-friendly** - Works with mobile apps without cookies
4. **Self-contained** - Token includes all user info (id, role, tenantId)

**Tradeoff**: Tokens can't be revoked until expiration (24 hours)

### Q: What's the difference between tenant_admin and user roles?
**A:**
- **super_admin**: System administrator (full access to all tenants)
- **tenant_admin**: Tenant administrator (manages users, projects, settings within their tenant)
- **user**: Regular user (can create/manage projects and tasks)

### Q: How many users/projects per tenant are allowed?
**A:** This depends on the subscription plan. Check the `tenants` table `subscription_plan` and `max_users`/`max_projects` columns.

---

## Deployment & DevOps

### Q: How do I deploy to production?
**A:** See [DEPLOYMENT.md](DEPLOYMENT.md) for:
1. Cloud deployment (AWS, GCP, Azure, Heroku)
2. Traditional VPS deployment
3. Kubernetes deployment
4. Security considerations

### Q: Do you support HTTPS?
**A:** The code doesn't enforce it, but:
- Production deployment should use HTTPS
- Update `CORS_ORIGIN` to use https:// domain
- Set secure JWT configuration

### Q: How do I set up SSL/TLS certificates?
**A:** 
- **Cloud platforms** (AWS, Azure): Use built-in certificates
- **Let's Encrypt** (free): Use `certbot` with nginx reverse proxy
- **Traditional VPS**: Use `certbot` with your web server

### Q: Can I run this on serverless (Lambda, Cloud Functions)?
**A:** Not directly - the application needs persistent connections:
- Long-running database connections from API
- Stateful Docker setup
- Serverless is better for truly stateless APIs

You could refactor for serverless but it's not recommended for this architecture.

### Q: What about backups?
**A:** See [DEPLOYMENT.md](DEPLOYMENT.md) for backup strategies:
1. Automated daily backups
2. Point-in-time recovery
3. Off-site backup storage
4. Backup testing/verification

---

## Authentication & Security

### Q: Is my password safe?
**A:** Yes - passwords are:
1. Hashed with **bcryptjs** (not encrypted)
2. Stored with salt rounds (10) - very secure
3. Never logged or transmitted
4. Cannot be recovered (password reset required)

### Q: How do I reset a user's password?
**A:** Two options:
1. **Via admin**: (Not implemented - future feature)
2. **Via database**:
   ```bash
   # Generate hash for "NewPassword@123"
   bcryptjs hash "NewPassword@123"
   # Copy hash and update in DB
   UPDATE users SET password_hash = '<hash>' WHERE email = 'user@example.com';
   ```

### Q: Is the JWT token secure?
**A:** JWT security depends on:
1. **Storage**: Currently in localStorage (vulnerable to XSS)
   - **Better**: Use HttpOnly cookies (production recommended)
2. **Transmission**: Should use HTTPS (required in production)
3. **Expiration**: 24 hours (industry standard)
4. **Secret**: Must be strong and kept secret

### Q: What about cross-tenant data leaks?
**A:** We prevent this with:
1. **JWT verification** - Every request checks token validity
2. **Tenant filtering** - All queries include `WHERE tenant_id = req.user.tenantId`
3. **Route protection** - Protected routes check user role
4. **Database constraints** - Foreign keys ensure referential integrity

### Q: How is audit logging used?
**A:** All changes are logged:
- **What**: CREATE, UPDATE, DELETE actions
- **Who**: User ID who made the change
- **When**: Timestamp of change
- **Where**: Tenant ID (for compliance)
- **How**: Entity type and ID

This enables compliance audits and debugging.

---

## Development & Contributing

### Q: Can I extend the API?
**A:** Yes! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
1. Code style guide
2. Commit message format
3. Testing requirements
4. Pull request checklist

### Q: How do I add a new API endpoint?
**A:** Follow the existing pattern:
1. Create route in `src/routes/` (e.g., `articles.js`)
2. Create controller in `src/controllers/` (e.g., `articleController.js`)
3. Create service in `src/services/` (e.g., `articleService.js`)
4. Add route to `src/app.js`
5. Test with cURL or frontend

### Q: How do I add a new database table?
**A:** Create a migration:
1. Create file `database/migrations/006_create_articles.sql`
2. Add SQL schema
3. Run `node scripts/init-db.js` to apply

### Q: Can I use TypeScript?
**A:** The base is JavaScript, but you can:
1. Add TypeScript gradually (mixed JS/TS)
2. Install `typescript` and `@types/*` packages
3. Rename `.js` to `.ts`
4. Add `tsconfig.json` and build step

### Q: Do you have automated tests?
**A:** Currently: Manual testing with cURL examples (see [TESTING.md](TESTING.md))

Recommended to add:
1. **Jest** for unit tests
2. **Supertest** for API integration tests
3. **React Testing Library** for frontend tests

---

## Performance & Scaling

### Q: How many concurrent users can this support?
**A:** On standard hardware:
- **Local**: 10-50 concurrent users
- **Small server** (2 cores, 4GB RAM): 100-500 users
- **Large server** (8+ cores, 16GB+ RAM): 1000+ users

See [PERFORMANCE.md](PERFORMANCE.md) for optimization tips.

### Q: What's the database size limit?
**A:** PostgreSQL supports databases larger than 1TB, but:
- Larger databases need better indexing
- Queries may slow down without optimization
- Plan backup/recovery procedures

### Q: How do I optimize database performance?
**A:** See [PERFORMANCE.md](PERFORMANCE.md):
1. Add indexes for frequently filtered columns
2. Enable query logging to find slow queries
3. Tune connection pool size
4. Use pagination for large datasets

### Q: Should I use caching?
**A:** Consider Redis caching for:
1. User sessions/profiles
2. Frequently accessed projects/tasks
3. Authentication checks
4. Search results

Not needed initially but helps with scale.

### Q: How do I monitor application health?
**A:**
1. Health check endpoint: `GET /api/health`
2. Application logs with `LOG_LEVEL=debug`
3. Docker stats: `docker stats`
4. Database monitoring with `pg_stat_statements`

---

## Troubleshooting

### Q: Port 5000 is already in use?
**A:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Port in Use section

### Q: Cannot connect to database?
**A:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Database Connection Failed section

### Q: CORS error in browser?
**A:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - CORS Errors section

### Q: Docker container exits immediately?
**A:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Docker Issues section

### Q: Authentication token not working?
**A:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Authentication Token Issues section

### Q: Getting 403 Forbidden errors?
**A:** Likely authorization issue:
1. Check user role (super_admin, tenant_admin, user)
2. Verify user is accessing their own tenant's data
3. Check endpoint requires specific role
4. View audit logs for what operations succeeded/failed

### Q: API returning 500 errors?
**A:**
1. Check backend logs: `docker-compose logs backend`
2. Enable debug logging: `LOG_LEVEL=debug`
3. Check database connection: `curl http://localhost:5000/api/health`
4. Verify environment variables in `.env`

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.

---

## Miscellaneous

### Q: Can I use this for [specific use case]?
**A:** This platform is designed for general multi-tenant SaaS applications. Evaluate:
1. **Data isolation** - Sufficient for your security needs?
2. **Compliance** - Meets your regulatory requirements?
3. **Scale** - Handles your expected user count?
4. **Features** - Has the core features you need?

### Q: How is this licensed?
**A:** MIT License - you can use for personal or commercial projects. See [LICENSE](LICENSE).

### Q: Can I modify and redistribute this?
**A:** Yes, with MIT license you can:
- Modify the code
- Redistribute with modifications
- Use commercially
- Charge for it

Just include the original license.

### Q: Where can I report bugs?
**A:**
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [PROJECT_COMPLETION.md](PROJECT_COMPLETION.md)
3. Search existing GitHub issues
4. Create detailed bug report with reproduction steps

### Q: How often is this updated?
**A:** This is a complete project, not actively maintained. You're responsible for:
1. Security patches
2. Dependency updates
3. Bug fixes
4. Feature additions

### Q: Can I get help implementing features?
**A:** This project includes:
- Comprehensive documentation
- Code examples
- Architecture decision records
- Contributing guidelines

For additional help:
1. Review [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check code comments and documentation
3. Follow existing patterns for new features

### Q: Is there a roadmap?
**A:** Yes, see [CHANGELOG.md](CHANGELOG.md) - "Unreleased" section for planned features:
- Email verification
- Two-factor authentication
- Advanced reporting
- SSO integration
- And more...

Feel free to implement any of these!

---

## Quick Links

- **Start Here**: [README.md](README.md)
- **Quick Setup**: [GETTING_STARTED.md](GETTING_STARTED.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Performance**: [PERFORMANCE.md](PERFORMANCE.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Examples**: [API_EXAMPLES.md](API_EXAMPLES.md)

---

## Still Have Questions?

1. **Check documentation** - Your answer is likely in one of these files
2. **Review code comments** - Source code has detailed comments
3. **Run with debug logging** - `LOG_LEVEL=debug npm start`
4. **Check database state** - Use `psql` to query tables directly
5. **Review git history** - Commits explain design decisions

If you find something missing, consider adding to this FAQ!
