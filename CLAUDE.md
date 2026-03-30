# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Lint code
pnpm lint

# Build static export (outputs to out/)
pnpm build

# Build Docker image
docker build -t scaffold-web .
```

## Architecture Overview

This is a **admin dashboard** built with Next.js 14 (App Router), React 18, and TypeScript. The app is configured as a **static export** (`output: "export"`), meaning there is no server-side rendering in production - it's a pure static SPA that calls external APIs.

### Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**:
  - Zustand (`src/stores/user-store.ts`) for client UI state
  - TanStack React Query for server state (API caching)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives (Dialog, Label) + custom wrapper components

### API Integration

The frontend calls a backend API at `${NEXT_PUBLIC_API_URL}/api/v1/users` (GET/POST/PUT/PATCH/DELETE). The API module is in `src/lib/api.ts`, with type definitions in `src/types/index.ts`. Schema validation uses Zod (`src/schemas/user-schema.ts`).

### Routes

- `/` (root) - redirect to `/users/`
- `/users/` - user management list with CRUD dialog

### Build Output

The build process generates static HTML/JS in `out/`. A Docker image uses BusyBox httpd to serve these static files.