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

Reads happen in Server Components through small query modules; writes go
through Server Actions that validate with Zod and scope every query by owner.

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
    db.ts                   Prisma client (singleton, pg driver adapter)
    auth.ts / auth-client.ts  Better Auth server instance and browser client
    session.ts              requireUser(): the Data Access Layer entry point
    songs/queries.ts        Reads (always scoped by userId)
    songs/actions.ts        Server Actions: create, patch, delete, save document
    ideas/, dashboard/, settings/   Same split per feature
    validation/             Zod schemas for every action input and the snapshot JSON
    demo/                   Sample content, seeding, "Try the demo"
    songs/filters.ts        Library filter model (URL <-> typed filters)
    songs/ordering.ts       Pure section-ordering helpers
    songs/save-document.ts  The autosave transaction (shared by action and flush route)
    music/chords.ts         Chord names, voicings, diatonic suggestions (pure)
    music/piano.ts          Web Audio piano synth
  hooks/use-autosave.ts     Debounced single-flight autosave + tab-close flush
  hooks/use-chord-player.ts Lookahead scheduler for chord playback
  proxy.ts                  Cookie-presence redirect (not the security boundary)
prisma/                     schema, migrations, seed
tests/integration/          Ownership and versioning tests against real PostgreSQL
tests/e2e/                  Playwright: sign-up, write, chords, versions, isolation
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

## Authentication and authorization

- Better Auth with email/password; sessions and accounts live in PostgreSQL
  via the Prisma adapter. The browser talks to `/api/auth/*` through Better
  Auth's React client; the Route Handler at `app/api/auth/[...all]` mounts it.
- `proxy.ts` (Next 16's name for middleware) redirects anonymous visitors
  based on cookie presence only. It is a convenience, not the security boundary.
- `requireUser()` in `lib/session.ts` validates the session against the
  database and is called at the top of every protected page and Server
  Action. It is wrapped in React `cache()` so a page and its children share
  one lookup per request.
- Under Cache Components a session read must sit behind Suspense, so the
  `(app)` layout never reads it. The account menu is an async Server Component
  inside its own boundary, and each page reads the session behind its
  `loading.tsx`.
- Data access functions take `userId` explicitly and include it in the `where`
  clause. Mutations use `updateMany`/`deleteMany` with `{ id, ownerId }` and
  treat zero affected rows as "not found". There is no code path that touches
  a song without an owner filter. `tests/integration/ownership.test.ts`
  proves this against the real database.
- "Try the demo" creates an isolated throwaway account flagged `isDemo`;
  `/api/cron/cleanup-demo` (Vercel Cron, bearer-secret protected) deletes
  them after 24 hours and cascades remove their content.

## Autosave strategy

Implemented in `src/hooks/use-autosave.ts` and `components/editor/editor-reducer.ts`.

1. Every edit increments `dirtyVersion` and sets status to `dirty`.
2. The hook waits for 800 ms of quiet, then runs one save.
3. Only one save is in flight. Edits during a save are coalesced into exactly
   one follow-up, so a slow response never overwrites newer local state.
4. The reducer compares the version that was saved with the current version;
   if they differ the editor stays `dirty` instead of reporting `saved`.
5. `beforeunload` warns while edits are unsaved or in flight.

The server half is `saveSongDocument` in `lib/songs/actions.ts`. Each save
sends the `revision` the editor loaded; the action updates
`where { id, ownerId, revision }` and increments it inside a transaction.
Zero rows updated means another tab changed the song and the editor shows
`conflict` instead of overwriting. Sections are reconciled by id in the same
transaction: known ids update, new ids insert, missing ids delete, and an id
that belongs to another song can never be reassigned.

The editor page keys `SongEditor` by song id only. A save revalidates the
route, which re-renders the page with a new revision, but the client keeps
its reducer state and the user's in-flight typing instead of remounting.

When the tab is hidden or closed with edits pending, `useFlushOnHide` posts
the final document with `navigator.sendBeacon` to `/api/songs/[id]/flush`.
Beacons survive tab close and cannot call Server Actions, so that Route
Handler exists; it runs the same shared transaction and only differs in
reading the user from the request cookies.

## Versioning approach

A version is a JSON snapshot of title, metadata, notes, and ordered sections
(including chords), validated by `lib/validation/snapshot.ts` on write and on
read; a corrupt row is skipped rather than crashing the page. The snapshot
carries a `schemaVersion`, and fields added later (chords) default when
reading older snapshots.

Saving a version first flushes pending edits, then `createVersion` snapshots
what the database holds, so a snapshot never captures a half-saved state.
`restoreVersion` runs one transaction: write a `RECOVERY` snapshot of the
current state, delete the sections, re-create them from the snapshot, bump
the revision. The action returns the restored document and the editor
replaces its state with it (`document/replace`), so no page reload is needed.

## Chord sketch

Each section carries an optional chord progression stored as a JSON column
(`[{ root, quality, beats }]`) validated by Zod; chords are always loaded with
their section, so a separate table would add joins for nothing.

- `lib/music/chords.ts` is pure and unit tested: chord symbols, MIDI
  voicings kept near middle C so every chord sits in the same register, and
  the seven diatonic chords of the song's key for the picker's suggestions.
- `lib/music/piano.ts` builds a small piano on the Web Audio API: three
  detuned oscillator layers per note, a low-pass filter that closes as the
  note decays, a percussive envelope, and a short synthetic reverb. No
  samples, no dependency. The `AudioContext` is created on the first click,
  which browsers require.
- `hooks/use-chord-player.ts` schedules on the audio clock. A 30 ms interval
  looks 120 ms ahead and books any chord starting in that window, so timing
  stays tight even when JavaScript timers drift. Only one section plays at a
  time; starting another stops the current one.

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
