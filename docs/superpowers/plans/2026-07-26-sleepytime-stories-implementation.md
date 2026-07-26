# Jason's Sleepytime Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static, mobile-friendly audiobook site ("Jason's Sleepytime Stories") that lists two books, plays their chapters in order with auto-advance, gates every fresh listening session behind a shared intro track, and remembers completed chapters across visits.

**Architecture:** A single-page app (`index.html` + plain JS/CSS, no build step, no framework). Three views (Home, Chapter List, Player) are rendered into one `#app` container by a small hash-based router. Pure logic (book/chapter data, localStorage progress, and view-HTML rendering) is kept in plain functions that are unit-testable from Node via `assert`, with a browser-only interactive layer (routing + audio playback wiring) verified manually in an actual browser.

**Tech Stack:** Vanilla HTML/CSS/JS. Node.js (already on the system) + the built-in `assert` module for logic tests — no npm packages, no bundler. `python3 -m http.server` as the local dev server. `gh` CLI (already authenticated as `jasonchao1122`) for GitHub repo creation and Pages setup.

## Global Constraints

- No build step, no framework, no external JS dependencies — plain HTML/CSS/JS only.
- Progress tracked via `localStorage`: completed chapters only, no resume-to-exact-position (a chapter always starts at 0:00).
- Shared intro file (`audio/intro.m4a`) must play before any chapter tapped directly from a chapter list (a "fresh session start"), but must NOT replay when auto-advancing to the next chapter or when using the player's own previous/next buttons.
- Skip controls are previous/next **chapter**, not a seconds-based seek.
- On the last chapter of a book finishing, mark it complete and stop — no auto-return to the chapter list.
- Source audio lives at `/Users/jason.chao/Downloads/Stories`: `Demon 1.m4a` .. `Demon 35.m4a` (35 files), `James 1.m4a` .. `James 16.m4a` (16 files), and one shared `Intro ALL.m4a`. Total ~134MB, largest file ~4.8MB — well under GitHub's 100MB per-file limit, no Git LFS needed.
- Chapter titles are generic "Chapter N" placeholders for now (Jason will supply real titles later as a `js/data.js` edit).
- Cover images (`covers/demon-copperhead.jpg`, `covers/james.jpg`) are not yet provided — the UI must gracefully fall back (hide the broken image, show a solid-color placeholder box) until Jason adds them.
- GitHub: public repo named `meditation-audiobooks` under the personal account `jasonchao1122`, GitHub Pages served from the `main` branch root. Confirm with Jason before the repo-creation/push step (Task 8) — this is the point where the plan starts changing his GitHub account.
- Site headline "Jason's Sleepytime Stories" must appear on the home screen itself, not just the page `<title>`.

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Produces: the DOM structure later tasks depend on — `#app` container element, and a persistent `<audio id="audio-player">` element.

- [ ] **Step 1: Create the folder structure and base files**

```bash
mkdir -p css js covers audio
touch covers/.gitkeep audio/.gitkeep
```

- [ ] **Step 2: Write `.gitignore`**

```
.DS_Store
```

- [ ] **Step 3: Write `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jason's Sleepytime Stories</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Instrument+Serif&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app"></div>
  <audio id="audio-player" preload="metadata" style="display:none"></audio>
  <script src="js/data.js"></script>
  <script src="js/progress.js"></script>
  <script src="js/player.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Write `css/style.css`**

```css
:root {
  --color-bg: #FAF3E8;
  --color-surface: #FFFDF8;
  --color-text: #3B2F2A;
  --color-muted: #8A7A6D;
  --color-accent: #B0765C;
  --color-accent-dark: #8C5A44;
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
  padding: 24px 16px 80px;
}

.site-header h1 {
  font-family: var(--font-display);
  font-size: 2.25rem;
  margin: 8px 0 24px;
  text-align: center;
  color: var(--color-accent-dark);
}

.book-list { display: flex; flex-direction: column; gap: 16px; }

.book-card {
  display: flex;
  gap: 16px;
  align-items: center;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 12px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.book-cover {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--color-accent);
  flex-shrink: 0;
}

.book-card.cover-missing .book-cover { display: none; }

