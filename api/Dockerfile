FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql pdo_mysql bcmath mbstring \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p bootstrap/cache storage/framework/sessions storage/framework/views storage/framework/cache storage/logs database \
    && chmod -R 777 bootstrap/cache storage database

RUN touch database/database.sqlite && chmod 666 database/database.sqlite

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "php artisan key:generate --force || true; php artisan migrate --force || true; php artisan db:seed --force || true; php -S 0.0.0.0:${PORT:-8080} -t public"]
