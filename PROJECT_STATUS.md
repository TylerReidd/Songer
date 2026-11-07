# Project Status

_Last updated: 2026-11-07_

## Phase summary

| Phase | Scope | Status |
|---|---|---|
| 0 | Architecture and planning | Done |
| 1 | UI foundation on sample data | Done |
| 2 | PostgreSQL, Prisma, Better Auth, ownership, CRUD | Done |
| 3 | Versions, flush on close, pagination, chord sketch | **Done, awaiting review** |
| 4 | Accessibility and responsive review, performance, deployment, screenshots | Not started |

## What works today

Everything from Phases 1 and 2 (accounts, demo workspaces, library, editor
autosave with revision checks, ideas, settings) plus:

- **Chord sketch per section:** add chords from a picker that leads with the
  song key's diatonic chords, edit root/quality/beats in place, reorder,
  remove. Play/stop and loop with the chord that is sounding highlighted.
  Block-chord piano built on the Web Audio API; tempo comes from the song's
  BPM, default beats from its time signature. Chords autosave with the
  section and are included in version snapshots.
- **Versions:** "Save current version" flushes pending edits first, then
  snapshots the song. Preview shows lyrics and chords. Restore asks for
  confirmation, writes a recovery version of the current state in the same
  transaction, and swaps the editor to the restored document without a reload.
- **Flush on tab close:** pending edits are posted with `sendBeacon` to a
  Route Handler that runs the same save transaction as the action.
- **Library pagination:** 30 per page with Previous/Next links that keep the
  filters; changing a filter returns to page 1.

## Checks run for Phase 3

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, 0 warnings |
| `npm run build` | Pass |
| `npm test` (Vitest) | **40 of 40 pass** across 6 files: music theory (chord symbols, voicings, diatonic chords, key parsing, meters), section ordering, library filters, editor reducer, ownership integration (10), versions integration (3: snapshot with chords, restore + recovery + revision bump, cross-song restore refused) |
| `npm run test:e2e` (Playwright, production build) | **5 of 5 pass**: anonymous redirect; sign-up → song → lyrics → two chords → play highlights the first chord → Saved → reload keeps title, lyrics, chords → library lists it; save version → edit → restore → original title back and a Recovery entry; cross-user isolation; wrong password |

A unit test caught one bug before it shipped: lowercase key strings ("e minor")
failed to parse, which would have hidden the diatonic suggestions.

## Things I could not verify

- **How the piano actually sounds.** The synth runs without errors in
  headless Chromium and the scheduler highlights chords on time, but I cannot
  listen. Please play a few progressions and tell me if the tone, volume, or
  decay need adjusting; the parameters are all in `src/lib/music/piano.ts`.

## Known limitations and open items

- `/songs/<unknown-id>` responds 200 with the not-found UI (Partial
  Prerendering streams the shell first).
- One harmless 404 appears in the console on the sign-in page (a prefetch of
  `/dashboard` before the cookie exists is redirected by the proxy).
- The flush route returns 409 for a stale revision; the next page load shows
  the server's copy. There is no merge, by design.
- No metronome click or strummed voicing yet; both are small additions on
  top of the current scheduler if wanted.
- Email verification and password reset are not implemented.
- Chord chips keep their position by array index; dragging chords is not
  supported (arrows only), which keeps the strip simple.

## Decisions made in this phase

- Chords are a JSON column on the section rather than a table: always loaded
  with the section, validated by Zod, no joins.
- The save transaction moved into `lib/songs/save-document.ts` so the Server
  Action and the beacon Route Handler share one implementation.
- Restore returns the restored document and the editor replaces its state
  (`document/replace`) rather than reloading the page.
- Offset pagination in the URL (`?page=`) over cursor pagination: simpler to
  read, links work without JavaScript, and a personal library never reaches
  the scale where offsets hurt.
- The Playwright suite runs against a production build on port 3100 so it
  sees the same prerendering and proxy behavior as deployment.

## Next up (Phase 4, pending approval)

1. Accessibility pass (focus order in the editor, screen-reader labels on the
   chord strip, reduced-motion audit) and responsive pass on the chord strip
2. Performance review: bundle check, Prisma query count on the dashboard
3. Vercel deployment with Neon, `CRON_SECRET`, demo mode live, screenshots in
   the README
4. Any further features you want after hearing the chord sketch
