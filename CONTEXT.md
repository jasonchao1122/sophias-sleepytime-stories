# Project Context — Sophia's Sleepytime Stories

Read this first in a fresh session before making changes. It's written to
be self-contained — everything a new Claude Code session (or Jason) needs
to pick this project back up, without relying on any prior conversation
history or external memory.

## What this is

A personal bedtime-audiobook site Jason built for his kid, Sophia. Static
site, no build step, no framework — deliberate constraint from the original
design. Hosted free on GitHub Pages under Jason's **personal** GitHub
account (`jasonchao1122`), unrelated to any employer's org/SSO — confirmed
this persists regardless of his employment status anywhere.

- **Live**: https://jasonchao1122.github.io/sophias-sleepytime-stories/
- **Repo**: `jasonchao1122/sophias-sleepytime-stories` (must stay **public**
  — this GitHub account's plan does not support Pages on a private repo;
  verified directly by trying it, see "Gotchas" below)
- **Local**: wherever you've cloned it — Jason's working copy has been at
  `~/personal-projects/sophias-sleepytime-stories`

The repo has been renamed twice as branding changed:
`meditation-audiobooks` → `jasons-sleepytime-stories` → current name.
Old `github.io` URLs 404 (GitHub doesn't redirect Pages URLs on rename,
only the `github.com` repo page) — not a concern, never shared elsewhere.

**Content note**: the "chapters" are Jason's own spoken plot summaries of
real novels, not verbatim text and not commercial audiobook recordings —
deliberately chosen this way after an early copyright discussion, since
distributing someone else's copyrighted narration/text publicly would be a
real problem; a personal summary in your own words is not.

## Current books

Run `node -e "console.log(require('./js/data.js').BOOKS.map(b=>({slug:b.slug,title:b.title,chapters:b.chapters.length,available:b.chapters.filter(c=>c.file).length})))"`
to check live, but as of this writing:

| Book | Chapters | Available |
|---|---|---|
| Demon Copperhead | 35 | 35/35 |
| James | 16 | 16/16 |
| The Tainted Cup | 20 | 4/20 (rest render as "Coming Soon") |

**To add more Tainted Cup chapters**: get the `.m4a` file, measure its
exact duration with `afinfo path/to/file.m4a` (macOS built-in), listen to
or read a transcript for a short 2-3 word title in the existing style
(e.g. "Commander Blas Murdered", "Leviathan Breaches Wall"), then in
`js/data.js` change that chapter's `CUP_TITLES`/`CUP_DURATIONS` entry from
`"Coming Soon"`/`null` to the real values. `makeChapters` handles the rest
— no other file needs to change for that alone.

**To add a whole new book**: add an entry to `BOOKS` in `js/data.js`
following the existing pattern (slug, title, cover path, chapters via
`makeChapters(bookSlug, filePrefix, titles, durations)`), drop a cover
image at `covers/<slug>.jpg`, and drop audio files at `audio/<slug>/`
matching the filenames `makeChapters` will generate.

## Architecture

- `index.html` — shell, loads 4 scripts in order (`data.js` → `progress.js`
  → `player.js` → `app.js`), plus a single persistent `<audio>` element
  that lives outside the router-controlled `#app` div (so re-renders never
  destroy it).
- `js/data.js` — book/chapter data. `makeChapters(bookSlug, filePrefix,
  titles, durations)` generates chapter objects; a `null` title/duration
  produces a "Coming Soon" chapter (`file: null`, `durationSeconds: 0`,
  non-interactive).
- `js/progress.js` — localStorage completion tracking only (no
  resume-to-exact-position). `markChapterComplete`/`markChapterIncomplete`/
  `isChapterComplete`/`getCompletedCount`.
- `js/app.js` — pure render functions (`renderHome`, `renderBookScreen`,
  no DOM access, unit-testable in Node) plus the hash router (`route()`,
  DOM-touching, not unit-tested). Hash is `#/` (Home) or `#/<book-slug>`
  (Book screen) only — the chapter is in-page player state, not part of
  the URL.
- `js/player.js` — the playback engine, an IIFE exposing a single
  `window.Player.mountBookScreen(bookSlug)` entry point. Owns intro
  gating, auto-advance, the sleep timer, and the Media Session
  registration (see Features below).

**Load-bearing conventions, don't casually change these:**
- Every `AUDIO.*` event handler is set via property assignment
  (`AUDIO.onended = ...`), never `addEventListener` — re-selecting a
  chapter must overwrite the previous handler, not stack a second one, or
  chapters skip ahead multiple steps after repeated selections.
- Every `js/*.js` file (except `player.js`, which is DOM-only) ends with
  `if (typeof module !== 'undefined') { module.exports = {...} }` so it
  works unmodified as both a plain `<script>` global and a
  `require()`-able Node module for tests.

## Features

