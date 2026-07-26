# Jason's Sleepytime Stories — Iteration 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the intro-label bug, consolidate the Chapter List and Player into one Book screen with a sticky bottom player bar, redesign the visuals to a dark warm palette with real cover art, add time-based progress alongside chapter-count progress, and replace generic chapter titles with Jason's real ones.

**Architecture:** Same static, no-build-step, vanilla JS SPA as iteration 1. The router simplifies from three hash levels to two (`#/` and `#/<book-slug>`); the former separate Player route is folded into the Book screen, with chapter selection becoming in-page player state rather than a URL segment.

**Tech Stack:** Unchanged — vanilla HTML/CSS/JS, Node + built-in `assert` for logic tests, `python3 -m http.server` for local dev, `git`/`gh` for deploy (repo already exists and is live; this iteration pushes updates to it, no new repo creation).

## Global Constraints

- Repo: `jasonchao1122/jasons-sleepytime-stories` (already created and live at `https://jasonchao1122.github.io/jasons-sleepytime-stories/`, renamed from `meditation-audiobooks` earlier this session). Local path: `~/personal-projects/jasons-sleepytime-stories`. Routine `git add`/`commit`/`push` to this existing repo does NOT need a fresh confirmation gate — that was already established as the normal ongoing workflow.
- No build step, no framework, no external JS dependencies.
- Every existing regression test must keep passing after each task: `tests/data.test.js`, `tests/progress.test.js`, `tests/app-render.test.js`, `tests/audio-files.test.js` — except where a task explicitly rewrites part of a test file to match a deliberate interface change (Tasks 2 and 4 modify `tests/data.test.js` and `tests/app-render.test.js` respectively as part of their own scope).
- Dual-environment guard pattern stays consistent: `typeof module !== 'undefined'` for Node exports, `typeof window !== 'undefined'` for browser-only globals — already used in `js/data.js`, `js/progress.js`, `js/app.js`.
- `AUDIO.*` event handlers stay assignment-style (`AUDIO.onended = ...`), never `addEventListener`, to avoid handler-stacking bugs across repeated chapter selections.
- Intro-gating rule is unchanged in spirit, only relocated: tapping a chapter row is a "fresh session start" (intro plays first); auto-advance and the bar's own prev/next buttons never replay the intro.
- Dark palette exact values: `--color-bg: #1C1512`, `--color-surface: #2A211C`, `--color-surface-raised: #33281F`, `--color-text: #F2E9DD`, `--color-muted: #B8A99A`, `--color-accent: #D9A15B`, `--color-accent-dark: #B8823F`.
- Real cover images already saved locally at `/Users/jason.chao/Downloads/james.jpg` and `/Users/jason.chao/Downloads/demon.jpg` — destination paths `covers/james.jpg` and `covers/demon-copperhead.jpg` already match what `js/data.js` references.
- No browser automation tool is available in this environment (confirmed in iteration 1) — DOM/audio-interactive verification is by careful code tracing plus a manual checklist Jason runs himself; do not claim interactive verification that didn't happen.

---

### Task 1: Add Real Cover Images

**Files:**
- Create: `covers/demon-copperhead.jpg` (copied)
- Create: `covers/james.jpg` (copied)

**Interfaces:** none — `js/data.js` and `js/app.js` already reference these exact paths; no code changes.

- [ ] **Step 1: Copy the files into place**

```bash
cd ~/personal-projects/jasons-sleepytime-stories
cp "/Users/jason.chao/Downloads/demon.jpg" covers/demon-copperhead.jpg
cp "/Users/jason.chao/Downloads/james.jpg" covers/james.jpg
```

- [ ] **Step 2: Verify**

Run: `file covers/demon-copperhead.jpg covers/james.jpg`
Expected: both report `JPEG image data`.

- [ ] **Step 3: Commit**

```bash
git add covers/demon-copperhead.jpg covers/james.jpg
git commit -m "content: add real cover images for Demon Copperhead and James"
```

---

### Task 2: Real Chapter Titles and Durations in the Data Model

