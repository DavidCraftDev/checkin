# syntax=docker/dockerfile:labs
FROM node:24.11.1-alpine3.23 AS build
#SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache openssl binutils file && \
    npm clean-install && \
    npx prisma generate && \
    npx next build && \
    npm cache clean --force && \
    find node_modules -name "*.map" -delete && \
    find /app/node_modules -name "*.node" -type f -exec strip -s {} \; && \
    find /app/node_modules -name "*.node" -type f -exec file {} \;

FROM node:24.11.1-alpine3.23
COPY --chmod=775                        scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=strip --chown=nobody:nobody /app                  /app
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
