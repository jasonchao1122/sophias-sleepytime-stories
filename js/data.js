const INTRO_FILE = "audio/intro.m4a";

function makeChapters(bookSlug, filePrefix, count) {
  const chapters = [];
  for (let i = 1; i <= count; i++) {
    chapters.push({
      slug: String(i),
      title: `Chapter ${i}`,
      file: `audio/${bookSlug}/${filePrefix} ${i}.m4a`,
    });
  }
  return chapters;
}

const BOOKS = [
  {
    slug: "demon-copperhead",
    title: "Demon Copperhead",
    cover: "covers/demon-copperhead.jpg",
    chapters: makeChapters("demon-copperhead", "Demon", 35),
  },
  {
    slug: "james",
    title: "James",
    cover: "covers/james.jpg",
    chapters: makeChapters("james", "James", 16),
  },
];

if (typeof module !== 'undefined') {
  module.exports = { BOOKS, INTRO_FILE, makeChapters };
}
