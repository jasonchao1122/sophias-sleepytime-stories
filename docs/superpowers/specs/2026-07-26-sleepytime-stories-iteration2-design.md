# Jason's Sleepytime Stories — Iteration 2 Design

Date: 2026-07-26

This supersedes the relevant parts of the original design spec
(`2026-07-26-sleepytime-stories-design.md`) — specifically the visual
palette, the Chapter List / Player screens, and the chapter-title
placeholders. Everything else in the original spec (architecture, no
build step, GitHub Pages hosting, localStorage completion-only tracking,
copyright approach for the audio content) still holds.

Live site (repo and URL both renamed this iteration):
`https://jasonchao1122.github.io/jasons-sleepytime-stories/`

## 1. Bug fix: intro shows the wrong chapter label

Today, tapping "Chapter 1" shows the title "Chapter 1" even while the
shared intro is playing — the label doesn't change until the actual
chapter starts, which reads as a bug (intro audio, chapter-1 label).

Fix: track whether the currently-loaded audio is the intro or a real
chapter, and display "Intro" as the title while the intro plays, switching
to the real chapter title once it starts.

## 2. Screen consolidation: 3 screens → 2

- **Home** stays its own screen.
- **Chapter List** and **Player** merge into one **Book screen**:
  - A hero cover image at the top.
  - The book title and total-runtime line beneath it (see §4).
  - The full chapter list below that — tap any chapter to start it there.
  - A **sticky bottom player bar** — cover thumbnail, play/pause,
    previous/next chapter, scrub bar — appears once a chapter has been
    picked and stays pinned while the list scrolls. Before any chapter is
    picked, the bar is simply absent (no autoplay, nothing pre-selected).
- Tapping a chapter still triggers the "fresh session start" intro-gating
  rule unchanged: intro plays first, then the tapped chapter. Auto-advance
  and the sticky bar's own prev/next buttons still never replay the intro.
- Routing simplifies to `#/` (Home) and `#/<book-slug>` (Book) — the
  chapter is no longer part of the URL; it's in-page player state only.
- The currently-playing chapter's row gets a visual highlight, and
  checkmarks update immediately on completion — via direct, targeted DOM
  updates on the affected row only (not a full-screen re-render), so the
  scrub bar and in-progress playback are never interrupted by a chapter
  finishing or being selected elsewhere on the same screen.

## 3. Visual redesign: dark warm palette + real cover art

- **Palette flips from light cream to a warm dark theme** — deep
  charcoal-brown background, warm amber/gold accent, cream text, card
  surfaces a shade lighter than the background. Fits a bedtime-listening
  app better than the original light palette. Exact values:
  - `--color-bg: #1C1512` (near-black warm charcoal-brown)
  - `--color-surface: #2A211C` (card/row surfaces, one step lighter than bg)
  - `--color-surface-raised: #33281F` (sticky player bar, hero overlay)
  - `--color-text: #F2E9DD` (warm off-white)
  - `--color-muted: #B8A99A` (secondary text — progress lines, timestamps)
  - `--color-accent: #D9A15B` (warm amber/gold — buttons, active-row highlight, links)
  - `--color-accent-dark: #B8823F` (hover/pressed states, headline color)
- **Real cover art** (provided by Jason, copied into the repo) replaces
  the placeholder color boxes:
  - Large, hero-sized on the Home cards.
  - Large hero image at the top of the Book screen.
  - Small square thumbnail in the sticky player bar.
- **Headline treatment**: "Jason's Sleepytime Stories" gets more visual
  weight — larger serif size, more letter-spacing, a subtle accent
  underline/divider — polish via typography, no new copy.

## 4. Time-based progress, alongside chapter-count progress

In addition to the existing "x/y chapters complete" readout, show total
runtime and time-based progress:

- **Total runtime**: sum of a book's chapter durations, e.g. "35
  chapters · 14h 32m total" — shown on the Home card and atop the Book
  screen.
