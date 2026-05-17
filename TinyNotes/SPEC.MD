# TinyNotes - SPEC (Bun + TypeScript + Next.js + SQLite)

## 0) Goals and constraints

### Features

- Email+password auth.
- Authenticated users can create, view, edit, delete notes.
- Notes can be shared via unguessable token links.
- Share can be revoked by owner.
- Unauthenticated users can view shared notes at `/s/[token]`.

### Constraints

- Next.js App Router, TypeScript, TailwindCSS.
- Rich text via TipTap; content stored as TipTap JSON.
- HTML rendered server-side and sanitized before display.
- SQLite with raw SQL (no ORM).
- No search/filter/query-param features for notes views.
- No file/image uploads.

---

## 1) Architecture overview

### Rendering and data access

- Server Components perform note reads.
- Mutations are implemented with Route Handlers (`POST`) rather than Server Actions for browser form/fetch submissions.
- TipTap editor is client-only UI.

### Auth and sessions

- Credential auth backed by `user` + `account` tables.
- Session cookie: `tn_session` (httpOnly, sameSite=lax).
- Session lookup from `session.token` hash.

### Runtime note

- App runtime uses `better-sqlite3` for Next.js Node compatibility.
- Migration script runs via Node (`node scripts/migrate.mjs`).

---

## 2) Routes

### Public UI routes

- `GET /` -> redirect to `/notes` if authenticated, else `/login`.
- `GET /login`
- `GET /register`
- `GET /s/[token]`

### Authenticated UI routes

- `GET /notes`
- `GET /notes/new`
- `GET /notes/[id]`

### Mutation endpoints (Route Handlers)

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `POST /auth/notes/create`
- `POST /auth/notes/[id]/update`
- `POST /auth/notes/[id]/delete`
- `POST /auth/notes/[id]/share/enable`
- `POST /auth/notes/[id]/share/disable`

### Not found

- `app/not-found.tsx` custom 404.

---

## 3) Data model

Tables:

- Auth: `user`, `session`, `account`, `verification`
- App: `note`, `note_share`, `schema_migrations`

Notes:

- `content_json` stores serialized TipTap JSON.
- Share token is never stored raw; `token_hash = SHA-256(token)`.
- Public read checks `note_share.enabled = 1` and `note.share_enabled = 1`.

---

## 4) Content pipeline

- Client editor produces TipTap JSON.
- Server validates payload size (<= 256KB serialized).
- Server renders TipTap JSON -> HTML.
- Sanitization allowlist is enforced before serving HTML.

---

## 5) Error handling and security

- User-facing errors are generic (no SQL/internal details).
- Invalid share token / disabled share / missing note all resolve to 404.
- Security headers configured in `next.config.ts`.
- CSP is relaxed in development mode for Next.js/TipTap runtime scripts, stricter in production.

---

## 6) Migrations and environment

### Commands

- `bun run migrate` -> runs `node scripts/migrate.mjs`
- `bun run dev` -> migrate + start Next dev server

### Environment variables

- `DB_PATH=./data/tinynotes.db`
- `APP_URL=http://localhost:3000`
- `AUTH_SECRET=...` (reserved)

`APP_URL` is sanitized; invalid values like `null` fallback to `http://localhost:3000`.

---

## 7) Acceptance criteria

1. Register + login + logout flows work.
2. Session persists via cookie.
3. Notes list sorted by `updated_at DESC`.
4. Create/edit/delete note works.
5. Enable share returns URL; `/s/[token]` renders sanitized content.
6. Disable share makes `/s/[token]` resolve to 404.
7. Unauthorized `/notes/*` requests redirect to `/login`.
8. Custom 404 is shown for missing resources/routes.