**Files:**
- Modify: `js/data.js`
- Modify: `tests/data.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (unchanged export names, changed shape): `BOOKS` — each chapter object gains a `durationSeconds` number field, and `title` becomes `"Chapter N: <Name>"` instead of `"Chapter N"`. `makeChapters(bookSlug, filePrefix, titles, durations)` — signature changes from `(bookSlug, filePrefix, count)` to `(bookSlug, filePrefix, titles, durations)`; count is now `titles.length`. `INTRO_FILE` unchanged.

- [ ] **Step 1: Update `tests/data.test.js` to match the new shape (write this first — it will fail until Step 2 lands)**

```js
const assert = require('assert');
const { BOOKS, INTRO_FILE } = require('../js/data.js');

assert.strictEqual(INTRO_FILE, 'audio/intro.m4a', 'INTRO_FILE path');
assert.strictEqual(BOOKS.length, 2, 'exactly two books');

const demon = BOOKS.find(b => b.slug === 'demon-copperhead');
assert.ok(demon, 'demon-copperhead book exists');
assert.strictEqual(demon.title, 'Demon Copperhead');
assert.strictEqual(demon.cover, 'covers/demon-copperhead.jpg');
assert.strictEqual(demon.chapters.length, 35, 'Demon Copperhead has 35 chapters');
assert.deepStrictEqual(demon.chapters[0], {
  slug: '1',
  title: 'Chapter 1: Trailer Park Birth',
  file: 'audio/demon-copperhead/Demon 1.m4a',
  durationSeconds: 477.394667,
});
assert.deepStrictEqual(demon.chapters[34], {
  slug: '35',
  title: 'Chapter 35: Angus and Ocean',
  file: 'audio/demon-copperhead/Demon 35.m4a',
  durationSeconds: 687.229333,
});

const james = BOOKS.find(b => b.slug === 'james');
assert.ok(james, 'james book exists');
assert.strictEqual(james.title, 'James');
assert.strictEqual(james.cover, 'covers/james.jpg');
assert.strictEqual(james.chapters.length, 16, 'James has 16 chapters');
assert.deepStrictEqual(james.chapters[0], {
  slug: '1',
  title: "Chapter 1: Meet Jim's Family",
  file: 'audio/james/James 1.m4a',
  durationSeconds: 234.706667,
});
assert.deepStrictEqual(james.chapters[15], {
  slug: '16',
  title: 'Chapter 16: Reunited, Escape North',
  file: 'audio/james/James 16.m4a',
  durationSeconds: 86.440000,
});

