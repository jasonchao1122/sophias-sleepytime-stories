# Sophia's Sleepytime Stories

A personal audiobook-style site. Plain HTML/CSS/JS, no build step, hosted
free on GitHub Pages.

**Picking this project back up, or a fresh Claude Code session?** Read
[`CONTEXT.md`](CONTEXT.md) first — it has the full architecture, feature
list, deploy gotchas, and open items in one place.

## Run locally

    python3 -m http.server 8787

Then open http://localhost:8787/

## Run tests

    node tests/data.test.js && node tests/progress.test.js && \
      node tests/app-render.test.js && node tests/audio-files.test.js

## Add a new book

1. Add an entry to the `BOOKS` array in `js/data.js` (slug, title, cover
   path, and a `makeChapters(bookSlug, filePrefix, titles, durations)`
   call — see `CONTEXT.md` for the "Coming Soon" chapter pattern if you
   don't have all the audio yet).
2. Drop a cover image at `covers/<slug>.jpg`.
3. Drop the audio files at `audio/<slug>/` using the exact filenames
   referenced by `makeChapters`.
4. Commit and push — GitHub Pages redeploys automatically.

## Deploy an update

    git add -A
    git commit -m "describe the change"
    git push

**Don't forget**: bump the `?v=N` query param on the `<script>`/`<link>`
tags in `index.html` whenever you change `js/` or `css/style.css` —
otherwise visitors may see a stale cached copy. See `CONTEXT.md`.
