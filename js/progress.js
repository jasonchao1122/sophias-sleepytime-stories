const PROGRESS_KEY = "sleepytime-progress";

function loadProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function isChapterComplete(bookSlug, chapterSlug) {
  const progress = loadProgress();
  const completed = progress[bookSlug] || [];
  return completed.includes(chapterSlug);
}

function markChapterComplete(bookSlug, chapterSlug) {
  const progress = loadProgress();
  const completed = progress[bookSlug] || [];
  if (!completed.includes(chapterSlug)) {
    completed.push(chapterSlug);
  }
  progress[bookSlug] = completed;
  saveProgress(progress);
}

function markChapterIncomplete(bookSlug, chapterSlug) {
  const progress = loadProgress();
  const completed = progress[bookSlug] || [];
  const idx = completed.indexOf(chapterSlug);
  if (idx !== -1) {
    completed.splice(idx, 1);
  }
  progress[bookSlug] = completed;
  saveProgress(progress);
}

function getCompletedCount(bookSlug) {
  const progress = loadProgress();
  return (progress[bookSlug] || []).length;
}

if (typeof module !== 'undefined') {
  module.exports = {
    loadProgress,
    saveProgress,
    isChapterComplete,
    markChapterComplete,
    markChapterIncomplete,
    getCompletedCount,
  };
}
