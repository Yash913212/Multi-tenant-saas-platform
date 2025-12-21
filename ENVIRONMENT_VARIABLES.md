# Environment Variables Documentation

This document describes all environment variables used throughout the Multi-Tenant SaaS Platform.

## Backend Environment Variables

### Database Configuration
```env
DB_HOST=localhost              # PostgreSQL host
DB_PORT=5432                   # PostgreSQL port
DB_USER=postgres               # PostgreSQL username
DB_PASSWORD=postgres           # PostgreSQL password
DB_NAME=saas_db                # Database name
DB_POOL_MIN=2                  # Minimum connection pool size
DB_POOL_MAX=20                 # Maximum connection pool size
```

### Server Configuration
```env
NODE_ENV=development           # Environment: development, test, production
PORT=5000                      # Backend server port
HOST=0.0.0.0                   # Server host
```

### JWT Configuration
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h             # Token expiration time
```

### CORS Configuration
```env
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### Database Initialization
```env
RUN_MIGRATIONS=true            # Auto-run migrations on startup
RUN_SEEDS=true                 # Auto-run seeds on startup
```

### Logging
```env
LOG_LEVEL=info                 # debug, info, warn, error
```

## Frontend Environment Variables

### API Configuration
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Build Configuration
```env
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=2024-01-15
```

## Docker Environment Variables

### Docker Compose Services
These are set automatically in docker-compose.yml:

**Database Service:**
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=saas_db
```

**Backend Service:**
```env
DB_HOST=database               # Service name in Docker network
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=saas_db
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://frontend:3000  # Frontend service in Docker network
```

**Frontend Service:**
```env
REACT_APP_API_BASE_URL=http://backend:5000/api  # Backend service in Docker network
```

## Environment-Specific Configurations

### Development Environment (.env.local or .env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=dev-secret-key
PORT=5000
CORS_ORIGIN=http://localhost:3000
RUN_MIGRATIONS=true
RUN_SEEDS=true
```

### Production Environment
```env
NODE_ENV=production
DB_HOST=prod-db-host
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=<strong-password>
DB_NAME=saas_prod_db
JWT_SECRET=<strong-secret-key>
PORT=5000
CORS_ORIGIN=https://yourdomain.com
RUN_MIGRATIONS=true
RUN_SEEDS=false
LOG_LEVEL=warn
```

### Testing Environment
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=saas_test_db
JWT_SECRET=test-secret-key
PORT=5000
CORS_ORIGIN=http://localhost:3000
RUN_MIGRATIONS=true
RUN_SEEDS=true
```

## Configuration by Service

### Backend (.env file in /backend directory)
Required for local development:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `NODE_ENV`, `PORT`
- `JWT_SECRET`
- `CORS_ORIGIN`

Optional with defaults:
- `DB_POOL_MIN` (default: 2)
- `DB_POOL_MAX` (default: 20)
- `JWT_EXPIRATION` (default: 24h)
- `RUN_MIGRATIONS` (default: true)
- `RUN_SEEDS` (default: true)
- `LOG_LEVEL` (default: info)

### Frontend (.env file in /frontend directory)
Required for local development:
- `REACT_APP_API_BASE_URL`

Optional:
- `REACT_APP_VERSION`
- `REACT_APP_BUILD_DATE`

## How to Set Environment Variables

### Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `.env` with your local values:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=saas_db
   JWT_SECRET=your-local-secret-key
   ```

3. Load into Node.js (dotenv package handles this):
   ```bash
   npm start
   ```

### Docker Environment
Set in `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - DB_HOST=database
      - DB_PORT=5432
      - NODE_ENV=production
```

### Production Deployment
1. **AWS/GCP/Azure**: Set in environment management console
2. **Heroku**: Use `heroku config:set VAR_NAME=value`
3. **Traditional Servers**: Set in systemd service or supervisor config
4. **Kubernetes**: Use ConfigMaps and Secrets

## Security Considerations

### Never Commit Secrets
- `.env` files are in `.gitignore` - never commit
- Always use `.env.example` with placeholder values
- Rotate `JWT_SECRET` regularly in production

### Secret Management Best Practices
1. Use separate secrets for each environment
2. Never log sensitive values
3. Use secure secret management services (AWS Secrets Manager, Vault, etc.)
4. Implement secret rotation policies
5. Audit secret access logs

### Environment Variable Validation
The application validates required environment variables on startup:
```javascript
const required = ['DB_HOST', 'DB_PORT', 'JWT_SECRET'];
required.forEach(v => {
  if (!process.env[v]) throw new Error(`Missing ${v}`);
});
```

## Default Values

| Variable | Default | Required |
|----------|---------|----------|
| DB_HOST | localhost | Yes |
| DB_PORT | 5432 | Yes |
| DB_USER | postgres | Yes |
| DB_PASSWORD | postgres | Yes |
| DB_NAME | saas_db | Yes |
| NODE_ENV | development | Yes |
| PORT | 5000 | Yes |
| JWT_SECRET | - | Yes |
| JWT_EXPIRATION | 24h | No |
| CORS_ORIGIN | http://localhost:3000 | Yes |
| DB_POOL_MIN | 2 | No |
| DB_POOL_MAX | 20 | No |
| RUN_MIGRATIONS | true | No |
| RUN_SEEDS | true | No |
| LOG_LEVEL | info | No |

## Troubleshooting

### "Missing environment variable X"
- Check `.env` file exists in correct directory
- Verify variable name spelling
- Check `.env.example` for correct format

### "Cannot connect to database"
- Verify `DB_HOST` and `DB_PORT` are correct
- Check database service is running
- Verify `DB_USER` and `DB_PASSWORD` are correct
- In Docker, use service name (e.g., `database`) not `localhost`

### "JWT token verification failed"
- Ensure `JWT_SECRET` is same in all instances
- Check token hasn't expired (24 hours default)
- Verify token format in request headers

### "CORS error in browser"
- Check `CORS_ORIGIN` matches frontend URL
- Include protocol (http:// or https://)
- In Docker, use service name: `http://frontend:3000`
