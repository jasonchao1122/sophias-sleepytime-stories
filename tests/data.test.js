const assert = require('assert');
const { BOOKS, INTRO_FILE } = require('../js/data.js');

assert.strictEqual(INTRO_FILE, 'audio/intro.m4a', 'INTRO_FILE path');
assert.strictEqual(BOOKS.length, 3, 'exactly three books');

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

const cup = BOOKS.find(b => b.slug === 'the-tainted-cup');
assert.ok(cup, 'the-tainted-cup book exists');
assert.strictEqual(cup.title, 'The Tainted Cup');
assert.strictEqual(cup.cover, 'covers/the-tainted-cup.jpg');
assert.strictEqual(cup.chapters.length, 20, 'The Tainted Cup has 20 chapter slots');
assert.deepStrictEqual(cup.chapters[0], {
  slug: '1',
  title: 'Chapter 1: Commander Blast Murdered',
  file: 'audio/the-tainted-cup/Cup 1.m4a',
  durationSeconds: 793.682667,
});
assert.deepStrictEqual(cup.chapters[3], {
  slug: '4',
  title: 'Chapter 4: Secretary Found Dead',
  file: 'audio/the-tainted-cup/Cup 4.m4a',
  durationSeconds: 786.685333,
});
assert.deepStrictEqual(cup.chapters[4], {
  slug: '5',
  title: 'Chapter 5: Coming Soon',
  file: null,
  durationSeconds: 0,
});
assert.deepStrictEqual(cup.chapters[19], {
  slug: '20',
  title: 'Chapter 20: Coming Soon',
  file: null,
  durationSeconds: 0,
});

console.log('data.test.js: all assertions passed');