- **Time-completed**: sum of the durations of chapters marked complete,
  shown alongside the chapter count, e.g. "5/35 chapters · 2h 10m of 14h
  32m".

Chapter durations are measured once (via `afinfo`, exact seconds per
file) and stored as a static `durationSeconds` field per chapter in
`js/data.js` — not measured client-side on page load, which would require
fetching metadata from all 51 audio files before rendering the Home
screen.

Exact durations (seconds), Demon Copperhead chapters 1–35 in order:
477.394667, 422.440000, 263.890667, 507.730667, 536.957333, 190.589333,
379.176000, 284.925333, 567.378667, 633.853333, 543.272000, 397.736000,
325.885333, 445.992000, 238.674667, 594.301333, 393.554667, 500.648000,
615.677333, 394.152000, 436.221333, 257.533333, 473.042667, 700.328000,
409.810667, 501.202667, 372.861333, 441.938667, 760.274667, 482.941333,
319.826667, 576.424000, 569.853333, 370.898667, 687.229333

Exact durations (seconds), James chapters 1–16 in order:
234.706667, 371.922667, 321.746667, 564.178667, 513.320000, 224.680000,
513.746667, 536.872000, 545.234667, 152.189333, 438.098667, 211.240000,
511.528000, 758.952000, 43.133333, 86.440000

## 5. Real chapter titles

Replace the generic "Chapter N" placeholders with "Chapter N: Name",
keeping the chapter number and adding Jason's provided title. Full
ordered lists:

**Demon Copperhead** (35): Trailer Park Birth; Meeting Emmy; Stoner Turns
Abusive; Mariah's Story; Mom Overdoses; Creaky's Farm; Fast Forward's
Squad; Miss Sparks Visit; Mom's Pregnant; Mom Dies; The Macabres; Dump
Job; Running Away; Hitchhiking South; Grandma and Dick; Meeting Coach;
Angus and Art; June's Dome House; Coach Adopts Him; High School Starts;
U-Haul's Threats; Fast Forward Returns; Meeting Dory; Knee Injury Pills;
Peggett's Funeral; Ocean Trip Fails; Dory's Dad Dies; Emmy Runs Away;
Comic Strip Deal; Finding Emmy; U-Haul Confronted; Dory Overdoses;
Devil's Bathtub; Rehab in Knoxville; Angus and Ocean.

**James** (16): Meet Jim's Family; Sold, Jim Runs; Huck Fakes Death;
Snakebite Fever Dream; Robbers' Boat Heist; Storm Separates Them; Pencil
and Whipping; Duke and King; Sold and Beaten; Sold to Singer; Blackface
Performance; Hair Almost Caught; Sammy Dies Escaping; Boat Explosion;
Freeing the Slaves; Reunited, Escape North.

## 6. Real cover images

Two files provided by Jason (already saved locally at
`/Users/jason.chao/Downloads/james.jpg` and
`/Users/jason.chao/Downloads/demon.jpg`) get copied into the repo as
`covers/james.jpg` and `covers/demon-copperhead.jpg` — matching the paths
`js/data.js` already references. No code change needed for this part
beyond having the files present; the existing `onerror` fallback simply
stops triggering once they exist.

## 7. Repo / URL rename (already done, precedes the rest of this iteration)

- GitHub repo renamed from `meditation-audiobooks` to
  `jasons-sleepytime-stories` under `jasonchao1122` (`gh repo rename`,
  which updates the `origin` remote automatically).
- Local project folder renamed to match:
  `~/personal-projects/jasons-sleepytime-stories`.
- Live URL is now `https://jasonchao1122.github.io/jasons-sleepytime-stories/`.
  The old `meditation-audiobooks` Pages URL now 404s (GitHub's rename
  redirect covers the github.com repo page and git remotes, not Pages
  URLs) — not a concern since the old URL was never shared anywhere.

## Out of scope (unchanged from original spec)

Cross-device progress sync, resume-to-exact-position within a chapter,
additional books.
