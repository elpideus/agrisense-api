#!/bin/sh

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$SEED" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

echo "Starting application..."
exec "$@"
