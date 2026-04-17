# Repository Guidelines

## Project Structure & Module Organization
Application code lives under `src/`. Route files use the Next.js App Router in `src/app/`, with the main feature currently under `src/app/(dashboard)/users/`. Reusable UI primitives live in `src/components/ui/`, page-specific components in `src/components/users/`, and shared layout in `src/components/layout/`. Keep API clients in `src/lib/`, validation schemas in `src/schemas/`, Zustand state in `src/stores/`, and shared types in `src/types/`. Testing documentation and planned E2E coverage live in `test-ua/`.

## Build, Test, and Development Commands
Use `pnpm` because the repo is locked with `pnpm-lock.yaml`.

- `pnpm install`: install dependencies.
- `pnpm dev`: start the local Next.js dev server at `http://localhost:3000`.
- `pnpm lint`: run the Next.js ESLint checks.
- `pnpm build`: create the production static export in `out/` and generate the `/ -> /users/` redirect page.
- `docker build -t scaffold-web .`: build the static-serving production image.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode and the `@/*` import alias. Follow the existing style: 2-space indentation, double quotes, semicolons, and typed function signatures where data crosses module boundaries. Use `PascalCase` for React components, `camelCase` for helpers, and keep file names lowercase with hyphens for components such as `user-dialog.tsx`. Put form validation in Zod schemas and keep API payload shaping close to `src/lib/api.ts`.

## Testing Guidelines
There is no checked-in automated test runner yet. For now, treat `pnpm lint` and `pnpm build` as required pre-merge checks. When adding user-flow coverage, align it with the Playwright-oriented plans in `test-ua/playwright-mapping.md` and `test-ua/runbook.md`. Name future specs by feature and flow, for example `users-create.spec.ts`.

## Commit & Pull Request Guidelines
Recent history favors short, imperative subjects such as `build`, plus scoped prefixes when useful, for example `docs: align static deployment guidance`. Keep commits focused and avoid `WIP` noise. PRs should summarize the user-facing change, note any `NEXT_PUBLIC_API_URL` or deployment impact, link the related issue or API change, and include screenshots for `/users` UI changes.

## Configuration Tips
Set `NEXT_PUBLIC_API_URL` in `.env.local` for development and rebuild after changing it. Because production uses `output: "export"`, deploy the generated `out/` directory or the Docker image, not a long-running `next start` server.