console.log('data.test.js: all assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/data.test.js`
Expected: `AssertionError` (current `demon.chapters[0].title` is `'Chapter 1'`, not `'Chapter 1: Trailer Park Birth'`, and has no `durationSeconds` field).

- [ ] **Step 3: Rewrite `js/data.js`**

```js
const INTRO_FILE = "audio/intro.m4a";

function makeChapters(bookSlug, filePrefix, titles, durations) {
  return titles.map((name, idx) => {
    const n = idx + 1;
    return {
      slug: String(n),
      title: `Chapter ${n}: ${name}`,
      file: `audio/${bookSlug}/${filePrefix} ${n}.m4a`,
      durationSeconds: durations[idx],
    };
  });
}

const DEMON_TITLES = [
  "Trailer Park Birth",
  "Meeting Emmy",
  "Stoner Turns Abusive",
  "Mariah's Story",
  "Mom Overdoses",
  "Creaky's Farm",
  "Fast Forward's Squad",
  "Miss Sparks Visit",
  "Mom's Pregnant",
  "Mom Dies",
  "The Macabres",
  "Dump Job",
  "Running Away",
  "Hitchhiking South",
  "Grandma and Dick",
  "Meeting Coach",
  "Angus and Art",
  "June's Dome House",
  "Coach Adopts Him",
  "High School Starts",
  "U-Haul's Threats",
  "Fast Forward Returns",
  "Meeting Dory",
  "Knee Injury Pills",
  "Peggett's Funeral",
  "Ocean Trip Fails",
  "Dory's Dad Dies",
  "Emmy Runs Away",
  "Comic Strip Deal",
  "Finding Emmy",
  "U-Haul Confronted",
  "Dory Overdoses",
  "Devil's Bathtub",
  "Rehab in Knoxville",
  "Angus and Ocean",
];

const DEMON_DURATIONS = [
  477.394667, 422.440000, 263.890667, 507.730667, 536.957333,
  190.589333, 379.176000, 284.925333, 567.378667, 633.853333,
  543.272000, 397.736000, 325.885333, 445.992000, 238.674667,
  594.301333, 393.554667, 500.648000, 615.677333, 394.152000,
  436.221333, 257.533333, 473.042667, 700.328000, 409.810667,
  501.202667, 372.861333, 441.938667, 760.274667, 482.941333,
  319.826667, 576.424000, 569.853333, 370.898667, 687.229333,
];

const JAMES_TITLES = [
  "Meet Jim's Family",
  "Sold, Jim Runs",
  "Huck Fakes Death",
  "Snakebite Fever Dream",
  "Robbers' Boat Heist",
  "Storm Separates Them",
  "Pencil and Whipping",
  "Duke and King",
  "Sold and Beaten",
  "Sold to Singer",
  "Blackface Performance",
  "Hair Almost Caught",
  "Sammy Dies Escaping",
  "Boat Explosion",
  "Freeing the Slaves",
  "Reunited, Escape North",
];

const JAMES_DURATIONS = [
  234.706667, 371.922667, 321.746667, 564.178667, 513.320000,
  224.680000, 513.746667, 536.872000, 545.234667, 152.189333,
  438.098667, 211.240000, 511.528000, 758.952000, 43.133333,
  86.440000,
];

const BOOKS = [
  {
    slug: "demon-copperhead",
    title: "Demon Copperhead",
    cover: "covers/demon-copperhead.jpg",
    chapters: makeChapters("demon-copperhead", "Demon", DEMON_TITLES, DEMON_DURATIONS),
  },
  {
    slug: "james",
    title: "James",
    cover: "covers/james.jpg",
    chapters: makeChapters("james", "James", JAMES_TITLES, JAMES_DURATIONS),
  },
];

if (typeof module !== 'undefined') {
  module.exports = { BOOKS, INTRO_FILE, makeChapters };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/data.test.js`
Expected: `data.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add js/data.js tests/data.test.js
git commit -m "feat: add real chapter titles and durations to data model"
```

---

### Task 3: Time-Based Progress on the Home Screen

**Files:**
- Modify: `js/app.js` (add helpers + update `renderHome`)
- Modify: `tests/app-render.test.js` (update the `renderHome` assertions)

**Interfaces:**
- Consumes: `BOOKS` (Task 2, now with `durationSeconds`), `getCompletedCount`, `isChapterComplete` (`js/progress.js`, unchanged).
- Produces (new, module-local but usable by later tasks in the same file): `formatDuration(totalSeconds)` → string like `"4h 28m"` or `"15m"` (no `"0h"` prefix when under an hour); `totalDurationSeconds(book)` → sum of a book's `chapters[].durationSeconds`; `completedDurationSeconds(book)` → sum of durations for chapters where `isChapterComplete(book.slug, chapter.slug)` is true. These three helpers do not need a `module.exports` entry of their own — they're only consumed by `renderHome`/`renderBookScreen` in this same file, verified indirectly through those functions' output strings, matching this file's existing test style.

- [ ] **Step 1: Update `tests/app-render.test.js`'s `renderHome` section**

Replace only the `renderHome` assertions (leave the rest of the file as-is for now — Task 4 replaces the `renderChapterList`/`renderPlayerView` sections):

```js
const home = renderHome();
assert.ok(home.includes("Jason's Sleepytime Stories"), 'home shows the headline');
assert.ok(home.includes('Demon Copperhead'), 'home lists Demon Copperhead');
assert.ok(home.includes('James'), 'home lists James');
assert.ok(home.includes('0/35 chapters'), 'home shows 0/35 before any progress');
assert.ok(home.includes('4h 28m'), 'home shows Demon Copperhead total runtime');
assert.ok(home.includes('1h 40m'), 'home shows James total runtime');

markChapterComplete('demon-copperhead', '1');
markChapterComplete('demon-copperhead', '2');
const homeAfter = renderHome();
assert.ok(homeAfter.includes('2/35 chapters'), 'home reflects completed chapter count');
assert.ok(homeAfter.includes('15m'), 'home reflects completed-time progress');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/app-render.test.js`
Expected: `AssertionError` (current `renderHome` output has no runtime text at all).

- [ ] **Step 3: Add the helpers and update `renderHome` in `js/app.js`**

Add these three functions above `renderHome` (which already exists as the first function in the file):

```js
function formatDuration(totalSeconds) {
  const totalMinutes = Math.round(totalSeconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

function totalDurationSeconds(book) {
  return book.chapters.reduce((sum, c) => sum + c.durationSeconds, 0);
}

function completedDurationSeconds(book) {
  return book.chapters
    .filter(c => isChapterComplete(book.slug, c.slug))
    .reduce((sum, c) => sum + c.durationSeconds, 0);
}
```

Replace the existing `renderHome` function's card template with:

```js
function renderHome() {
  const cards = BOOKS.map(book => {
    const total = book.chapters.length;
    const completed = getCompletedCount(book.slug);
    const totalTime = formatDuration(totalDurationSeconds(book));
    const completedTime = formatDuration(completedDurationSeconds(book));
    return `
      <a class="book-card" href="#/${book.slug}">
        <img class="book-cover" src="${book.cover}" onerror="this.style.display='none'; this.parentElement.classList.add('cover-missing')">
        <div class="book-info">
          <h2>${book.title}</h2>
          <p class="book-progress">${completed}/${total} chapters &middot; ${completedTime} of ${totalTime}</p>
        </div>
      </a>`;
  }).join('');

  return `
    <header class="site-header"><h1>Jason's Sleepytime Stories</h1></header>
    <div class="book-list">${cards}</div>
  `;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/app-render.test.js`
Expected: `app-render.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add js/app.js tests/app-render.test.js
git commit -m "feat: show time-based progress alongside chapter count on Home"
```

---

### Task 4: Merge Chapter List and Player into One Book Screen (pure render + router)

**Files:**
- Modify: `js/app.js` (replace `renderChapterList` + `renderPlayerView` with `renderBookScreen`; update `route()`)
- Modify: `tests/app-render.test.js` (replace the chapter-list/player-view sections with `renderBookScreen` tests)

**Interfaces:**
- Consumes: `BOOKS`, `isChapterComplete`, `getCompletedCount`, `formatDuration`, `totalDurationSeconds`, `completedDurationSeconds` (all already in `js/app.js` after Tasks 2-3).
- Produces: `renderBookScreen(bookSlug)` — pure function returning the full Book screen HTML string (hero cover, title, progress line, chapter list, and a sticky player-bar shell that starts hidden). Each chapter row has `id="chapter-row-<slug>"` and `data-chapter-slug="<slug>"` — Task 5's `js/player.js` depends on these exact attribute names to bind clicks and update rows in place. The player-bar shell has fixed element IDs Task 5 depends on: `player-bar` (the bar's outer container, starts with class `hidden`), `player-cover`, `player-title`, `btn-prev`, `btn-playpause`, `btn-next`, `scrub`, `time-current`, `time-duration`.
- `route()` changes from three hash levels to two: `parts.length === 0` → Home; otherwise (any `parts.length >= 1`) → look up the book by `parts[0]`, falling back to Home if not found (this fallback already exists from iteration 1 — keep it), then render `renderBookScreen(parts[0])` and call `Player.mountBookScreen(parts[0])` (the new entry point Task 5 will define, replacing `Player.startSession`).

