# Songbook

A focused songwriting workspace. Lyrics, song structure, musical details, and
version history in one quiet place.

> **Status:** Phase 1 of 4 complete (UI foundation on sample data).
> See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for what works today.

## Features

- **Dashboard** with recent songs, library counts, recent ideas, and an activity timeline
- **Song library** with search, status and favorite filters, sort, grid/list views
- **Song editor** with an editable title, musical metadata, drag-and-drop sections
  (keyboard accessible), a distraction-free lyric surface, and a collapsible details panel
- **Autosave** with a single-flight save queue and an honest status indicator
- **Version history** UI with preview and confirmed restore
- **Ideas** for quick capture, search, and attaching fragments to songs
- **Settings** limited to things that work: profile and lyric typography

## Technology

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19 |
| Language | TypeScript 5.9, strict |
| Styling | Tailwind CSS 4, shadcn/ui, Lucide icons |
| Interaction | dnd-kit for section reordering |
| Data (Phase 2) | PostgreSQL, Prisma 7 |
| Auth (Phase 2) | Better Auth |
| Testing (Phase 4) | Vitest, React Testing Library, Playwright |
| Hosting | Vercel + managed PostgreSQL |

## Getting started

Requirements: Node.js 22 LTS.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The workspace at `/dashboard` runs on clearly
labeled sample data until Phase 2 adds the database.

Other scripts:

```bash
npm run build     # production build (also typechecks)
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript only
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the server/client boundaries,
data model, autosave design, and the reasoning behind the main choices.

## Roadmap

- **Phase 2** PostgreSQL, Prisma migrations, Better Auth, ownership checks, CRUD
- **Phase 3** Persisted sections and reordering, autosave with revision checks,
  ideas, favorites, server-side search, version snapshots and restore
- **Phase 4** Tests, accessibility and responsive review, deployment, screenshots

Beyond the MVP: audio attachments, chord diagrams, collaboration, export,
offline support, and a mobile companion.

## License

MIT
