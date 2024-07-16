FROM php:8.3-fpm-alpine

# Installa le dipendenze necessarie
RUN apk add --no-cache \
    libpq-dev \
    mariadb-client \
    && docker-php-ext-install pdo_mysql
