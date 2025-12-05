# syntax=docker/dockerfile:labs
FROM --platform="$BUILDPLATFORM" node:24.11.1-alpine3.21 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    TARGETARCH
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates file openssl && \
    npm install --global clean-modules && \
    if [ "$TARGETARCH" = "amd64" ]; then \
      npm_config_arch=x64 npm_config_target_arch=x64 npm clean-install && \
      npm_config_arch=x64 npm_config_target_arch=x64 npx prisma generate && \
      npm_config_arch=x64 npm_config_target_arch=x64 npx next build && \
      for file in $(find /app/node_modules -name "*.node" -type f -exec file {} \; | grep -v "x86-64\|x86_64" | grep "aarch64\|arm64" | sed "s|\([^:]\):.*|\1|g"); do rm -v "$file"; done; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      npm_config_arch=arm64 npm_config_target_arch=arm64 npm clean-install && \
      npm_config_arch=arm64 npm_config_target_arch=arm64 npx prisma generate && \
      npm_config_arch=arm64 npm_config_target_arch=arm64 npx next build && \
      for file in $(find /app/node_modules -name "*.node" -type f -exec file {} \; | grep -v "aarch64\|arm64" | grep "x86-64\|x86_64" | sed "s|\([^:]\):.*|\1|g"); do rm -v "$file"; done; \
    fi && \
    npm cache clean --force && \
    clean-modules --yes
FROM alpine:3.23.0 AS strip
COPY --from=build /app /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates binutils file && \
    find /app/node_modules -name "*.node" -type f -exec strip -s {} \; && \
    find /app/node_modules -name "*.node" -type f -exec file {} \;

FROM node:24.11.1-alpine3.21
COPY --chmod=775                        scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=strip --chown=nobody:nobody /app                  /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates tzdata tini openssl
USER nobody
WORKDIR /app
ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK CMD wget -q http://localhost:3000 -O /dev/null || exit 1
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXTAUTH_URL=http://localhost:3000
EXPOSE 3000/tcp
