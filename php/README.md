# CheckIN - PHP Implementation

This is a PHP reimplementation of the CheckIN attendance system, providing API-compatible backend functionality.

## Overview

The PHP version provides the core backend API functionality of the original Next.js/TypeScript CheckIN system, including:
- User authentication and session management
- Health check endpoints
- User overview API
- Group overview API
- PostgreSQL database integration

## Requirements

- PHP 8.1 or higher
- PostgreSQL 16
- PDO PostgreSQL extension
- Composer (for dependency management)

## Installation

### Using Docker Compose

The PHP implementation can be integrated with the existing Docker setup:

```yaml
services:
  web-php:
    container_name: checkin-php
    build: ./php
    restart: always
    depends_on:
      - db
    environment:
      - TZ=Europe/Berlin
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres
      - DEFAULT_LOGIN_USERNAME=admin
      - DEFAULT_LOGIN_PASSWORD=YourSecurePassword
      - MAINTENANCE=false
    ports:
      - "8080:80"
    volumes:
      - "/home/checkin/data:/app/data"
```

### Standalone Installation

1. Install dependencies:
```bash
cd php
composer install
```

2. Set environment variables:
```bash
export POSTGRES_URL="postgres://user:password@host:5432/dbname"
export DEFAULT_LOGIN_USERNAME="admin"
export DEFAULT_LOGIN_PASSWORD="secure_password"
```

3. Start the PHP development server:
```bash
composer start
# or
php -S localhost:8000 -t public
```

4. Access the API at http://localhost:8000

## API Endpoints

### Health Check
```
GET /health
```
Returns system health status including database connection and version.

### Authentication
```
POST /login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

```
POST /logout
```

### User Overview
```
GET /api/v1/overview/user?userID={id}&startCW={week}&startYear={year}
```
Requires authentication. Users can view their own data, higher permission levels can view any user.

### Group Overview
```
GET /api/v1/overview/group?group={groupName}&cw={week}&year={year}
```
Requires authentication with permission level 1 or higher.

## Configuration

Configuration is managed through:
1. `data/config.json` file (auto-created on first run)
2. Environment variables (take precedence over config file)

### Environment Variables

- `POSTGRES_URL` - PostgreSQL connection string (required)
- `MAINTENANCE` - Enable maintenance mode (true/false)
- `SCHOOL_NAME` - School name for display
- `DEFAULT_LOGIN_USERNAME` - Default admin username
- `DEFAULT_LOGIN_PASSWORD` - Default admin password

## Database

The PHP implementation uses the same PostgreSQL database schema as the TypeScript version defined in `prisma/schema.prisma`. Ensure migrations are run before using the PHP backend.

## Architecture

```
php/
├── public/
│   └── index.php          # Entry point
├── src/
│   ├── Core/
│   │   ├── Config.php     # Configuration management
│   │   ├── Database.php   # Database abstraction layer
│   │   ├── Response.php   # HTTP response helpers
│   │   └── Router.php     # URL routing
│   ├── Auth/
│   │   ├── AuthManager.php    # Authentication logic
│   │   └── SessionManager.php # Session management
│   └── Controllers/
│       ├── HealthController.php
│       ├── HomeController.php
│       ├── AuthController.php
│       └── Api/
│           ├── UserOverviewController.php
│           └── GroupOverviewController.php
└── composer.json
```

## Security

- Passwords are hashed using bcrypt
- Sessions use secure, HTTP-only cookies
- SQL queries use prepared statements (PDO)
- CSRF protection should be added for production use

## Comparison with TypeScript Version

| Feature | TypeScript | PHP |
|---------|-----------|-----|
| Framework | Next.js 15 | Custom (lightweight) |
| Database ORM | Prisma | PDO (native) |
| Session Storage | Database | Database |
| Auth | Custom + LDAP | Custom (LDAP TODO) |
| API Routes | ✓ | ✓ |
| Frontend | React 19 | Not included |

## Development

The PHP implementation focuses on backend API functionality. For the complete web interface, use the Next.js version or develop a separate frontend that consumes these APIs.

## License

Same as the main CheckIN project.
