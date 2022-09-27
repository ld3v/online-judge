FROM php:7.4-fpm-alpine

WORKDIR /var/www/html

RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

COPY . .