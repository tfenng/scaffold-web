# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY next.config.js postcss.config.js tailwind.config.ts components.json ./
COPY tsconfig.json next-env.d.ts ./
COPY .env.production ./.env.production
COPY scripts ./scripts
COPY src ./src

RUN pnpm build

FROM busybox:1.36.1-musl AS busybox

FROM scratch AS runner

WORKDIR /www

COPY --from=busybox /bin/busybox /bin/busybox
COPY --from=builder /app/out ./

EXPOSE 3000

ENTRYPOINT ["/bin/busybox", "httpd", "-f", "-v", "-p", "3000", "-h", "/www"]
