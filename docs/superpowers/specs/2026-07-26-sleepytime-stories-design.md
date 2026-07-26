# Jason's Sleepytime Stories — Design Spec

Date: 2026-07-26

## Purpose

A personal audiobook-style site hosted for free on GitHub Pages. Jason listens
to his own narrated book summaries on his phone; the site remembers which
chapters he's finished across visits.

## Content & Copyright Note

The two books are Jason's own original spoken summaries of the plots of
*Demon Copperhead* and *James* — not verbatim readings of the copyrighted
text, and not commercial audiobook recordings. This keeps the content
appropriate for public hosting on GitHub Pages (which has no real access
control — any repo/Pages content is effectively public to the internet,
regardless of repo visibility settings).

## Architecture

Single-page app: one `index.html`, vanilla JS/CSS, no build step, no
framework, no backend. Three views (Home, Chapter List, Player) are
swapped via JS. Hash-based routing (`#/book-slug` for chapter list,
`#/book-slug/chapter-slug` for player) so the browser back button and
page refresh both behave correctly on GitHub Pages.

## File Structure

```
meditation-audiobooks/
├── index.html
├── css/style.css
├── js/
│   ├── data.js        (book/chapter metadata)
│   ├── app.js          (routing + view rendering)
│   ├── player.js        (audio playback, controls, auto-advance, intro gating)
│   └── progress.js      (localStorage read/write)
├── covers/
│   ├── demon-copperhead.jpg   (Jason to add; placeholder shown until then)
│   └── james.jpg
└── audio/
    ├── intro.m4a                    (shared intro, plays before a fresh session)
    ├── demon-copperhead/
    │   └── Demon 1.m4a ... Demon 35.m4a
    └── james/
        └── James 1.m4a ... James 16.m4a
```

Source audio files currently live at `/Users/jason.chao/Downloads/Stories`
(52 files, ~134MB total, all well under GitHub's 100MB per-file limit).
They'll be copied into `audio/<book-slug>/` under their existing filenames
(no renaming needed — chapter order is defined explicitly in `data.js`,
not inferred from filesystem sort order).

## Data Model (`js/data.js`)

```js
const BOOKS = [
  {
    slug: "demon-copperhead",
    title: "Demon Copperhead",
    cover: "covers/demon-copperhead.jpg",
    chapters: [
      { slug: "1", title: "Chapter 1", file: "Demon 1.m4a" },
      // ... through Chapter 35
    ],
  },
  {
    slug: "james",
    title: "James",
    cover: "covers/james.jpg",
    chapters: [
      { slug: "1", title: "Chapter 1", file: "James 1.m4a" },
      // ... through Chapter 16
    ],
  },
];
const INTRO_FILE = "audio/intro.m4a";
```

Chapter titles are generic ("Chapter N") placeholders; Jason will supply
real titles later as a simple data.js edit — no structural change needed.

## Screens

- **Home**: "Jason's Sleepytime Stories" headline, then a card per book —
  cover image (gray placeholder box if the image is missing/404s), title,
  and a small "x/y chapters complete" progress readout sourced from
  localStorage.
- **Chapter list**: ordered list of chapters for the selected book, a
  checkmark next to completed ones, tap to play.
- **Player**: book/chapter title, play/pause, previous/next chapter,
  scrub bar with current time/duration, back-to-list button.

## Playback Behavior

- **Auto-advance**: on the `ended` event, mark the current chapter
  complete, then load and autoplay the next chapter in that book. On the
  last chapter of a book, mark it complete and stop (no auto-return to
  the list).
- **Skip controls**: previous/next chapter (not a seconds-based seek).
- **Intro gating**: tapping a chapter directly from a chapter list is a
  "fresh session start" — the shared `audio/intro.m4a` plays first, then
  the selected chapter plays automatically after it. Auto-advancing to
  the next chapter, or using the player's own prev/next buttons, does
  **not** replay the intro — those continue the current session.

## Progress Persistence

`localStorage` key storing completed chapters per book, e.g.:
```json
{ "demon-copperhead": ["1", "2", "3"], "james": ["1"] }
```
Completion only — no resume-to-exact-position tracking. A chapter always
starts from 0:00.

## GitHub Setup

- New **public** repo named `meditation-audiobooks` under the personal
  GitHub account `jasonchao1122`.
- Pushed from `~/personal-projects/meditation-audiobooks`.
- GitHub Pages enabled from the `main` branch root.
- Live URL: `https://jasonchao1122.github.io/meditation-audiobooks/`.

## Out of Scope (for now)

- Cross-device progress sync (would need a backend/auth).
- Resume-to-exact-position within a chapter.
- Real chapter titles (placeholder "Chapter N" until Jason supplies them).
- Additional books beyond the two listed.
