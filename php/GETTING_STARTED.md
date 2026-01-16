# PHP Implementation

This directory contains a PHP reimplementation of the CheckIN backend system.

## Quick Start

### Using Docker Compose
```bash
cd php
docker-compose up -d
```

The API will be available at http://localhost:8080

### Using PHP Built-in Server
```bash
cd php
composer install
export POSTGRES_URL="postgres://user:pass@localhost:5432/checkin"
composer start
```

The API will be available at http://localhost:8000

## Testing

You can test the endpoints using curl:

### Health Check
```bash
curl http://localhost:8080/health
```

### Login
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourPassword"}'
```

### User Overview (requires authentication)
```bash
curl http://localhost:8080/api/v1/overview/user \
  -H "Cookie: session=YOUR_SESSION_ID"
```

See [README.md](README.md) for full documentation.
