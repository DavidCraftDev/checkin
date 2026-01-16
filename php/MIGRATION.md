# CheckIN PHP Migration Guide

This guide helps you migrate from the TypeScript/Next.js version to the PHP implementation, or run them side-by-side.

## Running Side-by-Side

The PHP and TypeScript versions can run simultaneously on the same database:

1. **TypeScript version** on port 3000
2. **PHP version** on port 8000 or 8080

Both use the same PostgreSQL database schema, so they share:
- User accounts
- Sessions
- Attendances
- Events
- All other data

### Setup for Side-by-Side Operation

1. Start the TypeScript version normally:
```bash
npm run build
npm run start
```

2. Start the PHP version:
```bash
cd php
export POSTGRES_URL="postgres://user:pass@localhost:5432/checkin"
composer start
```

3. Access:
- Frontend (TypeScript): http://localhost:3000
- Backend API (PHP): http://localhost:8000

## Full Migration to PHP

If you want to use only the PHP backend:

### Step 1: Prepare Database
The database schema should already be set up from the TypeScript version. If not, run:
```bash
npx prisma migrate deploy
```

### Step 2: Configure PHP
1. Copy environment settings:
```bash
cd php
cp .env.example .env
# Edit .env with your settings
```

2. Install dependencies:
```bash
composer install
```

### Step 3: Start PHP Backend
Using Docker:
```bash
docker-compose up -d
```

Or standalone:
```bash
composer start
```

### Step 4: Frontend Options

The PHP implementation is backend-only. For frontend, you have options:

1. **Keep using Next.js frontend** - Point it to PHP backend
2. **Create new frontend** - Use any framework (Vue, React, etc.)
3. **Use as API only** - For mobile apps or other clients

## API Compatibility

The PHP version implements compatible endpoints:

| Endpoint | TypeScript | PHP | Status |
|----------|-----------|-----|--------|
| GET /health | ✓ | ✓ | Compatible |
| POST /login | ✓ | ✓ | Compatible |
| POST /logout | ✓ | ✓ | Compatible |
| GET /api/v1/overview/user | ✓ | ✓ | Compatible |
| GET /api/v1/overview/group | ✓ | ✓ | Compatible |

## Performance Comparison

Expected performance characteristics:

- **Startup Time**: PHP is faster (no build step)
- **Cold Start**: PHP has no cold start issues
- **Memory Usage**: PHP typically uses less memory
- **Request Handling**: Similar for API requests
- **Database Queries**: Both use connection pooling

## Limitations of PHP Version

The initial PHP implementation does not include:
- Frontend UI (React components)
- Server-side rendering (SSR)
- Some advanced features (Untis integration, LDAP auto-detection)
- QR code generation
- Excel export functionality

These can be added incrementally based on needs.

## Rollback Plan

To rollback to TypeScript:

1. Stop PHP service:
```bash
docker-compose down
# or kill the PHP process
```

2. Start TypeScript version:
```bash
npm run start
```

The database remains unchanged, so no data is lost.
