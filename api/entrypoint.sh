#!/bin/sh

echo "==> Starting VimzTools Laravel API & SPA Server..."

# 1. Ensure .env file exists without overwriting existing one
cp -n .env.example .env || true

# 2. Never generate a new APP_KEY if APP_KEY is already set in environment or .env
if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=base64:" .env; then
    echo "==> Generating initial APP_KEY..."
    php artisan key:generate --force || true
else
    echo "==> Using existing stable APP_KEY."
fi

# 3. Ensure persistent SQLite path exists if DB_DATABASE points to /data/database.sqlite
if [ -n "$DB_DATABASE" ] && [ "$DB_CONNECTION" != "pgsql" ]; then
    DB_DIR=$(dirname "$DB_DATABASE")
    mkdir -p "$DB_DIR" || true
    if [ ! -f "$DB_DATABASE" ]; then
        touch "$DB_DATABASE" || true
    fi
    chmod 666 "$DB_DATABASE" || true
fi

# 4. Run non-destructive database migrations
php artisan migrate --force || true

# 5. Only seed if the users table is completely empty (never overwrite production data)
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); exit(\App\Models\User::count() === 0 ? 0 : 1);" && php artisan db:seed --force || true

# 6. Serve SPA static assets and Laravel API on PORT
echo "==> Listening on 0.0.0.0:${PORT:-8080}"
php -S 0.0.0.0:${PORT:-8080} -t public public/router.php
