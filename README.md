# CheckIN

Ein System um die Anwesendheit von Schülerinnen und Schülern zu überprüfen 

## Installation

Über Docker Compose:
```yaml
services:
  web:
    container_name: checkin
    image: ghcr.io/davidcraftdev/checkin:stable
    restart: always
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
    ports:
      - "3030:3000"
  db:
    container_name: checkin-db
    image: postgres:16-alpine
    restart: always
    environment:
      - TZ=Europe/Berlin
      # Please replace the following environment variables with your own values, you need to set the same values in the checkin service
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - checkin_db:/var/lib/postgresql/data

volumes:
  checkin_pgdata:
    name: checkin_db
```
