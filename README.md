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