.book-info h2 { margin: 0 0 4px; font-size: 1.1rem; }
.book-progress { margin: 0; color: var(--color-muted); font-size: 0.85rem; }

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-accent-dark);
  text-decoration: none;
  font-size: 0.9rem;
}

.chapter-list { display: flex; flex-direction: column; gap: 8px; }

.chapter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
}

.chapter-row.complete { color: var(--color-muted); }
.chapter-check { width: 1.2em; color: var(--color-accent); font-weight: bold; }

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin: 32px 0 16px;
}

.player-controls button {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 1.4rem;
  cursor: pointer;
}

#btn-playpause { width: 72px; height: 72px; font-size: 1.8rem; }

#scrub { width: 100%; accent-color: var(--color-accent); }

.time-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-muted);
  font-size: 0.8rem;
  margin-top: 4px;
}
```

- [ ] **Step 5: Write `README.md`**

```markdown
# Jason's Sleepytime Stories

A personal audiobook-style site. Plain HTML/CSS/JS, no build step, hosted
free on GitHub Pages.

## Run locally

    python3 -m http.server 8787

Then open http://localhost:8787/

## Add a new book

1. Add an entry to the `BOOKS` array in `js/data.js` (slug, title, cover
   path, and a `makeChapters(bookSlug, filePrefix, count)` call).
2. Drop a cover image at `covers/<slug>.jpg`.
3. Drop the audio files at `audio/<slug>/` using the exact filenames
   referenced by `makeChapters`.
4. Commit and push — GitHub Pages redeploys automatically.

## Deploy an update

    git add -A
    git commit -m "describe the change"
    git push
```

- [ ] **Step 6: Start a local server and verify the shell loads**

Run: `cd ~/personal-projects/meditation-audiobooks && python3 -m http.server 8787 &`
Then: `sleep 1 && curl -s http://localhost:8787/ | grep -c "Jason's Sleepytime Stories"`
Expected: `1` (the `<title>` tag match)

Stop the server afterward: `kill %1` (or find/kill the `http.server` process).

- [ ] **Step 7: Commit**

```bash
git add index.html css/ .gitignore README.md covers/.gitkeep audio/.gitkeep
git commit -m "chore: scaffold static site shell"
```

---

### Task 2: Book & Chapter Data Model

**Files:**
- Create: `js/data.js`
- Test: `tests/data.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (globals, browser; module.exports, Node): `BOOKS` (array of `{ slug, title, cover, chapters: [{ slug, title, file }] }`), `INTRO_FILE` (string path), `makeChapters(bookSlug, filePrefix, count)`.

- [ ] **Step 1: Write the failing test**

```js
// tests/data.test.js
const assert = require('assert');
const { BOOKS, INTRO_FILE } = require('../js/data.js');

assert.strictEqual(INTRO_FILE, 'audio/intro.m4a', 'INTRO_FILE path');
assert.strictEqual(BOOKS.length, 2, 'exactly two books');

const demon = BOOKS.find(b => b.slug === 'demon-copperhead');
assert.ok(demon, 'demon-copperhead book exists');
assert.strictEqual(demon.title, 'Demon Copperhead');
assert.strictEqual(demon.cover, 'covers/demon-copperhead.jpg');
assert.strictEqual(demon.chapters.length, 35, 'Demon Copperhead has 35 chapters');
assert.deepStrictEqual(demon.chapters[0], { slug: '1', title: 'Chapter 1', file: 'audio/demon-copperhead/Demon 1.m4a' });
assert.deepStrictEqual(demon.chapters[34], { slug: '35', title: 'Chapter 35', file: 'audio/demon-copperhead/Demon 35.m4a' });

const james = BOOKS.find(b => b.slug === 'james');
assert.ok(james, 'james book exists');
assert.strictEqual(james.title, 'James');
assert.strictEqual(james.cover, 'covers/james.jpg');
assert.strictEqual(james.chapters.length, 16, 'James has 16 chapters');
assert.deepStrictEqual(james.chapters[0], { slug: '1', title: 'Chapter 1', file: 'audio/james/James 1.m4a' });
assert.deepStrictEqual(james.chapters[15], { slug: '16', title: 'Chapter 16', file: 'audio/james/James 16.m4a' });

