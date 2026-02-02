# Database & Configuration Guide

## Overview

The PHP implementation supports two database backends with automatic fallback and comprehensive configuration options.

---

## Database Support

### Supported Databases

1. **PostgreSQL** (Recommended for production)
   - Full feature support
   - 100% compatible with TypeScript/Prisma schema
   - Uses native PostgreSQL features (ENUM types, arrays, etc.)

2. **SQLite** (Automatic fallback)
   - Zero configuration required
   - Perfect for development and testing
   - Maintains functional parity with PostgreSQL
   - Database file: `data/database.sqlite`

---

## Database Configuration

### PostgreSQL Connection

Set the `POSTGRES_URL` environment variable:

```bash
export POSTGRES_URL="postgres://username:password@host:port/database"
```

**Examples:**

```bash
# Local PostgreSQL
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/checkin"

# Remote PostgreSQL
POSTGRES_URL="postgres://user:pass@db.example.com:5432/mydb"

# Docker Compose
POSTGRES_URL="postgres://postgres:postgres@db:5432/postgres"
```

### SQLite Fallback

SQLite is used automatically when:
- `POSTGRES_URL` is not set
- `POSTGRES_URL` is empty or set to `false`
- PostgreSQL connection fails

**No configuration needed!** The database file is created automatically at:
```
data/database.sqlite
```

---

## Configuration Methods

The application supports three configuration methods with the following priority:

1. **Environment Variables** (Highest priority - overrides everything)
2. **Config File** (`data/config.json`)
3. **Default Values** (Lowest priority)

### Method 1: Environment Variables

Set environment variables to configure the application:

```bash
# Database
export POSTGRES_URL="postgres://..."

# Application Settings
export MAINTENANCE=false
export SCHOOL_NAME="My School"

# Authentication
export DEFAULT_LOGIN_USERNAME=admin
export DEFAULT_LOGIN_PASSWORD=SecurePassword123!

# LDAP Configuration
export LDAP_ENABLE=true
export LDAP_URI=ldap://ldap.example.com
export LDAP_TLS_REJECT_UNAUTHORIZED=false
export LDAP_BIND_DN="cn=admin,dc=example,dc=com"
export LDAP_BIND_PASSWORD="ldappassword"
export LDAP_SEARCH_BASE="dc=example,dc=com"
export LDAP_USER_SEARCH_FILTER="(objectClass=person)"
export LDAP_PASSWORD_RESET_URL="https://password.example.com"
```

### Method 2: Config File

Edit `data/config.json`:

```json
{
  "MAINTENANCE": false,
  "SCHOOL_NAME": "Example School",
  "DEFAULT_LOGIN": {
    "USERNAME": "admin",
    "PASSWORD": "ChangeThisPassword123!"
  },
  "LDAP": {
    "ENABLE": false,
    "URI": "ldap://ldap.example.com",
    "TLS_REJECT_UNAUTHORIZED": false,
    "BIND_CREDENTIALS": {
      "DN": "cn=admin,dc=example,dc=com",
      "PASSWORD": ""
    },
    "SEARCH_BASE": "dc=example,dc=com",
    "USER_SEARCH_FILTER": "(objectClass=person)",
    "PASSWORD_RESET_URL": ""
  }
}
```

### Method 3: Mixed Configuration

Use config file for defaults and environment variables for overrides:

```bash
# Config file has basic settings
# Override specific values via environment
export LDAP_ENABLE=true
export LDAP_URI=ldap://production.ldap.com
```

---

## Environment Variables Reference

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | PostgreSQL connection string (optional) | `postgres://user:pass@host:5432/db` |

### Application Settings

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `MAINTENANCE` | Maintenance mode | `false` | boolean |
| `SCHOOL_NAME` | School/organization name | `""` | string |

### Authentication

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `DEFAULT_LOGIN_USERNAME` | Default admin username | `admin` | string |
| `DEFAULT_LOGIN_PASSWORD` | Default admin password | auto-generated | string |

### LDAP Configuration

| Variable | Description | Type |
|----------|-------------|------|
| `LDAP_ENABLE` | Enable LDAP authentication | boolean |
| `LDAP_URI` | LDAP server URI | string |
| `LDAP_TLS_REJECT_UNAUTHORIZED` | Reject unauthorized TLS | boolean |
| `LDAP_BIND_DN` | Bind DN for LDAP | string |
| `LDAP_BIND_PASSWORD` | Bind password | string |
| `LDAP_SEARCH_BASE` | Search base DN | string |
| `LDAP_USER_SEARCH_FILTER` | User search filter | string |
| `LDAP_PASSWORD_RESET_URL` | Password reset URL | string |

