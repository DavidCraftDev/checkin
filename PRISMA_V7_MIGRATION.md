# Prisma v6 → v7 Migration Changelog

## Migration Date
December 6, 2024

## Overview
Successfully migrated from Prisma ORM v6.19.0 to v7.1.0 using Direct TCP connection with PostgreSQL adapter.

## Breaking Changes

### 1. Client Generation
- **Before**: `generator client { provider = "prisma-client-js" }`
- **After**: `generator client { provider = "prisma-client" }`
- **Impact**: Client generation now produces TypeScript source files that require an additional postgenerate step.

### 2. Schema Configuration
- **Before**: Database URL configured in `schema.prisma` with `url = env("POSTGRES_URL")`
- **After**: Database URL configured in `prisma.config.ts`
- **Impact**: The schema file no longer contains the connection URL.

### 3. Seed Configuration
- **Before**: Seed command in `package.json` under `prisma.seed`
- **After**: Seed command in `prisma.config.ts` under `migrations.seed`
- **Impact**: Seed configuration centralized in Prisma config file.

### 4. Runtime Client Instantiation
- **Before**: `const prisma = new PrismaClient()`
- **After**: 
  ```typescript
  import { Pool } from 'pg';
  import { PrismaPg } from '@prisma/adapter-pg';
  
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  ```
- **Impact**: Direct TCP connection with adapter pattern required for all PrismaClient instantiations.

## New Dependencies

### Runtime Dependencies
- `@prisma/client@7.1.0` (upgraded from 6.19.0)
- `@prisma/adapter-pg@7.1.0` (new)
- `pg@8.16.3` (new)

### Development Dependencies
- `prisma@7.1.0` (upgraded from 6.19.0)
- `@types/pg@8.15.6` (new)
- `dotenv@17.2.3` (new)
- `tsx@4.21.0` (new)

## File Changes

### Modified Files
1. **prisma/schema.prisma**
   - Changed generator provider to `prisma-client`
   - Added explicit output path
   - Removed `url` from datasource

2. **app/src/modules/db.ts**
   - Added dotenv import
   - Added PostgreSQL adapter setup
   - Added environment variable validation
   - Configured connection pool with optimal settings

3. **scripts/seed.ts**
   - Added dotenv import
   - Added PostgreSQL adapter setup
   - Added environment variable validation
   - Configured connection pool for seed operations

4. **package.json**
   - Upgraded Prisma packages
   - Added new dependencies
   - Removed `prisma.seed` configuration
   - Added `generate` script that includes postgenerate
   - Added `postgenerate` script

### New Files
1. **prisma.config.ts** - Centralized Prisma CLI configuration
2. **scripts/postgenerate.mjs** - Automated script to create TypeScript export compatibility
3. **.env.example** - Template for environment variables

## Configuration Details

### Connection Pool Settings

#### Application Pool (app/src/modules/db.ts)
- `max: 20` - Maximum number of connections
- `idleTimeoutMillis: 30000` - 30 seconds idle timeout
- `connectionTimeoutMillis: 2000` - 2 seconds connection timeout

#### Seed Pool (scripts/seed.ts)
- `max: 5` - Maximum number of connections (lower for seed operations)
- `idleTimeoutMillis: 10000` - 10 seconds idle timeout
- `connectionTimeoutMillis: 5000` - 5 seconds connection timeout

## Environment Variables

Required environment variable:
- `POSTGRES_URL` - PostgreSQL connection string

Example: `postgresql://user:password@host:port/database`

See `.env.example` for a complete template.

## Build & Deployment

### Development
```bash
# Generate Prisma Client
npm run generate

# Run development server
npm run dev
```

### Production
```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run generate

# Build application
npm run build

# Run migrations
npx prisma migrate deploy

# Seed database (if needed)
npx prisma db seed

# Start production server
npm start
```

## Prisma Accelerate Status

This project **does not use Prisma Accelerate**. The migration adopts Direct TCP connections with the PostgreSQL adapter for optimal v7 performance.

## Compatibility Requirements

- **Node.js**: ≥ 20.19 (tested with 20.19.6 ✅)
- **TypeScript**: ≥ 5.4 (tested with 5.9.3 ✅)
- **PostgreSQL**: Any version supported by the `pg` driver

## Testing Results

✅ Prisma client generation successful  
✅ TypeScript compilation passing  
✅ Postgenerate automation working  
✅ Code review passing  
✅ Security scan (CodeQL) - no vulnerabilities found  

## Known Limitations

- Seed script and migrations require a live database connection
- Full Next.js build requires internet access for external resources (fonts, etc.)

## Rollback Procedure

If you need to rollback to Prisma v6:

1. Checkout the previous commit before this migration
2. Run `npm install` to restore v6 packages
3. Run `npx prisma generate` to regenerate v6 client
4. Remove `prisma.config.ts`, `scripts/postgenerate.mjs`, and `.env.example`

## Support & Resources

- [Prisma v7 Documentation](https://www.prisma.io/docs)
- [Prisma v7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7)
- [PostgreSQL Adapter Documentation](https://www.prisma.io/docs/orm/overview/databases/postgresql)

## Security Summary

No security vulnerabilities were introduced or discovered during this migration. CodeQL analysis completed with zero alerts.
