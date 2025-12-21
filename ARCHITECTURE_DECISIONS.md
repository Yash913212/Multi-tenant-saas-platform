# Architecture Decision Records (ADRs)

## ADR 001: Multi-Tenancy Pattern

### Context
Multiple organizations need to use the same SaaS application while keeping their data completely isolated.

### Decision
Implement **Shared Database + Shared Schema** (Row-Level Isolation) approach.

### Rationale
- Lower operational complexity vs separate databases
- Better cost efficiency for many tenants
- Instant tenant provisioning without database/schema creation
- Application-level control allows strong isolation patterns
- Suitable for SaaS MVP and early growth

### Consequences
- **Positive**: Cost-effective, simple operations, fast tenant onboarding
- **Negative**: Requires careful query filtering, must prevent accidental cross-tenant leaks

### Implementation
- Every table includes `tenant_id` column
- JWT token contains `tenantId`
- All queries automatically filtered by `tenant_id` from JWT
- Database constraints enforce foreign key relationships

---

## ADR 002: Authentication Method

### Context
Need stateless, scalable authentication that works with microservices.

### Decision
Implement **JWT (JSON Web Token)** authentication with 24-hour expiration.

### Rationale
- Stateless: no server-side session storage
- Scalable: works with load balancing and microservices
- Standard: industry-wide adoption
- Mobile-friendly: easily implemented in mobile apps

### Consequences
- **Positive**: Stateless, scales horizontally, no session storage needed
- **Negative**: Token revocation requires whitelist, cannot force logout in seconds

### Implementation
- HS256 algorithm with strong secret (32+ chars)
- Token payload: { userId, tenantId, role, iat, exp }
- 24-hour expiration for security/usability balance
- Verified on every protected endpoint

---

## ADR 003: Password Hashing

### Context
Passwords must be securely hashed before storage.

### Decision
Use **bcryptjs** with 10 salt rounds.

### Rationale
- Industry standard for password hashing
- Intentionally slow (resistant to brute force)
- Automatic salt generation
- No storage of plaintext passwords

### Consequences
- **Positive**: Highly secure, resistant to attacks
- **Negative**: Slower login (intentional), more CPU usage

---

## ADR 004: Database Technology

### Context
Need relational database with strong consistency, ACID compliance, and production readiness.

### Decision
Use **PostgreSQL 13+**.

### Rationale
- ACID compliance ensures data integrity
- Foreign keys and constraints for referential integrity
- Advanced features (JSON support, full-text search)
- Open source, no licensing costs
- Battle-tested in production

### Consequences
- **Positive**: Reliable, powerful, widely used
- **Negative**: Requires server/database knowledge

---

## ADR 005: Frontend Framework

### Context
Need modern, responsive UI framework with good ecosystem and developer experience.

### Decision
Use **React 18+** with **Tailwind CSS**.

### Rationale
- Component-based architecture for reusability
- Large ecosystem and community support
- Excellent tooling and DevTools
- Tailwind provides utility-first CSS for rapid development

### Consequences
- **Positive**: Fast development, responsive design, reusable components
- **Negative**: JavaScript bundle size, requires build step

---

## ADR 006: Deployment Strategy

### Context
Need consistent, reproducible deployment across development and production environments.

### Decision
Use **Docker and Docker Compose** for containerization and orchestration.

### Rationale
- Consistency: works everywhere (Windows, Linux, macOS, cloud)
- Isolation: each service in separate container
- Scalability: easy to scale services independently
- Standard: widely adopted in industry

### Consequences
- **Positive**: Reproducible environments, easy scaling
- **Negative**: Requires Docker knowledge, additional complexity

---

## ADR 007: API Response Format

### Context
Need consistent response format across all API endpoints for predictable client code.

### Decision
All endpoints return `{ success: boolean, message?: string, data?: object }` format.

### Rationale
- Consistency makes client code simpler
- Explicit success/failure indicator
- Optional message for user feedback
- Data can be object or array based on endpoint

### Consequences
- **Positive**: Predictable responses, easier error handling
- **Negative**: Slightly more verbose than minimal responses

---

## ADR 008: Subscription Plan Limits

### Context
Different organizations have different limits on users and projects based on subscription.

### Decision
Enforce **max_users** and **max_projects** at API level before creating resources.

### Rationale
- Prevents limit violations at source
- Clear error messages to users
- Trackable in audit logs
- Allows future monetization

### Consequences
- **Positive**: Prevents limit violations, clear user feedback
- **Negative**: API calls that fail due to limits (expected behavior)

---

## ADR 009: Audit Logging

### Context
Need to track all important actions for security, compliance, and debugging.

### Decision
Log all CREATE, UPDATE, DELETE operations to `audit_logs` table with:
- user_id, tenant_id, action, entity_type, entity_id, ip_address, timestamp

### Rationale
- Security: detect unauthorized access attempts
- Compliance: audit trail for regulations
- Debugging: understand what happened and when
- Accountability: know who did what

### Consequences
- **Positive**: Full audit trail for security and compliance
- **Negative**: Additional storage, performance impact (minimal)

---

## ADR 010: Role-Based Access Control

### Context
Different users have different permissions based on their role.

### Decision
Implement **three-tier RBAC** system:
- `super_admin`: System administrator, all permissions
- `tenant_admin`: Organization administrator, full control of own tenant
- `user`: Regular team member, limited permissions

### Rationale
- Simple hierarchy easy to understand
- Suitable for most organizations
- Prevents privilege escalation
- Easy to audit and debug

### Consequences
- **Positive**: Clear permissions, easy to explain
- **Negative**: Limited customization (no custom roles for MVP)

---

**Document Version**: 1.0.0  
**Last Updated**: December 2024  
**Author**: Architecture Team
