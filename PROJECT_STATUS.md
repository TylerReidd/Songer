# Project Status

_Last updated: 2026-11-16_

## Phase summary

| Phase | Scope | Status |
|---|---|---|
| 0 | Architecture and planning | Done |
| 1 | UI foundation on sample data | Done |
| 2 | PostgreSQL, Prisma, Better Auth, ownership, CRUD | Done |
| 3 | Versions, flush on close, pagination, chord sketch, recordings, email verification + password reset | **Done, awaiting review** |
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
- **Takes (voice memos):** a "Takes" tab in the editor records up to 60
  seconds from the microphone with a countdown and level meter, stops
  automatically, and saves the take with the song (ten per song). Takes play
  back from a private, owner-checked stream, can be renamed and deleted, and
  are removed with the song. Audio bytes live in PostgreSQL behind a
  three-function storage module so they can move to object storage later.
  Demo workspaces cannot record.
- **Email verification and password reset:** new accounts must open the
  confirmation link before their first sign-in (unverified sign-ins resend
  it), and "Forgot password?" on the sign-in page emails a one-hour reset
  link that revokes other sessions. Email goes out over SMTP through
  `lib/email.ts` (Gmail App Password works; nothing to pay for) and is
  printed to the dev console when no credentials are set.

## Checks run for Phase 3

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, 0 warnings |
| `npm run build` | Pass |
| `npm test` (Vitest) | **45 of 45 pass** across 7 files: music theory, section ordering, library filters, editor reducer, ownership integration (10), versions integration (3), recordings integration (5: owner save with MIME normalization, stranger/format/size/duration rejected, per-song cap, owner-only rename and delete, cascade on song delete) |
| `npm run test:e2e` (Playwright, production build, fake microphone) | **7 of 7 pass**: anonymous redirect; sign-up → song → lyrics → chords → play → Saved → reload → library; versions save/restore with recovery entry; record 1.5 s → "Recording saved" → stream responds 200 with an audio content type → rename → delete; cross-user isolation; wrong password; forgot-password request and expired reset link |

A unit test caught one bug before it shipped: lowercase key strings ("e minor")
failed to parse, which would have hidden the diatonic suggestions.

The e2e suite also surfaced Better Auth's sign-in rate limiting (correct in
production); the test server disables it, together with email verification,
with `AUTH_TEST_MODE=on`.

The verification and reset flow itself was exercised against the dev server
with console-printed links: sign-up shows "Check your email" and grants no
session; sign-in before confirming is refused and resends the link; the link
signs in; the reset link accepts a new password, the old one is refused, a
reused link shows "Link expired", and "Try the demo" still works.

## Things I could not verify

- **How the piano actually sounds.** The synth runs without errors in
  headless Chromium and the scheduler highlights chords on time, but I cannot
  listen. Please play a few progressions and tell me if the tone, volume, or
  decay need adjusting; the parameters are all in `src/lib/music/piano.ts`.
- **Real email delivery.** The SMTP path is Nodemailer's standard transport
  but I have no credentials, so sending through Gmail is untested. Set
  `SMTP_USER`/`SMTP_PASS` in `.env`, create an account with your real address,
  and confirm the message arrives (check spam the first time).
- **Real microphones and Safari.** Recording is verified with Chromium's
  fake audio device. Please try it in your own browser, and in Safari if you
  have it, since Safari produces MP4 and relies on the range support in the
  stream handler.

## Known limitations and open items

- `/songs/<unknown-id>` responds 200 with the not-found UI (Partial
  Prerendering streams the shell first).
- One harmless 404 appears in the console on the sign-in page (a prefetch of
  `/dashboard` before the cookie exists is redirected by the proxy).
- The flush route returns 409 for a stale revision; the next page load shows
  the server's copy. There is no merge, by design.
- No metronome click or strummed voicing yet; both are small additions on
  top of the current scheduler if wanted.
- Recordings are not included in version snapshots or song duplication
  (versions capture the writing; takes are attachments).
- A recording interrupted by closing the tab is lost; only completed takes
  upload.
- Email is sent from a personal Gmail address until the project has a domain;
  swapping to Resend or similar is a change inside `lib/email.ts` only.
- No "resend confirmation" button; signing in again with the same password
  resends the link, and the "Check your email" screen says so.
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
- Audio in PostgreSQL rather than object storage: free, zero setup, and
  bounded by the 60-second and ten-takes limits. The storage module is the
  seam for moving to Cloudflare R2 if volume ever justifies it.

## Next up (Phase 4, pending approval)

1. Accessibility pass (focus order in the editor, screen-reader labels on the
   chord strip and recorder, reduced-motion audit) and responsive pass
2. Performance review: bundle check, Prisma query count on the dashboard
3. Vercel deployment with Neon, `CRON_SECRET`, demo mode live, screenshots in
   the README
4. Any further features you want after trying chords and takes