- **Intro gating**: tapping a chapter directly from the list plays a
  shared `audio/intro.m4a` first, then the chapter. Auto-advance and the
  player bar's own prev/next buttons never replay the intro.
- **Sleep timer**: 30 minutes, resets *only* on an explicit action — tapping
  a chapter, resuming after you manually paused, tapping prev/next.
  Auto-advance and the intro→chapter transition do **not** reset it, so
  unattended playback across several auto-advanced chapters still gets
  capped at 30 total minutes. (This was deliberately corrected mid-design
  from an initial version that reset on every auto-advance too, which
  would have defeated the purpose — the whole point is capping *unattended*
  listening.)
- **Progress undo**: each chapter row's checkmark is its own tap target,
  separate from tapping the row to play it — tap to mark/un-mark complete
  independent of playback. Added because falling asleep mid-book was
  auto-marking chapters "complete" that weren't actually heard.
- **Time-based progress**: Home and the Book screen show both chapter
  count and runtime (e.g. "5/35 chapters · 2h 10m of 4h 28m"), computed
  from exact per-chapter `durationSeconds`.
- **Dark palette**: `--color-bg: #1C1512`, `--color-accent: #D9A15B`, full
  set in `css/style.css:1-8`.
- **Media Session API** (`js/player.js`): registers proper OS-level media
  metadata + play/pause/next/previous handlers. Added to fix background
  auto-advance reliability on Android/Chrome — see "Open items" below.

## Testing

Four plain-Node test files, no framework/bundler:
```
node tests/data.test.js && node tests/progress.test.js && \
  node tests/app-render.test.js && node tests/audio-files.test.js
```
These cover the data model, progress logic, and the *pure* render
functions in `app.js`. **`js/player.js` (DOM/audio-interactive logic) has
no automated test coverage** — no jsdom, no browser test runner set up.
It's been verified only by careful manual code-tracing, since no browser
automation tool has been available in any session this project was built
in. Treat new `player.js` behavior as unverified until tried on an actual
phone.

## Deploy process

```
git add -A && git commit -m "..." && git push
```
GitHub Pages redeploys automatically within about a minute. Routine
pushes to this already-established personal repo don't need a
confirmation step — that's settled as the normal workflow. Creating a new
repo, renaming it, or changing its visibility are the kinds of actions
worth flagging before doing.

**Cache-busting — don't forget this**: `index.html`'s `<script>`/`<link>`
tags carry a `?v=N` query param. **Bump `N` on every deploy that changes
`js/`, `css/style.css`, or their content** — otherwise returning visitors
can see a stale cached copy even after a correct server-side deploy (this
happened once; confirmed via direct `curl` that the server was already
right and it was purely a client cache issue).

## Device/browser context

Jason listens on a **Google Pixel (Android), Chrome browser** — not an
iPhone. Matters for any future mobile-behavior debugging: Android/Chrome's
background-tab and autoplay policies differ meaningfully from iOS/Safari
(which Chrome-on-iPhone would also be subject to, since Apple requires all
iOS browsers to use WebKit — not relevant here). One iPhone-specific CSS
tweak already in the code (`env(safe-area-inset-bottom)` on `.player-bar`,
`viewport-fit=cover` in `index.html`) is a harmless no-op on his actual
device — left in, not worth removing.

## Open items / not yet fully confirmed

- **Background auto-advance on Android**: Jason reported playback would
  advance fine in the foreground but stop after one chapter when the
  screen was locked, needing a manual tap to continue. Two root causes
  found via `superpowers:systematic-debugging`:
  1. A real code bug — `loadChapter` could try to auto-advance into a
     Tainted Cup "Coming Soon" chapter (`file: null`). Fixed: `loadChapter`
     now refuses to load a chapter with no file.
  2. The general case: likely Android's background battery management
     (Doze/App Standby — stock Android/Pixel is strict about this)
     throttling the tab's JS once the screen locks, because the page
     wasn't registered as an active media session. Fixed by adding the
     Media Session API registration described above.
  **Jason has not yet confirmed on-device whether this fully resolves it**
  — he said he'd test a real screen-lock transition and report back. If it
  recurs, check the browser console first: all three `AUDIO.play()` retry
  paths now log via `console.error('[Player] play() failed during ...')`
  instead of failing silently, which is what made this hard to diagnose
  the first time.

## Process notes

Iterations 1-2 (initial build, then the merged-screen/dark-theme/real-content
redesign) went through the full brainstorm → written spec → written plan →
subagent-driven-development cycle — see `docs/superpowers/specs/` and
`docs/superpowers/plans/` for the historical documents. Later iterations
(sleep timer + undo, adding The Tainted Cup, the bug fixes above) were done
as direct implementation at Jason's request, since they were small,
well-scoped changes — that's a reasonable default for future small tweaks
too: ask if unsure, but don't default to the full ceremony for a contained
change.
