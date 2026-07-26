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
assert.ok(home.includes('0/35 chapters'), 'home shows 0/35 before any progress');
assert.ok(home.includes('4h 28m'), 'home shows Demon Copperhead total runtime');
assert.ok(home.includes('1h 40m'), 'home shows James total runtime');

markChapterComplete('demon-copperhead', '1');
markChapterComplete('demon-copperhead', '2');
const homeAfter = renderHome();
assert.ok(homeAfter.includes('2/35 chapters'), 'home reflects completed chapter count');
assert.ok(homeAfter.includes('15m'), 'home reflects completed-time progress');

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