console.log('data.test.js: all assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/data.test.js`
Expected: `Error: Cannot find module '../js/data.js'`

- [ ] **Step 3: Write `js/data.js`**

```js
const INTRO_FILE = "audio/intro.m4a";

function makeChapters(bookSlug, filePrefix, count) {
  const chapters = [];
  for (let i = 1; i <= count; i++) {
    chapters.push({
      slug: String(i),
      title: `Chapter ${i}`,
      file: `audio/${bookSlug}/${filePrefix} ${i}.m4a`,
    });
  }
  return chapters;
}

const BOOKS = [
  {
    slug: "demon-copperhead",
    title: "Demon Copperhead",
    cover: "covers/demon-copperhead.jpg",
    chapters: makeChapters("demon-copperhead", "Demon", 35),
  },
  {
    slug: "james",
    title: "James",
    cover: "covers/james.jpg",
    chapters: makeChapters("james", "James", 16),
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
git commit -m "feat: add book/chapter data model"
```

---

### Task 3: Progress Tracking (localStorage)

**Files:**
- Create: `js/progress.js`
- Test: `tests/progress.test.js`

**Interfaces:**
- Consumes: nothing (uses the ambient `localStorage`, real in browsers, shimmed in the test).
- Produces (globals, browser; module.exports, Node): `loadProgress()`, `saveProgress(progress)`, `isChapterComplete(bookSlug, chapterSlug)`, `markChapterComplete(bookSlug, chapterSlug)`, `getCompletedCount(bookSlug)`.

- [ ] **Step 1: Write the failing test**

```js
// tests/progress.test.js
const assert = require('assert');

// Minimal localStorage shim so this file's logic can run under plain Node.
global.localStorage = (function () {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    clear: () => { store = {}; },
  };
})();

const {
  isChapterComplete,
  markChapterComplete,
  getCompletedCount,
} = require('../js/progress.js');

assert.strictEqual(isChapterComplete('demon-copperhead', '1'), false, 'nothing complete yet');
assert.strictEqual(getCompletedCount('demon-copperhead'), 0, 'zero completed initially');

markChapterComplete('demon-copperhead', '1');
assert.strictEqual(isChapterComplete('demon-copperhead', '1'), true, 'chapter 1 now complete');
assert.strictEqual(getCompletedCount('demon-copperhead'), 1, 'one completed');

markChapterComplete('demon-copperhead', '1'); // marking twice must not duplicate
assert.strictEqual(getCompletedCount('demon-copperhead'), 1, 'still one completed after duplicate mark');

markChapterComplete('james', '1');
assert.strictEqual(getCompletedCount('demon-copperhead'), 1, 'books tracked independently');
assert.strictEqual(getCompletedCount('james'), 1, 'james has its own count');

console.log('progress.test.js: all assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/progress.test.js`
Expected: `Error: Cannot find module '../js/progress.js'`

- [ ] **Step 3: Write `js/progress.js`**

```js
const PROGRESS_KEY = "sleepytime-progress";

function loadProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function isChapterComplete(bookSlug, chapterSlug) {
  const progress = loadProgress();
  const completed = progress[bookSlug] || [];
  return completed.includes(chapterSlug);
}

function markChapterComplete(bookSlug, chapterSlug) {
  const progress = loadProgress();
  const completed = progress[bookSlug] || [];
  if (!completed.includes(chapterSlug)) {
    completed.push(chapterSlug);
  }
  progress[bookSlug] = completed;
  saveProgress(progress);
}

function getCompletedCount(bookSlug) {
  const progress = loadProgress();
  return (progress[bookSlug] || []).length;
}

if (typeof module !== 'undefined') {
  module.exports = {
    loadProgress,
    saveProgress,
    isChapterComplete,
    markChapterComplete,
    getCompletedCount,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/progress.test.js`
Expected: `progress.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add js/progress.js tests/progress.test.js
git commit -m "feat: add localStorage progress tracking"
```

---

### Task 4: Add Real Audio Content

**Files:**
- Create: `audio/demon-copperhead/Demon 1.m4a` .. `Demon 35.m4a` (copied)
- Create: `audio/james/James 1.m4a` .. `James 16.m4a` (copied)
- Create: `audio/intro.m4a` (copied and renamed from `Intro ALL.m4a`)
- Test: `tests/audio-files.test.js`

**Interfaces:**
- Consumes: `BOOKS`, `INTRO_FILE` from `js/data.js` (Task 2).
- Produces: on-disk files at every path `js/data.js` references, so the player (Task 7) has real audio to load.

- [ ] **Step 1: Write the failing test**

```js
// tests/audio-files.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { BOOKS, INTRO_FILE } = require('../js/data.js');

const projectRoot = path.join(__dirname, '..');

assert.ok(fs.existsSync(path.join(projectRoot, INTRO_FILE)), `missing ${INTRO_FILE}`);

for (const book of BOOKS) {
  for (const chapter of book.chapters) {
    const full = path.join(projectRoot, chapter.file);
    assert.ok(fs.existsSync(full), `missing ${chapter.file}`);
  }
}

console.log('audio-files.test.js: all assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/audio-files.test.js`
Expected: `AssertionError [ERR_ASSERTION]: missing audio/intro.m4a` (or the first missing chapter file)

- [ ] **Step 3: Copy the real audio files into place**

```bash
cd ~/personal-projects/meditation-audiobooks
mkdir -p audio/demon-copperhead audio/james
SRC="/Users/jason.chao/Downloads/Stories"

for i in $(seq 1 35); do
  cp "$SRC/Demon $i.m4a" "audio/demon-copperhead/Demon $i.m4a"
done

for i in $(seq 1 16); do
  cp "$SRC/James $i.m4a" "audio/james/James $i.m4a"
done

cp "$SRC/Intro ALL.m4a" "audio/intro.m4a"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/audio-files.test.js`
Expected: `audio-files.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add audio/
git commit -m "content: add Demon Copperhead and James audio chapters"
```

Note: this commit is ~134MB — expect it to take longer than the code commits, but it's a one-time add well within GitHub's limits.

---

### Task 5: Pure View Rendering Functions

**Files:**
- Create: `js/app.js` (render functions only — routing wiring comes in Task 6)
- Test: `tests/app-render.test.js`

**Interfaces:**
- Consumes: `BOOKS` (Task 2), `isChapterComplete`, `getCompletedCount` (Task 3).
- Produces (globals, browser; module.exports, Node): `renderHome()`, `renderChapterList(bookSlug)`, `renderPlayerView(bookSlug, chapterSlug)` — each returns an HTML string, no DOM access.

- [ ] **Step 1: Write the failing test**

```js
// tests/app-render.test.js
const assert = require('assert');

global.localStorage = (function () {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    clear: () => { store = {}; },
  };
})();

const { BOOKS } = require('../js/data.js');
const { isChapterComplete, markChapterComplete, getCompletedCount } = require('../js/progress.js');
global.BOOKS = BOOKS;
global.isChapterComplete = isChapterComplete;
global.getCompletedCount = getCompletedCount;

const { renderHome, renderChapterList, renderPlayerView } = require('../js/app.js');

const home = renderHome();
assert.ok(home.includes("Jason's Sleepytime Stories"), 'home shows the headline');
assert.ok(home.includes('Demon Copperhead'), 'home lists Demon Copperhead');
assert.ok(home.includes('James'), 'home lists James');
assert.ok(home.includes('0/35 chapters complete'), 'home shows 0/35 before any progress');

markChapterComplete('demon-copperhead', '1');
const homeAfter = renderHome();
assert.ok(homeAfter.includes('1/35 chapters complete'), 'home reflects completed chapter count');

const list = renderChapterList('demon-copperhead');
assert.ok(list.includes('Chapter 1'), 'chapter list shows Chapter 1');
assert.ok(list.includes('Chapter 35'), 'chapter list shows Chapter 35');
assert.ok(list.includes('complete'), 'completed chapter row is marked complete');

const player = renderPlayerView('demon-copperhead', '1');
assert.ok(player.includes('id="btn-playpause"'), 'player has a play/pause button');
assert.ok(player.includes('id="btn-prev"'), 'player has a previous button');
assert.ok(player.includes('id="btn-next"'), 'player has a next button');
assert.ok(player.includes('id="scrub"'), 'player has a scrub bar');

console.log('app-render.test.js: all assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/app-render.test.js`
Expected: `Error: Cannot find module '../js/app.js'`

- [ ] **Step 3: Write `js/app.js` (render functions)**

```js
function renderHome() {
  const cards = BOOKS.map(book => {
    const total = book.chapters.length;
    const completed = getCompletedCount(book.slug);
    return `
      <a class="book-card" href="#/${book.slug}">
        <img class="book-cover" src="${book.cover}" onerror="this.style.display='none'; this.parentElement.classList.add('cover-missing')">
        <div class="book-info">
          <h2>${book.title}</h2>
          <p class="book-progress">${completed}/${total} chapters complete</p>
        </div>
      </a>`;
  }).join('');

  return `
    <header class="site-header"><h1>Jason's Sleepytime Stories</h1></header>
    <div class="book-list">${cards}</div>
  `;
}

function renderChapterList(bookSlug) {
  const book = BOOKS.find(b => b.slug === bookSlug);
  const rows = book.chapters.map(ch => {
    const done = isChapterComplete(bookSlug, ch.slug);
    return `
      <a class="chapter-row ${done ? 'complete' : ''}" href="#/${bookSlug}/${ch.slug}">
        <span class="chapter-check">${done ? '✓' : ''}</span>
        <span class="chapter-title">${ch.title}</span>
      </a>`;
  }).join('');

  return `
    <a class="back-link" href="#/">&larr; Back</a>
    <h1>${book.title}</h1>
    <div class="chapter-list">${rows}</div>
  `;
}

function renderPlayerView(bookSlug, chapterSlug) {
  return `
    <a class="back-link" href="#/${bookSlug}">&larr; Back to chapters</a>
    <h1 id="player-book-title"></h1>
    <h2 id="player-chapter-title"></h2>
    <div class="player-controls">
      <button id="btn-prev">&#9198;</button>
      <button id="btn-playpause">&#9654;</button>
      <button id="btn-next">&#9197;</button>
    </div>
    <input id="scrub" type="range" min="0" max="100" value="0">
    <div class="time-row">
      <span id="time-current">0:00</span>
      <span id="time-duration">0:00</span>
    </div>
  `;
}

if (typeof module !== 'undefined') {
  module.exports = { renderHome, renderChapterList, renderPlayerView };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/app-render.test.js`
Expected: `app-render.test.js: all assertions passed`

- [ ] **Step 5: Commit**

```bash
git add js/app.js tests/app-render.test.js
git commit -m "feat: add pure view-rendering functions"
```

---

### Task 6: Router Wiring (Home + Chapter List navigation)

**Files:**
- Modify: `js/app.js` (append routing logic below the render functions from Task 5)

**Interfaces:**
- Consumes: `renderHome`, `renderChapterList`, `renderPlayerView` (Task 5); will call `Player.startSession(bookSlug, chapterSlug)` once Task 7 exists, but this task can run with Player undefined for the Home/Chapter-List paths (only the player route touches `Player`).
- Produces: a `route()` function bound to `hashchange`/`DOMContentLoaded` that renders the correct view into `#app` based on `location.hash`.

This task's behavior depends on real DOM/`window.location`, so it's verified manually in a browser rather than via a Node script.

- [ ] **Step 1: Append the router to `js/app.js`**

```js
function route() {
  const hash = window.location.hash.slice(1); // drop leading '#'
  const parts = hash.split('/').filter(Boolean);
  const app = document.getElementById('app');

  if (parts.length === 0) {
    app.innerHTML = renderHome();
  } else if (parts.length === 1) {
    app.innerHTML = renderChapterList(parts[0]);
  } else {
    app.innerHTML = renderPlayerView(parts[0], parts[1]);
    Player.startSession(parts[0], parts[1]);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
```

- [ ] **Step 2: Manually verify Home and Chapter List navigation in a browser**

Run: `cd ~/personal-projects/meditation-audiobooks && python3 -m http.server 8787 &`

Open `http://localhost:8787/` in a browser (use the claude-in-chrome tool, or open it yourself) and confirm:
- The page shows the headline "Jason's Sleepytime Stories" and two book cards ("Demon Copperhead" showing "0/35 chapters complete", "James" showing "0/16 chapters complete").
- Since no cover images exist yet, each card should show its solid-color placeholder box, not a broken-image icon (confirms the `onerror` fallback works).
- Clicking "Demon Copperhead" navigates to a chapter list showing "Chapter 1" through "Chapter 35", each with an empty checkbox slot.
- Clicking "Back" (or the browser back button) returns to Home.
- Clicking a chapter (e.g. "Chapter 1") navigates to a player view — it's fine if the player controls don't do anything yet (that's Task 7); just confirm the view renders without a JS error in the console (an error mentioning `Player is not defined` is expected and OK at this point, since Task 7 hasn't been done yet).

Stop the server afterward: `kill %1`.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire up hash-based router for Home and Chapter List views"
```

---

### Task 7: Playback Engine (play/pause, skip, scrub, auto-advance, intro gating)

**Files:**
- Create: `js/player.js`

**Interfaces:**
- Consumes: `BOOKS`, `INTRO_FILE` (Task 2), `markChapterComplete` (Task 3), the DOM elements rendered by `renderPlayerView` (Task 5: `#btn-prev`, `#btn-playpause`, `#btn-next`, `#scrub`, `#time-current`, `#time-duration`, `#player-book-title`, `#player-chapter-title`), and the persistent `<audio id="audio-player">` element (Task 1).
- Produces (global): `Player.startSession(bookSlug, chapterSlug)` — called by `route()` (Task 6) every time the player view is entered from a chapter-list link. This is the single entry point that always plays the intro first.

Key design point: the audio element's event handlers are set via property assignment (`AUDIO.onended = ...`), not `addEventListener`. Re-entering the player view calls `startSession` again, which would otherwise stack duplicate listeners; assignment always overwrites the previous handler instead, so a chapter never "double-advances."

- [ ] **Step 1: Write `js/player.js`**

```js
(function () {
  const AUDIO = document.getElementById('audio-player');
  let currentBook = null;
  let currentIndex = 0;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateTitles() {
    document.getElementById('player-book-title').textContent = currentBook.title;
    document.getElementById('player-chapter-title').textContent = currentBook.chapters[currentIndex].title;
  }

  function togglePlayPause() {
    if (AUDIO.paused) {
      AUDIO.play();
    } else {
      AUDIO.pause();
    }
  }

  function loadChapter(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= currentBook.chapters.length) return;
    currentIndex = index;
    updateTitles();
    AUDIO.src = currentBook.chapters[index].file;
    AUDIO.onended = handleChapterEnded;
    if (opts.autoplay) {
      AUDIO.play();
    }
  }

  function handleChapterEnded() {
    markChapterComplete(currentBook.slug, currentBook.chapters[currentIndex].slug);
    if (currentIndex + 1 < currentBook.chapters.length) {
      loadChapter(currentIndex + 1, { autoplay: true });
    }
  }

  function handleIntroEnded() {
    loadChapter(currentIndex, { autoplay: true });
  }

  function bindControls() {
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
      document.getElementById('time-current').textContent = formatTime(AUDIO.currentTime);
    };
    AUDIO.onloadedmetadata = () => {
      document.getElementById('time-duration').textContent = formatTime(AUDIO.duration);
    };
    AUDIO.onplay = () => {
      document.getElementById('btn-playpause').innerHTML = '&#9208;';
    };
    AUDIO.onpause = () => {
      document.getElementById('btn-playpause').innerHTML = '&#9654;';
    };
  }

  function startSession(bookSlug, chapterSlug) {
    currentBook = BOOKS.find(b => b.slug === bookSlug);
    currentIndex = currentBook.chapters.findIndex(c => c.slug === chapterSlug);
    bindControls();
    updateTitles();
    AUDIO.onended = handleIntroEnded;
    AUDIO.src = INTRO_FILE;
    AUDIO.play();
  }

  window.Player = { startSession };
})();
```

- [ ] **Step 2: Manually verify full playback behavior in a browser**

Run: `cd ~/personal-projects/meditation-audiobooks && python3 -m http.server 8787 &`

Open `http://localhost:8787/` (use the claude-in-chrome tool, or open it yourself) and confirm each of these:

1. From Home, open "Demon Copperhead" → tap "Chapter 1". The intro (`Intro ALL.m4a`, ~30s) plays first; when it ends, Chapter 1 starts automatically without you touching anything.
2. While Chapter 1 plays: tapping the play/pause button pauses/resumes it; dragging the scrub bar seeks within the chapter; the time labels update as it plays.
3. Tap the "next" button — it jumps straight to Chapter 2 **without replaying the intro**.
4. Tap the "previous" button — it jumps back to Chapter 1, again with no intro replay.
5. Navigate back to the chapter list (via the back link) — Chapter 1 (the one that finished or was played) shows a checkmark; the ones not yet played don't.
6. Go back to Home — the Demon Copperhead card now shows an updated "x/35 chapters complete" count.
7. From the chapter list, tap directly into a different chapter (e.g. Chapter 5) — the intro plays again first, confirming a fresh chapter-list tap always re-triggers the intro even though a previous session already played it.
8. Let a chapter play through to its `ended` event (or manually seek near the end and let it finish) — confirm it auto-advances to the next chapter and marks the finished one complete, and that the last chapter in a book (Chapter 35 for Demon Copperhead) simply stops and marks itself complete without navigating anywhere.
9. Reload the page while on `#/demon-copperhead/1` — Home and Chapter List still work correctly, and re-entering the player this way plays the intro again (matches "every fresh session start" behavior).
10. Repeat steps 1–2 on a phone-sized viewport (browser dev tools device toolbar, or an actual phone on the same network) to confirm the layout and controls remain usable at mobile width.

Stop the server afterward: `kill %1`.

- [ ] **Step 3: Commit**

```bash
git add js/player.js
git commit -m "feat: add playback engine with auto-advance and intro gating"
```

---

### Task 8: GitHub Repo, Push, and GitHub Pages

**This task changes Jason's GitHub account (creates a new public repo and pushes content to it). Confirm with Jason immediately before Step 1 if that confirmation hasn't already happened in this session.**

**Files:** none (infrastructure/deployment only).

- [ ] **Step 1: Create the GitHub repo**

```bash
cd ~/personal-projects/meditation-audiobooks
gh repo create jasonchao1122/meditation-audiobooks --public --source=. --remote=origin
```

Expected: output confirming the repo was created at `https://github.com/jasonchao1122/meditation-audiobooks`, and `git remote -v` now shows `origin` pointing there.

- [ ] **Step 2: Push all commits**

```bash
git push -u origin main
```

Expected: push succeeds; `git log --oneline origin/main` matches local `git log --oneline`.

- [ ] **Step 3: Enable GitHub Pages from the `main` branch root**

```bash
gh api repos/jasonchao1122/meditation-audiobooks/pages -X POST --input - <<'EOF'
{"source": {"branch": "main", "path": "/"}}
EOF
```

Expected: JSON response including `"status"` and `"html_url": "https://jasonchao1122.github.io/meditation-audiobooks/"`.

- [ ] **Step 4: Poll until the site is live**

```bash
for i in $(seq 1 12); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://jasonchao1122.github.io/meditation-audiobooks/")
  if [ "$status" = "200" ]; then
    echo "LIVE (200)"
    break
  fi
  echo "Attempt $i: got $status, retrying in 10s..."
  sleep 10
done
```

Expected: `LIVE (200)` within the 12 attempts (~2 minutes). If it never reaches 200, run `gh api repos/jasonchao1122/meditation-audiobooks/pages` and check the `"status"` field for a build error.

- [ ] **Step 5: Confirm the live site works end-to-end**

Open `https://jasonchao1122.github.io/meditation-audiobooks/` (via claude-in-chrome or ask Jason to check on his phone) and re-run the checklist from Task 7 Step 2 against the live URL instead of localhost, confirming playback, auto-advance, intro gating, and progress persistence all work in production the same way they did locally.
