(function () {
  const AUDIO = document.getElementById('audio-player');
  const SLEEP_TIMER_MS = 30 * 60 * 1000;
  let currentBook = null;
  let currentIndex = null;
  let introPlaying = false;
  let sleepTimer = null;

  function clearSleepTimer() {
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }
  }

  function resetSleepTimer() {
    clearSleepTimer();
    sleepTimer = setTimeout(() => {
      AUDIO.pause();
    }, SLEEP_TIMER_MS);
  }

  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function resetPlayIcon() {
    const btn = document.getElementById('btn-playpause');
    if (btn) btn.innerHTML = '&#9654;';
  }

  function updateTitle() {
    const titleEl = document.getElementById('player-title');
    if (!titleEl || currentIndex === null) return;
    titleEl.textContent = introPlaying ? 'Intro' : currentBook.chapters[currentIndex].title;
  }

  function updateActiveRow() {
    document.querySelectorAll('.chapter-row.active').forEach(el => el.classList.remove('active'));
    if (currentIndex === null) return;
    const row = document.getElementById('chapter-row-' + currentBook.chapters[currentIndex].slug);
    if (row) row.classList.add('active');
  }

  function setRowComplete(slug, complete) {
    const row = document.getElementById('chapter-row-' + slug);
    if (!row) return;
    row.classList.toggle('complete', complete);
    const check = row.querySelector('.chapter-check');
    if (check) check.textContent = complete ? '✓' : '';
  }

  function updateProgressLine() {
    const line = document.getElementById('book-progress-line');
    if (!line || !currentBook) return;
    const total = currentBook.chapters.length;
    const completed = currentBook.chapters.filter(c => isChapterComplete(currentBook.slug, c.slug)).length;
    const totalTime = formatDuration(totalDurationSeconds(currentBook));
    const completedTime = formatDuration(completedDurationSeconds(currentBook));
    line.textContent = `${completed}/${total} chapters · ${completedTime} of ${totalTime}`;
  }

  function toggleChapterComplete(chapterSlug) {
    const nowComplete = !isChapterComplete(currentBook.slug, chapterSlug);
    if (nowComplete) {
      markChapterComplete(currentBook.slug, chapterSlug);
    } else {
      markChapterIncomplete(currentBook.slug, chapterSlug);
    }
    setRowComplete(chapterSlug, nowComplete);
    updateProgressLine();
  }

  function togglePlayPause() {
    if (AUDIO.paused) {
      resetSleepTimer();
      AUDIO.play().catch(resetPlayIcon);
    } else {
      clearSleepTimer();
      AUDIO.pause();
    }
  }

  function loadChapter(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= currentBook.chapters.length) return;
    currentIndex = index;
    introPlaying = false;
    updateTitle();
    updateActiveRow();
    AUDIO.src = currentBook.chapters[index].file;
    AUDIO.onended = handleChapterEnded;
    if (opts.autoplay) {
      AUDIO.play().catch(resetPlayIcon);
    }
  }

  function handleChapterEnded() {
    const finishedSlug = currentBook.chapters[currentIndex].slug;
    markChapterComplete(currentBook.slug, finishedSlug);
    setRowComplete(finishedSlug, true);
    updateProgressLine();
    if (currentIndex + 1 < currentBook.chapters.length) {
      loadChapter(currentIndex + 1, { autoplay: true });
    }
  }

  function handleIntroEnded() {
    loadChapter(currentIndex, { autoplay: true });
  }

  function bindBarControls() {
    document.getElementById('btn-playpause').onclick = togglePlayPause;
    document.getElementById('btn-next').onclick = () => {
      resetSleepTimer();
      loadChapter(currentIndex + 1, { autoplay: true });
    };
    document.getElementById('btn-prev').onclick = () => {
      resetSleepTimer();
      loadChapter(currentIndex - 1, { autoplay: true });
    };

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
      const timeEl = document.getElementById('time-current');
      if (timeEl) timeEl.textContent = formatTime(AUDIO.currentTime);
    };
    AUDIO.onloadedmetadata = () => {
      const durEl = document.getElementById('time-duration');
      if (durEl) durEl.textContent = formatTime(AUDIO.duration);
    };
    AUDIO.onplay = () => {
      const btn = document.getElementById('btn-playpause');
      if (btn) btn.innerHTML = '&#9208;';
    };
    AUDIO.onpause = resetPlayIcon;
  }

  function selectChapter(chapterSlug) {
    currentIndex = currentBook.chapters.findIndex(c => c.slug === chapterSlug);
    if (currentIndex === -1) return;
    document.getElementById('player-bar').classList.remove('hidden');
    introPlaying = true;
    updateTitle();
    updateActiveRow();
    resetSleepTimer();
    AUDIO.onended = handleIntroEnded;
    AUDIO.src = INTRO_FILE;
    AUDIO.play().catch(resetPlayIcon);
  }

  function mountBookScreen(bookSlug) {
    currentBook = BOOKS.find(b => b.slug === bookSlug);
    currentIndex = null;
    introPlaying = false;
    clearSleepTimer();
    bindBarControls();
    document.querySelectorAll('.chapter-row[data-chapter-slug]').forEach(row => {
      row.onclick = (e) => {
        e.preventDefault();
        selectChapter(row.dataset.chapterSlug);
      };
    });
    document.querySelectorAll('.chapter-check[data-chapter-slug]').forEach(check => {
      check.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleChapterComplete(check.dataset.chapterSlug);
      };
    });
  }

  window.Player = { mountBookScreen };
})();