- [ ] **Step 1: Update `tests/app-render.test.js`'s chapter-list/player sections**

Replace the `renderChapterList`/`renderPlayerView` block (everything from `const list = renderChapterList(...)` through the `player` assertions) with:

```js
const screen = renderBookScreen('demon-copperhead');
assert.ok(screen.includes('Chapter 1: Trailer Park Birth'), 'book screen shows real chapter 1 title');
assert.ok(screen.includes('Chapter 35: Angus and Ocean'), 'book screen shows real chapter 35 title');
assert.ok(screen.includes('id="chapter-row-1"'), 'chapter row has a stable id for Player to target');
assert.ok(screen.includes('data-chapter-slug="1"'), 'chapter row carries its slug for click handling');
assert.ok(screen.includes('4h 28m'), 'book screen shows total runtime');
assert.ok(screen.includes('id="player-bar"') && screen.includes('hidden'), 'player bar starts hidden');
assert.ok(screen.includes('id="btn-playpause"'), 'player bar has a play/pause button');
assert.ok(screen.includes('id="btn-prev"'), 'player bar has a previous button');
assert.ok(screen.includes('id="btn-next"'), 'player bar has a next button');
assert.ok(screen.includes('id="scrub"'), 'player bar has a scrub bar');
assert.ok(screen.includes('id="player-title"'), 'player bar has a title element');
assert.ok(screen.includes('id="player-cover"'), 'player bar has a cover thumbnail element');

markChapterComplete('demon-copperhead', '1');
const screenAfter = renderBookScreen('demon-copperhead');
assert.ok(screenAfter.includes('class="chapter-row complete" id="chapter-row-1"'), 'chapter-row-1 gets the complete class once marked done');
assert.ok(screenAfter.includes('✓'), 'a checkmark appears after marking chapter 1 complete');
```

