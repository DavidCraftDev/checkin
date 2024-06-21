# syntax=docker/dockerfile:labs
FROM --platform="$BUILDPLATFORM" alpine:3.20.1 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    TARGETARCH
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates nodejs-current npm file && \
    npm install --global clean-modules && \
    if [ "$TARGETARCH" = "amd64" ]; then \
      npm_config_target_platform=linux npm_config_target_arch=x64 npm clean-install && \
      rm -rv /app/node_modules/@next/swc-linux-* && \
      npm_config_target_platform=linux npm_config_target_arch=x64 npm install --force @next/swc-linux-x64-musl && \
      rm -rvf /app/node_modules/@next/swc-linux-arm64-* && \
      rm -rv /app/node_modules/@next/swc-linux-*-gnu && \
      rm -v /app/node_modules/@prisma/engines/schema-engine-linux-musl-openssl-3.0.x && \
      rm -v /app/node_modules/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node && \
      rm -v /app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node && \
      npm_config_target_platform=linux npm_config_target_arch=x64 npx prisma generate && \
      npm_config_target_platform=linux npm_config_target_arch=x64 npx next build && \
      for file in $(find /app/node_modules -name "*.node" -exec file {} \; | grep -v "x86-64" | sed "s|\(.*\):.*|\1|g"); do rm -v "$file"; done; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npm clean-install && \
      rm -rv /app/node_modules/@next/swc-linux-* && \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npm install --force @next/swc-linux-arm64-musl && \
      rm -rv /app/node_modules/@next/swc-linux-x64-* && \
      rm -rvf /app/node_modules/@next/swc-linux-*-gnu && \
      rm -rv /app/node_modules/@prisma/engines/schema-engine-linux-musl-openssl-3.0.x && \
      rm -v /app/node_modules/prisma/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node && \
      rm -v /app/node_modules/.prisma/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node && \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npx prisma generate && \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npx next build && \
      for file in $(find /app/node_modules -name "*.node" -exec file {} \; | grep -v "aarch64" | sed "s|\(.*\):.*|\1|g"); do rm -v "$file"; done; \
    fi && \
    npm cache clean --force && \
    clean-modules --yes
FROM alpine:3.20.1 AS strip
COPY --from=build /app /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates binutils file && \
    find /app/node_modules -name "*.node" -exec strip -s {} \; && \
    find /app/node_modules -name "*.node" -exec file {} \;

FROM alpine:3.20.1
COPY --chmod=775                        scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=strip --chown=nobody:nobody /app                  /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates tzdata tini nodejs-current npm
USER nobody
WORKDIR /app
ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK CMD wget -q http://localhost:3000 -O /dev/null || exit 1
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXTAUTH_URL=http://localhost:3000
EXPOSE 3000/tcp
