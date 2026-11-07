# Songbook Architecture

This document explains how Songbook is put together and why. It is written for
engineers who know React and Node but may be newer to the Next.js App Router.

## Overview

Songbook is a Next.js 16 application using the App Router, React 19, and
TypeScript in strict mode. Rendering happens on the server by default; only the
components that hold interactive state run in the browser.

```
Browser ──► Next.js (Vercel) ──► Server Components / Server Actions ──► Prisma ──► PostgreSQL
```

Phase 1 (current) runs on in-memory sample data behind the same data access
interface that Prisma will implement in Phase 2.

## Directory layout

```
src/
  app/                      Routes (App Router)
    (marketing)/            Public landing page, static
    (auth)/                 Sign in / sign up
    (app)/                  Authenticated workspace; layout owns the shell
      dashboard/
      songs/                Library (reads searchParams)
      songs/[id]/           Editor (+ loading, error, not-found)
      ideas/
      settings/
  components/
    ui/                     shadcn primitives (generated into the repo)
    shell/                  Sidebar, mobile nav, page header
    editor/                 Song editor: reducer, sections, panel
    songs/ ideas/ dashboard/ settings/ marketing/ shared/
  lib/
    domain/types.ts         Shared domain types and constants
    data/                   Data access layer (mock now, Prisma next)
    songs/filters.ts        Library filter model (URL <-> typed filters)
    songs/ordering.ts       Pure section-ordering helpers
    format.ts               Date / text helpers
  hooks/use-autosave.ts     Debounced single-flight autosave
```

Route groups in parentheses, such as `(app)`, group routes under a shared
layout without adding a URL segment. `/dashboard` and `/songs` share the
sidebar shell; `/` does not.

## Server and client boundaries

Every file is a Server Component unless it starts with `"use client"`.

| Runs on the server | Runs in the browser |
|---|---|
| Pages (`page.tsx`), layouts, `loading.tsx`, `not-found.tsx` | `SongEditor` and everything inside it |
| Data access (`lib/data`) | Library toolbar, search inputs |
| Sidebar frame, page headers, cards and rows | Menus, dialogs, the account dropdown |
| `generateMetadata` | `RelativeTime`, `Greeting` (need the local clock) |

The rule of thumb: a component goes to the client only if it needs state,
effects, event handlers, or browser APIs. Server Components can render Client
Components and pass them plain, serializable props (including `Date`).

### Why the editor is one client island

The song editor owns a live document that changes on every keystroke. Its root
is a Client Component holding a `useReducer` state machine. The Server
Component page loads the song once and hands it over as initial state; nothing
below re-fetches. This keeps typing instant and makes the save pipeline a
simple function of local state.

### Cache Components

Next 16 enables Cache Components by default. Pages prerender a static shell and
stream anything dynamic (reading `searchParams`, cookies, or the database)
inside a Suspense boundary. In practice:

- `loading.tsx` next to a page provides the Suspense boundary for that page.
- `SidebarNav` reads the URL on the client, so the sidebar wraps it in
  `<Suspense>` and the rest of the shell stays static.
- Nothing per-user is marked `"use cache"`. Mutations call `revalidatePath`.

Cache Components also keep recently visited routes mounted (React `Activity`),
so navigating away from the editor and back preserves its state.

## Data model

See `src/lib/domain/types.ts` for the canonical shapes. The Prisma schema in
Phase 2 mirrors them one to one.

- **Song** owns **SongSection** (ordered by `position`) and **SongVersion**.
- **Idea** optionally points at a Song (`SET NULL` on delete).
- Every owned row carries `ownerId`; every query includes it.
- `Song.revision` is an optimistic concurrency token.
- Version snapshots are JSON with an explicit `schemaVersion` so old
  snapshots can be migrated on read.
- The dashboard activity feed derives from `updatedAt` timestamps rather than
  an activity table.

## Authorization approach (Phase 2)

- Better Auth with email/password; sessions in PostgreSQL.
- A thin `proxy.ts` redirects anonymous visitors. It is a convenience, not the
  security boundary.
- `requireUser()` runs at the top of every protected page and Server Action.
- Data access functions take `userId` explicitly and include it in the `where`
  clause. There is no code path that reads a song without an owner filter.

## Autosave strategy

Implemented in `src/hooks/use-autosave.ts` and `components/editor/editor-reducer.ts`.

1. Every edit increments `dirtyVersion` and sets status to `dirty`.
2. The hook waits for 800 ms of quiet, then runs one save.
3. Only one save is in flight. Edits during a save are coalesced into exactly
   one follow-up, so a slow response never overwrites newer local state.
4. The reducer compares the version that was saved with the current version;
   if they differ the editor stays `dirty` instead of reporting `saved`.
5. `beforeunload` warns while edits are unsaved or in flight.

Phase 3 adds the server half: each save sends `revision`, the Server Action
updates `where { id, ownerId, revision }` and increments it; zero rows updated
means another tab changed the song and the editor shows `conflict`. A
`sendBeacon` flush to a Route Handler covers tab close.

## Versioning approach

A version is a validated JSON snapshot of title, metadata, notes, and ordered
sections. Restoring requires confirmation and first writes a `RECOVERY`
snapshot of the current state, so a restore is never destructive.

## Design system

Tokens live in `src/app/globals.css` as CSS variables, mapped into Tailwind
via `@theme inline`. Dark is the default and the only theme shipped in the
MVP; light tokens are defined for later. shadcn components are generated into
`components/ui` and re-pointed at Songbook's palette rather than themed around
it. Fonts: Geist (UI), Geist Mono (metadata), Source Serif 4 (lyrics), loaded
with `next/font` so no runtime font requests leave the app.

## Tradeoffs

- **Plain textarea for lyrics.** A rich-text editor would add weight for no
  benefit; lyrics are line-oriented plain text.
- **Filters in the URL.** Slightly more plumbing than local state, but views
  are shareable, survive refresh, and the Server Component does the query.
- **Better Auth over Auth.js.** Auth.js v5 has been in beta for years; Better
  Auth is stable and supports Next 16 and Prisma 7.
- **TypeScript 5.9 over 7.** TypeScript 7 (the native compiler) has no stable
  JS API yet and Next.js supports it only behind an experimental flag.
- **Cache Components on.** It is the forward path for Next.js and the flag is
  slated for removal, so adopting it now avoids a migration later.
