# TinyNotes

TinyNotes is a Next.js + TypeScript notes app with SQLite storage and TipTap rich-text editing.

## Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm (or Bun)
- On Windows, `better-sqlite3` may require C++ build tools if no prebuilt binary is available.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Run migrations:

```bash
npm run migrate
```

4. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: run migrations, then start Next.js dev server.
- `npm run migrate`: apply SQL migrations in `migrations/`.
- `npm run build`: production build.
- `npm run start`: start production server.

## Project Layout

- `app/`: routes, pages, and route handlers.
- `lib/`: database/auth/content services.
- `components/`: client UI components.
- `migrations/`: SQL migration files.
- `scripts/migrate.mjs`: migration runner.

## Notes

- SQLite DB path is controlled by `DB_PATH`.
- Share URLs use `APP_URL`.
- If editor remains stuck on "Loading editor...", clear cache and restart:

```bash
rm -rf .next
npm run dev
```
