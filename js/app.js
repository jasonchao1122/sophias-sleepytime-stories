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

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
}
