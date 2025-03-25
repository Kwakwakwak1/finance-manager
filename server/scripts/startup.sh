#!/bin/sh

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Wait for database to be available
echo "Waiting for PostgreSQL to be available..."
/app/scripts/wait-for-postgres.sh

# Run database migration if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  node /app/migrations/migrate.js
else
  echo "Skipping database migrations"
fi

# Start the API server
echo "Starting Finance Manager API server..."
node /app/server.js