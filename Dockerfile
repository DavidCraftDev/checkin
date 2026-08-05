# syntax=docker/dockerfile:1.26.0@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32
FROM --platform="$BUILDPLATFORM" node:24.19.0-alpine3.23@sha256:244cc2b53f46f9e876304391d17682b0ddae9ac33491f4857e25e35a36ba7995 AS build
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

FROM node:24.19.0-alpine3.23@sha256:244cc2b53f46f9e876304391d17682b0ddae9ac33491f4857e25e35a36ba7995
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
