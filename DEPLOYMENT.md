# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- Git

### Steps

1. **Clone Repository**
   ```bash
   git clone <url>
   cd multi-tenant-saas-platform
   ```

2. **Configure Environment** (optional)
   Edit `backend/.env` for production:
   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret>
   ```

3. **Build & Start**
   ```bash
   docker-compose up -d
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Port Mappings

| Service | External | Internal |
|---------|----------|----------|
| Frontend | 3000 | 3000 |
| Backend | 5000 | 5000 |
| Database | 5432 | 5432 |

### Stopping Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Cloud Deployment

### AWS ECS/Fargate
1. Push images to ECR
2. Create ECS task definitions
3. Create Fargate service
4. Configure load balancer
5. Setup RDS for database

### DigitalOcean App Platform
1. Connect GitHub repository
2. Create app from repository
3. Set environment variables
4. Deploy automatically

### Heroku (Limited)
Note: Free tier limited, use paid options:
1. Create apps for backend and frontend
2. Set environment variables
3. Push code: `git push heroku main`
4. Add PostgreSQL addon

## Production Checklist

- [ ] Use HTTPS/TLS
- [ ] Generate strong JWT_SECRET
- [ ] Configure production database
- [ ] Set NODE_ENV=production
- [ ] Enable database backups
- [ ] Setup monitoring
- [ ] Configure logging
- [ ] Enable CORS for specific domains
- [ ] Implement rate limiting
- [ ] Setup CDN for static assets
- [ ] Configure email notifications (future)

## Monitoring

### Health Endpoint
```bash
GET /api/health
```

### Docker Logs
```bash
docker-compose logs -f backend
```

### Database
```bash
psql -h localhost -U postgres -d saas_db
```

**Version**: 1.0.0
