# CheckIN

Ein System um die Anwesendheit von Schülern zu überprüfen 

## Installation

Über Docker Compose:
```yaml
services:
  web:
    image: ghcr.io/davidcraftdev/checkin:master
    restart: unless-stopped
    depends_on:
      - db
    environment:
      - TZ=Europe/Berlin
      # Please replace the following environment variables with your own values, you need to set the same values in the db service
      - POSTGRES_PRISMA_URL=postgres://postgres:postgres@db:5432/postgres
      # Please replace the following environment variables with your own random secret
      - NEXTAUTH_SECRET=YOUR_SECRET
      # Please set own default admin credentials
      - DEFAULT_ADMIN_USERNAME=OwnUsername
      - DEFAULT_ADMIN_PASSWORD=OwnPassword
      # Provide the URL of your CheckIN Web instance here
      - NEXTAUTH_URL=http://localhost:3030
    ports:
      - "3030:3000"
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      - TZ=Europe/Berlin
      # Please replace the following environment variables with your own values, you need to set the same values in the checkin service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata: {}
```