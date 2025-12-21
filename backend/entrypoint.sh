#!/bin/bash
set -e

echo "================================"
echo "Multi-Tenant SaaS - Startup"
echo "================================"
echo ""

# Wait for database to be ready
echo "Waiting for database to be ready..."
for i in {1..30}; do
    if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
        echo "✓ Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ Database failed to start"
        exit 1
    fi
    echo "Attempt $i: Waiting for database..."
    sleep 1
done

echo ""
echo "Running database migrations..."
node /app/scripts/init-db.js

echo ""
echo "================================"
echo "Starting application server..."
echo "================================"
echo ""

# Start the application
node /app/index.js
