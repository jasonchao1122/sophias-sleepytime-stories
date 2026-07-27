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
  markChapterIncomplete,
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

markChapterIncomplete('demon-copperhead', '1');
assert.strictEqual(isChapterComplete('demon-copperhead', '1'), false, 'chapter 1 un-marked');
assert.strictEqual(getCompletedCount('demon-copperhead'), 0, 'demon-copperhead back to zero');
assert.strictEqual(getCompletedCount('james'), 1, 'james unaffected by demon-copperhead un-mark');

markChapterIncomplete('demon-copperhead', '1'); // un-marking twice must not throw or go negative
assert.strictEqual(getCompletedCount('demon-copperhead'), 0, 'still zero after redundant un-mark');

console.log('progress.test.js: all assertions passed');
