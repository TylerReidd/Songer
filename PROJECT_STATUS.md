# Project Status

_Last updated: 2026-11-06_

## Phase summary

| Phase | Scope | Status |
|---|---|---|
| 0 | Architecture and planning | Done |
| 1 | UI foundation on sample data | **Done, awaiting review** |
| 2 | PostgreSQL, Prisma, Better Auth, ownership, CRUD | Not started |
| 3 | Persisted editing, autosave with revision checks, search, versions | Not started |
| 4 | Tests, accessibility, deployment, documentation | Not started |

## What works today (Phase 1)

All pages render from clearly labeled in-memory sample data (`src/lib/data/mock-data.ts`).
A "Sample data" badge in the sidebar makes this visible in the UI. Edits are
held in client state and are **not persisted**; destructive actions show a
toast explaining this instead of pretending to succeed.

- Landing page with product preview, features, about, footer, metadata
- Sign-in and sign-up forms (markup complete; submit opens the sample workspace)
- Dashboard: greeting, recent songs, library counts, recent ideas, activity timeline
- Library: URL-backed search (debounced), status filter, favorites filter, sort,
  grid/list toggle, per-song menu with rename dialog and delete confirmation,
  empty and no-match states, loading skeleton
- Editor: editable title, metadata strip, sections with drag-and-drop reordering
  (dnd-kit, keyboard sensor, plus Move up/down menu items), add/duplicate/delete,
  auto-growing lyric textarea, collapsible Details/Notes/Versions panel (sheet
  on mobile), version preview and confirmed restore dialogs, save status
  indicator driven by a real debounced single-flight autosave hook against a
  mock persistence function, unsaved-changes warning on tab close, loading,
  not-found and error boundaries, dynamic page title
- Ideas: capture composer, debounced URL search, edit / attach-to-song / delete dialogs
- Settings: profile form, lyric font preference (applied live), account section
- Responsive at phone width; dark theme; reduced-motion respected

## Checks run for Phase 1

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Pass, 0 warnings |
| `npm run build` | Pass; `/`, `/dashboard`, `/settings`, auth pages static; `/songs`, `/ideas`, `/songs/[id]` partial prerender |
| Production server smoke test | All 10 routes return 200 at 1440px and 390px with no console errors (Playwright script, screenshots reviewed) |
| Unit / integration / e2e tests | **Not written yet** (Phase 4). Playwright and Chromium are installed. |

## Known limitations and open items

- `/songs/<unknown-id>` renders the not-found UI but responds with HTTP 200,
  because Partial Prerendering has already streamed the static shell before
  `notFound()` runs. Acceptable for an authenticated app; revisit in Phase 4.
- The autosave hook's persistence function is a mock that always succeeds.
  The error and conflict UI states exist but cannot be triggered yet.
- Section ids created on the client are UUIDs that Phase 3 will map to
  database ids on first save.
- The `cn` helper is imported from the `cn` package that shadcn v4 installs;
  keep an eye on it when auditing dependencies.
- Light theme tokens are defined but there is no toggle (deliberate).

## Decisions made in this phase

- TypeScript pinned to 5.9.x (TypeScript 7 lacks a stable JS API for Next.js).
- Cache Components left enabled (Next 16 default); render-time clock reads
  were removed to keep pages prerenderable.
- `useSyncExternalStore` used for client-only values (greeting, relative
  times) and `useEffectEvent` for the autosave timer, to satisfy the React
  Compiler lint rules without disabling them.
- Favorites is a filter on the library (`/songs?favorite=1`), not a page.

## Next up (Phase 2, pending approval)

1. `docker-compose.yml` with PostgreSQL 17 for local development
2. Prisma 7 schema, `prisma.config.ts`, first migration, seed from sample data
3. Better Auth with email/password; `requireUser()`; `proxy.ts` redirect
4. Replace `src/lib/data/index.ts` with Prisma queries (same signatures)
5. Server Actions for song and idea CRUD; wire the existing dialogs to them
6. Integration tests for ownership enforcement
