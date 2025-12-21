# Performance Optimization Guide

Guide to optimizing and monitoring performance in the Multi-Tenant SaaS Platform.

## Database Performance

### Query Optimization

#### Current Indexes
The application includes the following indexes:

```sql
-- Primary keys (automatic)
PRIMARY KEY (id)

-- Foreign keys (improve JOIN performance)
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
FOREIGN KEY (created_by) REFERENCES users(id)
FOREIGN KEY (project_id) REFERENCES projects(id)
```

#### Recommended Additional Indexes

```sql
-- Improve tenant filtering (most common filter)
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- Improve user lookups by email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);

-- Improve task queries
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

-- Improve project queries
CREATE INDEX idx_projects_tenant_status ON projects(tenant_id, status);

-- Improve audit log queries
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### Add Indexes

```bash
# Connect to database
psql -U postgres -d saas_db

# Run create index commands
CREATE INDEX idx_users_tenant ON users(tenant_id);
-- ... run other CREATE INDEX commands
```

### Query Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE tenant_id = '123';

-- Expected output shows:
-- - Execution time (actual)
-- - Planning time
-- - Sequential scan vs Index scan (Index scan is better)
-- - Rows returned
```

### Slow Query Log

```sql
-- Enable slow query logging (PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
SELECT pg_reload_conf();

-- View slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Connection Pooling

Current pool configuration:

```env
DB_POOL_MIN=2      # Minimum idle connections
DB_POOL_MAX=20     # Maximum total connections
```

#### Tuning Connection Pool

```env
# For low traffic (< 100 concurrent users)
DB_POOL_MIN=2
DB_POOL_MAX=10

# For medium traffic (100-1000 concurrent users)
DB_POOL_MIN=5
DB_POOL_MAX=50

# For high traffic (> 1000 concurrent users)
DB_POOL_MIN=10
DB_POOL_MAX=100
```

## Backend Performance

### Node.js Optimization

#### Memory Management

```javascript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`
    RSS: ${Math.round(usage.rss / 1024 / 1024)} MB
    Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB
    Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)} MB
  `);
}, 30000);
```

#### Enable Clustering (for multi-core systems)

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  // Create worker process for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, spawning new`);
    cluster.fork();
  });
} else {
  // Start express server in worker process
  app.listen(5000);
}
```

### API Response Time Optimization

#### Pagination

The API should implement pagination to reduce response payload:

```javascript
// Example: Get projects with pagination
GET /api/projects?page=1&limit=20

// Response
{
  success: true,
  data: [{ id, name, ... }],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}
```

#### Selective Field Projection

```javascript
// Get only needed fields
SELECT id, name, status FROM projects WHERE tenant_id = '123';

