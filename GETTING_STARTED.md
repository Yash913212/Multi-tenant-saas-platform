# Getting Started Guide

## Quick Start (5 minutes)

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

Wait ~30 seconds for services to be healthy, then:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

**Login with:**
- Email: admin@demo.com
- Password: Demo@123
- Subdomain: demo

### Local Development

```bash
# Backend
cd backend && npm install && npm run migrate && npm start

# Frontend (new terminal)
cd frontend && npm install && npm start
```

## Features to Try

1. **Register New Tenant** - Create a new organization
2. **Create Projects** - Add projects to your tenant
3. **Create Tasks** - Add tasks to projects
4. **Assign Users** - Manage team members
5. **Track Progress** - Update task statuses

## Documentation

- [README.md](README.md) - Full documentation
- [docs/API.md](docs/API.md) - API endpoint reference
- [docs/research.md](docs/research.md) - Architecture research
- [docs/PRD.md](docs/PRD.md) - Product requirements

## Support

See Troubleshooting section in README.md

**Version**: 1.0.0
