# Repository Guidelines

## General Instructions
- Work carefully and prefer maintainable refactors over quick patches.
- Keep user-visible errors generic; do not leak internals.
- Do not revert unrelated user changes.

## Project Structure & Module Organization
- `app/`: App Router pages, layouts, route handlers.
- `app/auth/**/route.ts`: POST endpoints for auth and note mutations.
- `components/`: client UI components (TipTap editor, shared UI).
- `lib/`: DB adapter, auth/session helpers, note services, content sanitizer.
- `migrations/`: SQL migration files.
- `scripts/`: runtime helpers (`migrate.mjs`, `dev.mjs`).
- `SPEC.MD`: product behavior spec.

## Build, Test, and Development Commands
- `bun run dev`: runs migrations, then starts Next dev server.
- `bun run migrate`: executes DB migrations via Node.
- `bun run build`: production build.
- `bun run start`: start production server.
- `bunx tsc --noEmit`: type-check.

Note: `bun run test` is currently a placeholder and not an active automated suite.

## Coding Style & Naming Conventions
- TypeScript + React function components.
- 2-space indentation.
- Use App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`.
- Dynamic segments use `[id]`, `[token]`, etc.
- Prefer small service-style helpers in `lib/` over inlined SQL in UI files.

## Testing Guidelines
- Minimum validation before handoff:
  - `bunx tsc --noEmit`
  - `bun run dev` and manual route checks (`/login`, `/notes`, `/notes/new`, `/notes/[id]`, `/s/[token]`).
- For mutation flows, validate expected redirect/status behavior of route handlers.

## Commit & Pull Request Guidelines
- Use clear imperative commit messages, e.g. `Fix note editor route handler flow`.
- Keep commits scoped to one concern.
- PRs should include:
  - Change summary and rationale.
  - Manual verification steps and outcomes.
  - Screenshots for UI-impacting changes.

## Current Implementation Notes
- SQLite runtime for app/server is `better-sqlite3` for Next.js Node compatibility.
- Auth/note mutations are route-handler based (POST under `/auth/**`) to avoid Server Action origin issues in some environments.
- TipTap editor behavior depends on client runtime scripts; CSP is relaxed in dev mode in `next.config.ts`.
