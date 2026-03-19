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
COPY . .

RUN pnpm build

FROM busybox:1.36.1-musl AS runner

WORKDIR /www

COPY --from=builder /app/out ./

EXPOSE 80

CMD ["httpd", "-f", "-v", "-p", "3000", "-h", "/www"]