Also update the top `require` line from:
```js
const { renderHome, renderChapterList, renderPlayerView } = require('../js/app.js');
```
to:
```js
const { renderHome, renderBookScreen } = require('../js/app.js');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/app-render.test.js`
Expected: `TypeError: renderBookScreen is not a function` (doesn't exist yet).

- [ ] **Step 3: Replace `renderChapterList` and `renderPlayerView` with `renderBookScreen` in `js/app.js`**

Delete the existing `renderChapterList` and `renderPlayerView` functions and their `module.exports` line, replacing with:

```js
function renderBookScreen(bookSlug) {
  const book = BOOKS.find(b => b.slug === bookSlug);
  const total = book.chapters.length;
  const completed = getCompletedCount(bookSlug);
  const totalTime = formatDuration(totalDurationSeconds(book));
  const completedTime = formatDuration(completedDurationSeconds(book));

  const rows = book.chapters.map(ch => {
    const done = isChapterComplete(bookSlug, ch.slug);
    return `
      <a class="chapter-row ${done ? 'complete' : ''}" id="chapter-row-${ch.slug}" href="#" data-chapter-slug="${ch.slug}">
        <span class="chapter-check">${done ? '✓' : ''}</span>
        <span class="chapter-title">${ch.title}</span>
      </a>`;
  }).join('');

  return `
    <a class="back-link" href="#/">&larr; Back</a>
    <img class="book-hero" src="${book.cover}" onerror="this.style.display='none'">
    <h1>${book.title}</h1>
    <p class="book-progress">${completed}/${total} chapters &middot; ${completedTime} of ${totalTime}</p>
    <div class="chapter-list">${rows}</div>
    <div id="player-bar" class="player-bar hidden">
      <img id="player-cover" class="player-bar-cover" src="${book.cover}" onerror="this.style.display='none'">
      <div class="player-bar-main">
        <div id="player-title" class="player-bar-title"></div>
        <input id="scrub" type="range" min="0" max="100" value="0">
        <div class="time-row">
          <span id="time-current">0:00</span>
          <span id="time-duration">0:00</span>
        </div>
      </div>
      <div class="player-bar-controls">
        <button id="btn-prev">&#9198;</button>
        <button id="btn-playpause">&#9654;</button>
        <button id="btn-next">&#9197;</button>
      </div>
    </div>
  `;
}

if (typeof module !== 'undefined') {
  module.exports = { renderHome, renderBookScreen };
}
```

- [ ] **Step 4: Update `route()` in `js/app.js`**

Replace the existing `route()` function with:

```js
function route() {
  const hash = window.location.hash.slice(1); // drop leading '#'
  const parts = hash.split('/').filter(Boolean);
  const app = document.getElementById('app');

  if (parts.length === 0) {
    app.innerHTML = renderHome();
    return;
  }
  if (!BOOKS.find(b => b.slug === parts[0])) {
    app.innerHTML = renderHome();
    return;
  }
  app.innerHTML = renderBookScreen(parts[0]);
  Player.mountBookScreen(parts[0]);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/app-render.test.js`
Expected: `app-render.test.js: all assertions passed`

Note: this test run only exercises the pure render functions — `route()` itself touches `document`/`window` and is not Node-testable, same as iteration 1. It will be verified by code reading plus Jason's manual browser check (Task 7).

- [ ] **Step 6: Commit**

```bash
git add js/app.js tests/app-render.test.js
git commit -m "feat: merge chapter list and player into one Book screen"
```

---

### Task 5: Rewrite the Playback Engine for the Merged Screen

**Files:**
- Modify: `js/player.js` (full rewrite)

**Interfaces:**
- Consumes: `BOOKS`, `INTRO_FILE` (`js/data.js`), `markChapterComplete` (`js/progress.js`), the DOM elements `renderBookScreen` produces (Task 4): `#player-bar`, `#player-cover`, `#player-title`, `#btn-prev`, `#btn-playpause`, `#btn-next`, `#scrub`, `#time-current`, `#time-duration`, and every `.chapter-row[data-chapter-slug]` / `#chapter-row-<slug>`.
- Produces (global): `Player.mountBookScreen(bookSlug)` — called by `route()` (Task 4) every time the Book screen is entered. Replaces the old `Player.startSession(bookSlug, chapterSlug)`. Does NOT autoplay anything — it only wires up click handlers on the chapter rows and the bar's controls. Playback starts only when a chapter row is clicked.

Fixes the intro-mislabeling bug from this iteration's feedback: the player-bar title shows `"Intro"` while the shared intro plays, switching to the real chapter title once the chapter itself starts.

- [ ] **Step 1: Replace the entire contents of `js/player.js`**

```js
(function () {
  const AUDIO = document.getElementById('audio-player');
  let currentBook = null;
  let currentIndex = null;
  let introPlaying = false;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function resetPlayIcon() {
    const btn = document.getElementById('btn-playpause');
    if (btn) btn.innerHTML = '&#9654;';
  }

  function updateTitle() {
    const titleEl = document.getElementById('player-title');
    if (!titleEl || currentIndex === null) return;
    titleEl.textContent = introPlaying ? 'Intro' : currentBook.chapters[currentIndex].title;
  }

  function updateActiveRow() {
    document.querySelectorAll('.chapter-row.active').forEach(el => el.classList.remove('active'));
    if (currentIndex === null) return;
    const row = document.getElementById('chapter-row-' + currentBook.chapters[currentIndex].slug);
    if (row) row.classList.add('active');
  }

  function markRowComplete(slug) {
    const row = document.getElementById('chapter-row-' + slug);
    if (!row) return;
    row.classList.add('complete');
    const check = row.querySelector('.chapter-check');
    if (check) check.textContent = '✓';
  }

  function togglePlayPause() {
    if (AUDIO.paused) {
      AUDIO.play().catch(resetPlayIcon);
    } else {
      AUDIO.pause();
    }
  }

  function loadChapter(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= currentBook.chapters.length) return;
    currentIndex = index;
    introPlaying = false;
    updateTitle();
    updateActiveRow();
    AUDIO.src = currentBook.chapters[index].file;
    AUDIO.onended = handleChapterEnded;
    if (opts.autoplay) {
      AUDIO.play().catch(resetPlayIcon);
    }
  }

  function handleChapterEnded() {
    const finishedSlug = currentBook.chapters[currentIndex].slug;
    markChapterComplete(currentBook.slug, finishedSlug);
    markRowComplete(finishedSlug);
    if (currentIndex + 1 < currentBook.chapters.length) {
      loadChapter(currentIndex + 1, { autoplay: true });
    }
  }

  function handleIntroEnded() {
    loadChapter(currentIndex, { autoplay: true });
  }

  function bindBarControls() {
    document.getElementById('btn-playpause').onclick = togglePlayPause;
    document.getElementById('btn-next').onclick = () => loadChapter(currentIndex + 1, { autoplay: true });
    document.getElementById('btn-prev').onclick = () => loadChapter(currentIndex - 1, { autoplay: true });

    const scrub = document.getElementById('scrub');
    scrub.oninput = () => {
      if (AUDIO.duration) {
        AUDIO.currentTime = (scrub.value / 100) * AUDIO.duration;
      }
    };

    AUDIO.ontimeupdate = () => {
      if (AUDIO.duration) {
        scrub.value = (AUDIO.currentTime / AUDIO.duration) * 100;
      }
      const timeEl = document.getElementById('time-current');
      if (timeEl) timeEl.textContent = formatTime(AUDIO.currentTime);
    };
    AUDIO.onloadedmetadata = () => {
      const durEl = document.getElementById('time-duration');
      if (durEl) durEl.textContent = formatTime(AUDIO.duration);
    };
    AUDIO.onplay = () => {
      document.getElementById('btn-playpause').innerHTML = '&#9208;';
    };
    AUDIO.onpause = resetPlayIcon;
  }

  function selectChapter(chapterSlug) {
    currentIndex = currentBook.chapters.findIndex(c => c.slug === chapterSlug);
    if (currentIndex === -1) return;
    document.getElementById('player-bar').classList.remove('hidden');
    introPlaying = true;
    updateTitle();
    updateActiveRow();
    AUDIO.onended = handleIntroEnded;
    AUDIO.src = INTRO_FILE;
    AUDIO.play().catch(resetPlayIcon);
  }

  function mountBookScreen(bookSlug) {
    currentBook = BOOKS.find(b => b.slug === bookSlug);
    currentIndex = null;
    introPlaying = false;
    bindBarControls();
    document.querySelectorAll('.chapter-row').forEach(row => {
      row.onclick = (e) => {
        e.preventDefault();
        selectChapter(row.dataset.chapterSlug);
      };
    });
  }

  window.Player = { mountBookScreen };
})();
```

- [ ] **Step 2: Run the full existing test suite to confirm no regression**

Run: `cd ~/personal-projects/jasons-sleepytime-stories && node tests/data.test.js && node tests/progress.test.js && node tests/app-render.test.js && node tests/audio-files.test.js`
Expected: all four print their `all assertions passed` line. (None of these tests exercise `js/player.js` directly — there's no DOM in Node — so this confirms no *other* file broke, not `player.js` itself. `player.js` correctness is verified by code tracing in review plus Jason's manual check in Task 7.)

- [ ] **Step 3: Trace through the intro-label fix and the merged-screen flow by reading the code, and note in your report exactly what you traced**

Confirm by reading (not by running, since no browser is available): (a) `updateTitle()` shows `'Intro'` whenever `introPlaying` is `true`, and `introPlaying` is only ever `true` between `selectChapter()` being called and `handleIntroEnded()` firing; (b) `selectChapter()` always sets `AUDIO.src = INTRO_FILE` first, regardless of which chapter was clicked; (c) `handleIntroEnded()` calls `loadChapter(currentIndex, ...)` — the originally clicked chapter, not a hardcoded one; (d) neither `loadChapter` nor the prev/next click handlers nor `handleChapterEnded` ever reference `INTRO_FILE`; (e) every `AUDIO.*` handler is set via assignment, never `addEventListener`.

- [ ] **Step 4: Commit**

```bash
git add js/player.js
git commit -m "feat: rewrite playback engine for merged Book screen, fix intro title bug"
```

---

### Task 6: Visual Redesign (dark palette, hero art, sticky bar, headline styling)

**Files:**
- Modify: `css/style.css` (full rewrite)

**Interfaces:** none — pure styling, no JS/HTML structure changes. Must style every class/id introduced by Tasks 4-5: `.book-hero`, `.player-bar` (+ `.hidden`), `.player-bar-cover`, `.player-bar-main`, `.player-bar-title`, `.player-bar-controls`, `.chapter-row.active`.

- [ ] **Step 1: Replace the entire contents of `css/style.css`**

```css
:root {
  --color-bg: #1C1512;
  --color-surface: #2A211C;
  --color-surface-raised: #33281F;
  --color-text: #F2E9DD;
  --color-muted: #B8A99A;
  --color-accent: #D9A15B;
  --color-accent-dark: #B8823F;
  --radius: 12px;
  --font-body: 'DM Sans', sans-serif;
  --font-display: 'Instrument Serif', serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

#app {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.site-header {
  text-align: center;
  margin: 16px 0 32px;
}

.site-header h1 {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  margin: 0 0 12px;
  color: var(--color-accent);
}

.site-header::after {
  content: '';
  display: block;
  width: 64px;
  height: 2px;
  background: var(--color-accent);
  margin: 0 auto;
}

.book-list { display: flex; flex-direction: column; gap: 20px; }

.book-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 10px rgba(0,0,0,0.35);
}

.book-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: var(--color-surface-raised);
  display: block;
}

.book-card.cover-missing .book-cover { display: none; }

.book-info { padding: 14px 16px; }
.book-info h2 { margin: 0 0 6px; font-size: 1.2rem; }
.book-progress { margin: 0; color: var(--color-muted); font-size: 0.85rem; }

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.9rem;
}

.book-hero {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: var(--radius);
  margin-bottom: 16px;
  background: var(--color-surface-raised);
  display: block;
}

.chapter-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }

.chapter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
}

.chapter-row.complete { color: var(--color-muted); }
.chapter-row.active {
  border-color: var(--color-accent);
  background: var(--color-surface-raised);
}
.chapter-check { width: 1.2em; color: var(--color-accent); font-weight: bold; }

.player-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-surface-raised);
  padding: 10px 16px;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.4);
}

.player-bar.hidden { display: none; }

.player-bar-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-surface);
}

.player-bar-main { flex: 1; min-width: 0; }

.player-bar-title {
  font-size: 0.85rem;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-bar-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.player-bar-controls button {
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  cursor: pointer;
}

#btn-playpause { width: 44px; height: 44px; font-size: 1.2rem; }

#scrub { width: 100%; accent-color: var(--color-accent); }

.time-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-muted);
  font-size: 0.75rem;
  margin-top: 2px;
}
```

- [ ] **Step 2: Verify via curl that the file serves correctly**

Run: `cd ~/personal-projects/jasons-sleepytime-stories && python3 -m http.server 8787 & sleep 1 && curl -s http://localhost:8787/css/style.css | grep -c "1C1512"`
Expected: `1`
Stop the server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: dark warm palette, hero cover art, sticky player bar, headline polish"
```

---

### Task 7: Full Regression, Manual Verification, and Deploy

**Files:** none — verification and deployment only.

- [ ] **Step 1: Run the full regression suite**

```bash
cd ~/personal-projects/jasons-sleepytime-stories
node tests/data.test.js && node tests/progress.test.js && node tests/app-render.test.js && node tests/audio-files.test.js
```

Expected: all four print their `all assertions passed` line.

- [ ] **Step 2: Attempt manual verification**

Start a local server: `python3 -m http.server 8787 &`

If the `claude-in-chrome` tool/skill is available, use it to load `http://localhost:8787/`, click through, and confirm behavior. If it is not available (confirmed unavailable earlier this session), do your best by code inspection and note clearly in your report which of these you could only verify by reading the code versus which you actually observed:

1. Home shows the dark palette, real cover art for both books, and each card's chapter-count + time-based progress line.
2. Tapping a book opens the Book screen: hero cover, chapter list with real titles (e.g. "Chapter 1: Trailer Park Birth"), no player bar visible yet.
3. Tapping a chapter row reveals the sticky bottom bar, shows "Intro" as the title, and (once the intro would finish) the title should switch to the real chapter title.
4. The bar's prev/next buttons move between chapters without re-showing "Intro".
5. Tapping a different chapter row directly (not via prev/next) does trigger "Intro" again.
6. Navigating back to Home shows the updated progress.

Stop the server: `kill %1`

- [ ] **Step 3: Push to the live repo**

```bash
git push origin main
```

Expected: push succeeds; GitHub Pages redeploys automatically within about a minute.

- [ ] **Step 4: Confirm the live site serves the updated content**

```bash
curl -s https://jasonchao1122.github.io/jasons-sleepytime-stories/css/style.css | grep -c "1C1512"
```

Expected: `1` (allow a minute and retry once if it initially shows the old CSS — GitHub Pages rebuilds are not instant).
