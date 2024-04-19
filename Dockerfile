# syntax=docker/dockerfile:labs
FROM --platform="$BUILDPLATFORM" alpine:3.19.1 as build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    TARGETARCH
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates nodejs-current npm && \
    if [ "$TARGETARCH" = "amd64" ]; then npm_config_target_platform=linux npm_config_target_arch=x64 npm clean-install; \
    elif [ "$TARGETARCH" = "arm64" ]; then npm_config_target_platform=linux npm_config_target_arch=arm64 npm clean-install; fi && \
    npx prisma generate && \
    npm run build

FROM alpine:3.19.1
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates tzdata tini nodejs-current
COPY --from=build /app /app
COPY --chmod=775 scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
USER nobody
WORKDIR /app
ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK CMD wget -q http://localhost:3000 -O /dev/null || exit 1
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000/tcp
