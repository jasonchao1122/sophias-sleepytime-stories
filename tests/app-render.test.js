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

const { renderHome, renderBookScreen } = require('../js/app.js');

const home = renderHome();
assert.ok(home.includes("Sophia's Sleepytime Stories"), 'home shows the headline');
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
assert.ok(screen.includes('id="book-progress-line"'), 'progress line has a stable id for in-place updates');
assert.ok(screen.includes('class="chapter-check" data-chapter-slug="1"'), 'checkmark carries its own slug for independent tap handling');

markChapterComplete('demon-copperhead', '1');
const screenAfter = renderBookScreen('demon-copperhead');
assert.ok(screenAfter.includes('class="chapter-row complete" id="chapter-row-1"'), 'chapter-row-1 gets the complete class once marked done');
assert.ok(screenAfter.includes('✓'), 'a checkmark appears after marking chapter 1 complete');

console.log('app-render.test.js: all assertions passed');
