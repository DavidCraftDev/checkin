# syntax=docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e
FROM --platform="$BUILDPLATFORM" node:24.21.0-alpine3.23@sha256:9ec4a2e289874ed0d722e1772ec2de45d2801541db8612f3638b26f128c69ac2 AS build
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
WORKDIR /app
RUN apk upgrade --no-cache -a
RUN npm clean-install
RUN npx prisma generate
RUN npx next build
RUN npm cache clean --force
RUN find node_modules -type f -name "*.map" -delete
RUN find /app/node_modules -name "*.node" -type f -delete

FROM node:24.21.0-alpine3.23@sha256:9ec4a2e289874ed0d722e1772ec2de45d2801541db8612f3638b26f128c69ac2
COPY --chmod=775                        scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=build --chown=nobody:nobody /app                  /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache tzdata tini openssl
USER nobody
WORKDIR /app
ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK CMD wget -q http://localhost:3000 -O /dev/null || exit 1
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXTAUTH_URL=http://localhost:3000
EXPOSE 3000/tcp
