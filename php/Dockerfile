FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    libldap2-dev \
    libgd-dev \
    && docker-php-ext-configure ldap \
    && docker-php-ext-install pdo pdo_pgsql ldap gd \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && mkdir -p /var/run/php \
    && chown www-data:www-data /var/run/php

# Configure PHP-FPM
RUN echo "listen = /var/run/php/php-fpm.sock" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "listen.owner = www-data" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "listen.group = www-data" >> /usr/local/etc/php-fpm.d/www.conf

EXPOSE 80

# Start PHP-FPM and nginx
CMD service php8.2-fpm start && nginx -g 'daemon off;'
