# Songbook

A focused songwriting workspace. Lyrics, song structure, musical details, and
version history in one quiet place.

> **Status:** Phase 3 of 4 complete (versions, chord sketch, flush on close, pagination).
> See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for what works today.

## Features

- **Dashboard** with recent songs, library counts, recent ideas, and an activity timeline
- **Song library** with search, status and favorite filters, sort, grid/list views
- **Song editor** with an editable title, musical metadata, drag-and-drop sections
  (keyboard accessible), a distraction-free lyric surface, and a collapsible details panel
- **Chord sketch** per section: pick chords (with the key's diatonic chords
  suggested first), set beats, and hear them as a looping block-chord piano
  at the song's tempo, built on the Web Audio API with no samples
- **Autosave** with a single-flight save queue, revision conflict detection,
  a flush on tab close, and an honest status indicator
- **Version history**: named snapshots, preview, confirmed restore with an
  automatic recovery point
- **Ideas** for quick capture, search, and attaching fragments to songs
- **Settings** limited to things that work: profile and lyric typography

## Technology

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19 |
| Language | TypeScript 5.9, strict |
| Styling | Tailwind CSS 4, shadcn/ui, Lucide icons |
| Interaction | dnd-kit for section reordering |
| Data | PostgreSQL 17, Prisma 7 (driver adapter) |
| Auth | Better Auth (email/password, database sessions) |
| Validation | Zod at every Server Action boundary |
| Testing | Vitest (integration tests against real PostgreSQL), Playwright |
| Hosting | Vercel + managed PostgreSQL |

## Getting started

Requirements: Node.js 22 LTS and Docker (for the local database).

```bash
cp .env.example .env          # fill in BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install                   # also runs `prisma generate`
npm run db:up                 # PostgreSQL 17 in Docker on port 5433
npm run db:migrate            # apply migrations
npm run db:seed               # optional: a sign-in-able account with sample songs
npm run dev
```

Open http://localhost:3000 and create an account, or sign in with the seeded
account `demo@songbook.local` / `songbook-demo`. "Try the demo" on the sign-in
page creates a private throwaway workspace instead.

Other scripts:

```bash
npm run build       # production build (also typechecks)
npm run lint        # ESLint
npm run typecheck   # TypeScript only
npm test            # Vitest: unit tests + integration tests (needs the database)
npm run test:e2e    # Playwright against a production build (needs db + seed)
npm run db:studio   # Prisma Studio
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the server/client boundaries,
data model, autosave design, and the reasoning behind the main choices.

## Roadmap

- **Phase 4** Accessibility and responsive review, performance pass,
  deployment to Vercel with a demo, screenshots

Beyond the MVP: audio attachments, chord diagrams, collaboration, export,
offline support, and a mobile companion.

## License

MIT
