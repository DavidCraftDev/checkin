# CheckIN System (Laravel Version)

This is a complete rewrite of the CheckIN system using Laravel and Blade templates.

## Prerequisites

- Docker and Docker Compose
- Or: PHP 8.2+, Composer, and PostgreSQL

## Installation & Setup

1.  **Build and Start with Docker**:
    ```bash
    docker compose up -d --build
    ```

2.  **Install Dependencies**:
    Since the vendor folder is not checked in, you need to install dependencies inside the container:
    ```bash
    docker compose exec checkin composer install
    ```

3.  **Environment Setup**:
    Copy the example environment file and generate the application key:
    ```bash
    docker compose exec checkin cp .env.example .env
    docker compose exec checkin php artisan key:generate
    ```

4.  **Database Migration**:
    Run the migrations to create the database tables:
    ```bash
    docker compose exec checkin php artisan migrate
    ```

    *Note: This will create empty tables. If you need to migrate data from the old system, you will need to write a custom migration script.*

5.  **Create Admin User**:
    You can use Tinker to create an initial user:
    ```bash
    docker compose exec checkin php artisan tinker
    ```
    Inside Tinker:
    ```php
    \App\Models\User::create([
        'username' => 'admin',
        'displayname' => 'Administrator',
        'password' => bcrypt('password'),
        'permission' => 1
    ]);
    ```

6.  **Access the Application**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

- **Authentication**: Login with Username/Password.
- **Dashboard**: View your attendance history.
- **Check-in**: Record your attendance (Self Study or Course).
- **Administration**: View list of users.

## Missing Features / Future Work

The following features from the legacy application have not yet been ported:
- LDAP Integration.
- WebUntis Integration.
- QRCode Generation/Scanning.
- Sponsorenlauf Module.
- Advanced Reports/Export.

## Legacy Code

The previous Next.js application has been moved to the `legacy_nextjs/` directory.
