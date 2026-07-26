(function () {
  const AUDIO = document.getElementById('audio-player');
  let currentBook = null;
  let currentIndex = 0;

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateTitles() {
    document.getElementById('player-book-title').textContent = currentBook.title;
    document.getElementById('player-chapter-title').textContent = currentBook.chapters[currentIndex].title;
  }

  function togglePlayPause() {
    if (AUDIO.paused) {
      AUDIO.play();
    } else {
      AUDIO.pause();
    }
  }

  function loadChapter(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= currentBook.chapters.length) return;
    currentIndex = index;
    updateTitles();
    AUDIO.src = currentBook.chapters[index].file;
    AUDIO.onended = handleChapterEnded;
    if (opts.autoplay) {
      AUDIO.play();
    }
  }

  function handleChapterEnded() {
    markChapterComplete(currentBook.slug, currentBook.chapters[currentIndex].slug);
    if (currentIndex + 1 < currentBook.chapters.length) {
      loadChapter(currentIndex + 1, { autoplay: true });
    }
  }

  function handleIntroEnded() {
    loadChapter(currentIndex, { autoplay: true });
  }

  function bindControls() {
    document.getElementById('btn-playpause').onclick = togglePlayPause;
    document.getElementById('btn-next').onclick = () => loadChapter(currentIndex + 1, { autoplay: true });
    document.getElementById('btn-prev').onclick = () => loadChapter(currentIndex - 1, { autoplay: true });

    const scrub = document.getElementById('scrub');
    scrub.oninput = () => {
      if (AUDIO.duration) {
        AUDIO.currentTime = (scrub.value / 100) * AUDIO.duration;
      }
    };

    AUDIO.ontimeupdate = () => {
      if (AUDIO.duration) {
        scrub.value = (AUDIO.currentTime / AUDIO.duration) * 100;
      }
      document.getElementById('time-current').textContent = formatTime(AUDIO.currentTime);
    };
    AUDIO.onloadedmetadata = () => {
      document.getElementById('time-duration').textContent = formatTime(AUDIO.duration);
    };
    AUDIO.onplay = () => {
      document.getElementById('btn-playpause').innerHTML = '&#9208;';
    };
    AUDIO.onpause = () => {
      document.getElementById('btn-playpause').innerHTML = '&#9654;';
    };
  }

  function startSession(bookSlug, chapterSlug) {
    currentBook = BOOKS.find(b => b.slug === bookSlug);
    currentIndex = currentBook.chapters.findIndex(c => c.slug === chapterSlug);
    bindControls();
    updateTitles();
    AUDIO.onended = handleIntroEnded;
    AUDIO.src = INTRO_FILE;
    AUDIO.play();
  }

  window.Player = { startSession };
})();
