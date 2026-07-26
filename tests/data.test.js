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
