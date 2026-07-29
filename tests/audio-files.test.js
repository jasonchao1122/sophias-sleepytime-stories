// tests/audio-files.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { BOOKS, INTRO_FILE } = require('../js/data.js');

const projectRoot = path.join(__dirname, '..');

assert.ok(fs.existsSync(path.join(projectRoot, INTRO_FILE)), `missing ${INTRO_FILE}`);

for (const book of BOOKS) {
  for (const chapter of book.chapters) {
    if (chapter.file === null) continue; // "Coming Soon" chapter, no audio yet
    const full = path.join(projectRoot, chapter.file);
    assert.ok(fs.existsSync(full), `missing ${chapter.file}`);
  }
}

console.log('audio-files.test.js: all assertions passed');