---

## Usage Examples

### Development (SQLite)

```bash
# No database configuration needed
cd php
composer dump-autoload
php -S localhost:8000 -t public

# Access: http://localhost:8000
# Database: data/database.sqlite
```

### Production (PostgreSQL)

```bash
# Set PostgreSQL connection
export POSTGRES_URL="postgres://user:pass@db.host:5432/checkin"

# Start application
docker-compose up -d

# Access: http://localhost:8080
```

### Docker Compose (PostgreSQL)

```yaml
services:
  web-php:
    environment:
      - POSTGRES_URL=postgres://postgres:postgres@db:5432/postgres
      - SCHOOL_NAME=My School
      - LDAP_ENABLE=true
      - LDAP_URI=ldap://ldap.myschool.edu
  
  db:
    image: postgres:18-alpine
    environment:
      - POSTGRES_PASSWORD=postgres
```

### Testing Configuration

Run the test script to verify configuration:

```bash
cd php
php test-db-config.php
```

---

## Schema Compatibility

Both databases maintain identical schemas with driver-specific optimizations:

| Feature | PostgreSQL | SQLite | Compatible |
|---------|-----------|--------|------------|
| Tables | 6 | 6 | ✅ |
| Field Names | Exact | Exact | ✅ |
| CUID Generation | MD5-based | Hex-based | ✅ |
| Array Fields | `TEXT[]` | `TEXT` (JSON) | ✅ |
| ENUM Types | Native ENUM | CHECK constraint | ✅ |
| Foreign Keys | ON DELETE CASCADE | ON DELETE CASCADE | ✅ |

---

## Troubleshooting

### Database Connection Issues

**Problem:** PostgreSQL connection fails

**Solution:** Check the error logs. Application will automatically fallback to SQLite.

```bash
# View logs
docker-compose logs web-php

# Expected message:
# "PostgreSQL connection failed: ... - Falling back to SQLite"
# "Connected to SQLite database: data/database.sqlite"
```

### Configuration Not Applied

**Problem:** Environment variables not being used

**Solution:** 

1. Verify environment variables are set:
   ```bash
   echo $POSTGRES_URL
   echo $SCHOOL_NAME
   ```

2. Restart the application to pick up changes:
   ```bash
   docker-compose restart
   ```

3. Check that variables are correctly formatted:
   - Boolean: `true` or `false` (lowercase)
   - String: any value

### SQLite Permission Issues

**Problem:** Cannot create `data/database.sqlite`

**Solution:** Ensure the `data/` directory is writable:

```bash
mkdir -p php/data
chmod 755 php/data
```

---

## Migration Between Databases

### PostgreSQL → SQLite

Not recommended for production, but possible for testing:

1. Export data from PostgreSQL
2. Remove `POSTGRES_URL` environment variable
3. Restart application (will use SQLite)
4. Import data into SQLite

### SQLite → PostgreSQL

For moving to production:

1. Set `POSTGRES_URL` environment variable
2. Restart application
3. Application will use PostgreSQL
4. Run schema initialization
5. Migrate data (manual process or use backup/restore)

---

## Performance Considerations

### PostgreSQL

- ✅ Recommended for production
- ✅ Better performance with large datasets
- ✅ Native array and ENUM support
- ✅ Advanced indexing and optimization

### SQLite

- ✅ Perfect for development
- ✅ Zero configuration
- ✅ Single file database
- ⚠️ Limited concurrent write performance
- ⚠️ Not recommended for high-traffic production

---

## Security Notes

1. **Change Default Password:** Always change `DEFAULT_LOGIN_PASSWORD` in production
2. **Secure PostgreSQL:** Use strong passwords and SSL connections
3. **File Permissions:** Ensure `data/` directory has proper permissions
4. **LDAP Credentials:** Store LDAP passwords securely (use environment variables)
5. **Config File:** Protect `data/config.json` from unauthorized access

---

## Support

For issues or questions:
- Check error logs: `docker-compose logs`
- Run test script: `php test-db-config.php`
- Review this documentation
- Check environment variables: `printenv | grep -E "(POSTGRES|LDAP|MAINTENANCE)"`
