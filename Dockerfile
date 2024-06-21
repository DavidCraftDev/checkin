# syntax=docker/dockerfile:labs
FROM --platform="$BUILDPLATFORM" alpine:3.20.1 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    TARGETARCH
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates nodejs-current npm file binutils && \
    npm install --global eslint clean-modules && \
    if [ "$TARGETARCH" = "amd64" ]; then \
      npm_config_target_platform=linux npm_config_target_arch=x64 npm clean-install && \
      npm_config_target_platform=linux npm_config_target_arch=x64 npx prisma generate && \
      npm_config_target_platform=linux npm_config_target_arch=x64 npm run build && \
      for file in $(find /app/node_modules -name "*.node" -exec file {} \; | grep -v "x86-64" | sed "s|\(.*\):.*|\1|g"); do rm -v "$file"; done; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npm clean-install && \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npx prisma generate && \
      npm_config_target_platform=linux npm_config_target_arch=arm64 npm run build && \
      for file in $(find /app/node_modules -name "*.node" -exec file {} \; | grep -v "aarch64" | sed "s|\(.*\):.*|\1|g"); do rm -v "$file"; done; \
    fi && \
    npm cache clean --force && \
    clean-modules --yes && \
    rm -vr /app/node_modules/@next/swc-linux-* && \
    find /app/node_modules -name '*.node' -exec strip -s {} \;

FROM alpine:3.20.1
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates tzdata tini nodejs-current npm
COPY --chmod=775                        scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=build --chown=nobody:nobody /app                  /app
USER nobody
WORKDIR /app
ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK CMD wget -q http://localhost:3000 -O /dev/null || exit 1
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXTAUTH_URL=http://localhost:3000
EXPOSE 3000/tcp
