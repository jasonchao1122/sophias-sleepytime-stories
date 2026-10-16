(function () {
  const AUDIO = document.getElementById('audio-player');
  let currentBook = null;
  let currentIndex = null;
  let introPlaying = false;

  // Next-chapter prefetch. When the screen is locked the phone may throttle
  // the network, so the src swap at `ended` can stall. Downloading the next
  // chapter to a blob URL while the current one plays makes that swap local.
  let prefetched = { file: null, url: null };

  function dropPrefetch() {
    if (prefetched.url) URL.revokeObjectURL(prefetched.url);
    prefetched = { file: null, url: null };
  }

  function prefetchNext(index) {
    const next = currentBook.chapters[index + 1];
    if (!next || next.file === null || prefetched.file === next.file) return;
    const file = next.file;
    fetch(file)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
      .then(blob => {
        // Ignore if the user moved on or the book changed while downloading.
        if (!currentBook || currentIndex === null) return;
        const want = currentBook.chapters[currentIndex + 1];
        if (!want || want.file !== file) return;
        dropPrefetch();
        prefetched = { file, url: URL.createObjectURL(blob) };
      })
      .catch(err => console.warn('[Player] prefetch failed, will stream instead:', err));
  }

  function sourceFor(chapter) {
    return prefetched.file === chapter.file && prefetched.url ? prefetched.url : chapter.file;
  }

  function refreshIntroToggle() {
    const btn = document.getElementById('intro-toggle');
    if (!btn) return;
    const on = isIntroEnabled();
    btn.textContent = 'Play intro before chapter: ' + (on ? 'On' : 'Off');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
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

  function logPlayError(context) {
    return (err) => {
      console.error('[Player] play() failed during ' + context + ':', err);
      resetPlayIcon();
    };
  }

  function updateTitle() {
    const titleEl = document.getElementById('player-title');
    if (!titleEl || currentIndex === null) return;
    titleEl.textContent = introPlaying ? 'Intro' : currentBook.chapters[currentIndex].title;
  }

  // Registers this page as a proper OS media session (lock-screen title,
  // artwork, and transport controls). Without this, iOS/mobile browsers
  // often block the JS-triggered play() call that starts the next chapter
  // when the screen is locked, since it lacks a fresh, direct user tap;
  // an active media session with real action handlers is what lets
  // background continuation (and lock-screen next/prev) work reliably.
  function updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator) || currentIndex === null || !currentBook) return;
    const chapterTitle = introPlaying ? 'Intro' : currentBook.chapters[currentIndex].title;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: chapterTitle,
      artist: currentBook.title,
      album: "Sophia's Sleepytime Stories",
    });
  }

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      loadChapter(currentIndex - 1, { autoplay: true });
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      loadChapter(currentIndex + 1, { autoplay: true });
    });
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
      AUDIO.play().catch(logPlayError('manual resume'));
    } else {
      AUDIO.pause();
    }
  }

  function loadChapter(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= currentBook.chapters.length) return;
    if (currentBook.chapters[index].file === null) return; // "Coming Soon" chapter, no audio yet
    currentIndex = index;
    introPlaying = false;
    updateTitle();
    updateMediaSessionMetadata();
    updateActiveRow();
    AUDIO.src = sourceFor(currentBook.chapters[index]);
    AUDIO.onended = handleChapterEnded;
    if (opts.autoplay) {
      AUDIO.play().catch(err => {
        logPlayError('chapter ' + currentBook.chapters[index].slug + ' autoplay')(err);
        // One retry: a locked-screen swap can fail transiently (network/throttling).
        setTimeout(() => {
          if (currentIndex === index && AUDIO.paused && !introPlaying) {
            AUDIO.play().catch(logPlayError('chapter autoplay retry'));
          }
        }, 1500);
      });
    }
    prefetchNext(index);
  }

  function handleChapterEnded() {
    if (currentBook === null || currentIndex === null) return;
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
      loadChapter(currentIndex + 1, { autoplay: true });
    };
    document.getElementById('btn-prev').onclick = () => {
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
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    };
    AUDIO.onpause = () => {
      resetPlayIcon();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    };
  }

  function selectChapter(chapterSlug) {
    currentIndex = currentBook.chapters.findIndex(c => c.slug === chapterSlug);
    if (currentIndex === -1) return;
    document.getElementById('player-bar').classList.remove('hidden');
    introPlaying = isIntroEnabled();
    updateTitle();
    updateMediaSessionMetadata();
    updateActiveRow();
    if (!isIntroEnabled()) {
      loadChapter(currentIndex, { autoplay: true });
      return;
    }
    AUDIO.onended = handleIntroEnded;
    AUDIO.src = INTRO_FILE;
    AUDIO.play().catch(logPlayError('intro playback'));
  }

  function mountBookScreen(bookSlug) {
    currentBook = BOOKS.find(b => b.slug === bookSlug);
    currentIndex = null;
    introPlaying = false;
    dropPrefetch();
    bindBarControls();
    refreshIntroToggle();
    document.getElementById('intro-toggle').onclick = () => {
      setIntroEnabled(!isIntroEnabled());
      refreshIntroToggle();
    };
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