// Instead of
SELECT * FROM projects WHERE tenant_id = '123';
```

#### Caching

Implement Redis caching for frequently accessed data:

```javascript
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Cache user profile for 5 minutes
app.get('/api/users/me', async (req, res) => {
  const cacheKey = `user:${req.user.id}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Get from database
  const user = await getUserFromDB(req.user.id);
  
  // Store in cache
  await client.setex(cacheKey, 300, JSON.stringify(user));
  
  res.json(user);
});
```

## Frontend Performance

### React Optimization

#### Code Splitting

```javascript
// Use React.lazy for route-based code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </Suspense>
  );
}
```

#### Memoization

```javascript
// Prevent unnecessary re-renders
const ProjectCard = React.memo(({ project, onEdit }) => {
  return <div>{project.name}</div>;
});

// or use useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

#### Virtual Scrolling for Large Lists

```javascript
// For lists with 1000+ items, use react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

### Bundle Size Optimization

```bash
# Analyze bundle size
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Expected output shows which dependencies take most space
# Look for opportunities to:
# - Replace large libraries with smaller alternatives
# - Remove unused dependencies
# - Use dynamic imports for large libraries
```

### Lazy Loading Images

```javascript
// Use native lazy loading
<img src="image.jpg" loading="lazy" alt="description" />

// Or use IntersectionObserver
import useIntersectionObserver from './hooks/useIntersectionObserver';

const LazyImage = ({ src }) => {
  const [imageRef, isVisible] = useIntersectionObserver();
  return (
    <img
      ref={imageRef}
      src={isVisible ? src : 'placeholder.jpg'}
      alt="lazy loaded"
    />
  );
};
```

## Monitoring and Metrics

### Health Checks

```bash
# Check application health
curl http://localhost:5000/api/health

# Response
{
  "status": "ok",
  "database": "connected"
}
```

### Logging

Enable structured logging for better debugging:

```javascript
const logger = {
  info: (msg, meta) => console.log(JSON.stringify({ level: 'info', msg, ...meta })),
  error: (msg, error) => console.error(JSON.stringify({ level: 'error', msg, error })),
};

// Usage
logger.info('User logged in', { userId: user.id, timestamp: new Date() });
```

### Monitoring with Docker

```bash
# Real-time resource usage
docker stats

# View logs with timestamps
docker-compose logs --timestamps -f backend

# Check container memory limit
docker inspect <container_id> | grep Memory
```

### Response Time Tracking

Add middleware to track response times:

```javascript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
  });
  
  next();
});
```

## Load Testing

### Using Apache Bench

```bash
# Install
brew install httpd  # macOS
# or apt-get install apache2-utils  # Linux

# Test endpoint
ab -n 1000 -c 100 http://localhost:5000/api/health

# -n: total requests
# -c: concurrent requests
```

### Using wrk

```bash
# Install from https://github.com/wg/wrk

# Test with 4 threads, 100 connections, 30 seconds
wrk -t4 -c100 -d30s http://localhost:5000/api/health

# Output shows:
# - Requests/sec
# - Latency (avg, stdev, max)
# - Transfer rate
```

### Example Load Test Results

Expected baseline performance (on modern hardware):

```
Requests per second:   2000+
Average latency:       5-10ms
P99 latency:          50-100ms
Error rate:           < 1%
```

## Optimization Checklist

### Backend
- [ ] Database indexes created for common queries
- [ ] Query performance analyzed (EXPLAIN ANALYZE)
- [ ] Connection pool size tuned for expected load
- [ ] Slow query logging enabled
- [ ] Caching implemented for frequently accessed data
- [ ] API responses paginated for large datasets
- [ ] Response times monitored and logged
- [ ] Health check endpoint working
- [ ] Clustering enabled for multi-core CPUs
- [ ] Error handling doesn't cause memory leaks

### Frontend
- [ ] Code splitting implemented for routes
- [ ] Unused dependencies removed
- [ ] Bundle size analyzed and optimized
- [ ] Images lazy loaded
- [ ] React components memoized where appropriate
- [ ] Virtual scrolling for large lists
- [ ] Lighthouse performance score > 90
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 3s

### Database
- [ ] All necessary indexes created
- [ ] Regular VACUUM and ANALYZE
- [ ] Connection pooling configured
- [ ] Query execution plans reviewed
- [ ] Backup strategy in place
- [ ] Replication configured (for high availability)

### DevOps
- [ ] Application health monitored
- [ ] Logs aggregated and searchable
- [ ] Resource limits set on containers
- [ ] Auto-scaling configured
- [ ] Database backups automated
- [ ] Security patches applied regularly

## Production Performance Targets

| Metric | Target | Acceptable |
|--------|--------|-----------|
| API Response Time (P95) | < 100ms | < 500ms |
| API Response Time (P99) | < 500ms | < 1000ms |
| Database Query Time | < 50ms | < 200ms |
| Error Rate | < 0.1% | < 1% |
| Availability | 99.9% | 99% |
| Frontend Load Time | < 2s | < 5s |
| Lighthouse Score | 90+ | 80+ |

## References

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)
- [React Performance](https://react.dev/reference/react/useMemo)
- [Docker Performance](https://docs.docker.com/config/containers/resource_constraints/)
- [Web Vitals](https://web.dev/vitals/)
