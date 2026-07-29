const INTRO_FILE = "audio/intro.m4a";

function makeChapters(bookSlug, filePrefix, titles, durations) {
  return titles.map((name, idx) => {
    const n = idx + 1;
    const duration = durations[idx];
    const title = name ? `Chapter ${n}: ${name}` : `Chapter ${n}`;
    if (duration == null) {
      return { slug: String(n), title, file: null, durationSeconds: 0 };
    }
    return {
      slug: String(n),
      title,
      file: `audio/${bookSlug}/${filePrefix} ${n}.m4a`,
      durationSeconds: duration,
    };
  });
}

const DEMON_TITLES = [
  "Trailer Park Birth",
  "Meeting Emmy",
  "Stoner Turns Abusive",
  "Mariah's Story",
  "Mom Overdoses",
  "Creaky's Farm",
  "Fast Forward's Squad",
  "Miss Sparks Visit",
  "Mom's Pregnant",
  "Mom Dies",
  "The Macabres",
  "Dump Job",
  "Running Away",
  "Hitchhiking South",
  "Grandma and Dick",
  "Meeting Coach",
  "Angus and Art",
  "June's Dome House",
  "Coach Adopts Him",
  "High School Starts",
  "U-Haul's Threats",
  "Fast Forward Returns",
  "Meeting Dory",
  "Knee Injury Pills",
  "Peggett's Funeral",
  "Ocean Trip Fails",
  "Dory's Dad Dies",
  "Emmy Runs Away",
  "Comic Strip Deal",
  "Finding Emmy",
  "U-Haul Confronted",
  "Dory Overdoses",
  "Devil's Bathtub",
  "Rehab in Knoxville",
  "Angus and Ocean",
];

const DEMON_DURATIONS = [
  477.394667, 422.440000, 263.890667, 507.730667, 536.957333,
  190.589333, 379.176000, 284.925333, 567.378667, 633.853333,
  543.272000, 397.736000, 325.885333, 445.992000, 238.674667,
  594.301333, 393.554667, 500.648000, 615.677333, 394.152000,
  436.221333, 257.533333, 473.042667, 700.328000, 409.810667,
  501.202667, 372.861333, 441.938667, 760.274667, 482.941333,
  319.826667, 576.424000, 569.853333, 370.898667, 687.229333,
];

const JAMES_TITLES = [
  "Meet Jim's Family",
  "Sold, Jim Runs",
  "Huck Fakes Death",
  "Snakebite Fever Dream",
  "Robbers' Boat Heist",
  "Storm Separates Them",
  "Pencil and Whipping",
  "Duke and King",
  "Sold and Beaten",
  "Sold to Singer",
  "Blackface Performance",
  "Hair Almost Caught",
  "Sammy Dies Escaping",
  "Boat Explosion",
  "Freeing the Slaves",
  "Reunited, Escape North",
];

const JAMES_DURATIONS = [
  234.706667, 371.922667, 321.746667, 564.178667, 513.320000,
  224.680000, 513.746667, 536.872000, 545.234667, 152.189333,
  438.098667, 211.240000, 511.528000, 758.952000, 43.133333,
  86.440000,
];

const CUP_TITLES = [
  "Commander Blas Murdered",
  "Investigating the Servants",
  "Leviathan Breaches Wall",
  "Secretary Found Dead",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
  "Coming Soon",
];

const CUP_DURATIONS = [
  793.682667, 602.408000, 457.810667, 786.685333,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
];

const BOOKS = [
  {
    slug: "demon-copperhead",
    title: "Demon Copperhead",
    cover: "covers/demon-copperhead.jpg",
    chapters: makeChapters("demon-copperhead", "Demon", DEMON_TITLES, DEMON_DURATIONS),
  },
  {
    slug: "james",
    title: "James",
    cover: "covers/james.jpg",
    chapters: makeChapters("james", "James", JAMES_TITLES, JAMES_DURATIONS),
  },
  {
    slug: "the-tainted-cup",
    title: "The Tainted Cup",
    cover: "covers/the-tainted-cup.jpg",
    chapters: makeChapters("the-tainted-cup", "Cup", CUP_TITLES, CUP_DURATIONS),
  },
];

if (typeof module !== 'undefined') {
  module.exports = { BOOKS, INTRO_FILE, makeChapters };
}
