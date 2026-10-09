#!/bin/sh

echo "==> Starting VimzTools Laravel API..."

# Generate app key if needed
php artisan key:generate --force || true

# Run database migration and seeding
php artisan migrate --force || true
php artisan db:seed --force || true

# Serve API directly on PORT
echo "==> Listening on 0.0.0.0:${PORT:-8080}"
php -S 0.0.0.0:${PORT:-8080} -t public
