# Multi-stage build for backend
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (no lockfile)
# Use npm install with production-only to avoid dev deps
RUN npm install --omit=dev

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install curl and postgresql-client for health checks and database readiness
RUN apk add --no-cache curl postgresql-client bash

# Copy dependencies from builder
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs

# Make entrypoint script executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application with migrations and seed data
ENTRYPOINT ["/app/entrypoint.sh"]
