# syntax=docker/dockerfile:labs
FROM alpine:3.20.1 AS build
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY . /app
ARG NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
WORKDIR /app
RUN apk upgrade --no-cache -a && \
    apk add --no-cache ca-certificates nodejs-current npm && \
    npm install --global clean-modules && \
    npm clean-install && \
    clean-modules --yes && \
    npx prisma generate && \
    npm run build

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
