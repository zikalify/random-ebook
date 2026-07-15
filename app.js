/**
 * Random Book - FINAL - card can NEVER move for any title length
 * No JS resizing, CSS does all clamping
 */
document.addEventListener('DOMContentLoaded', () => {
  const coverBlurImg = document.getElementById('cover-blur');
  const coverMainImg = document.getElementById('cover-img');
  const loadingOverlay = document.getElementById('loading-overlay');
  const titleEl = document.getElementById('book-title');
  const authorEl = document.getElementById('book-author');
  const translatorInfoEl = document.getElementById('translator-info');
  const translatorNameEl = document.getElementById('book-translator');
  const readBtn = document.getElementById('read-btn');
  const coverLink = document.getElementById('cover-link');
  const nextBtn = document.getElementById('next-btn');

  if (coverLink) {
    coverLink.addEventListener('click', (e) => {
      e.preventDefault();
      const url = readBtn && readBtn.href;
      if (url && url !== '#' && url !== window.location.href) window.open(url, '_blank', 'noopener');
    });
  }

  let booksCatalog = [];
  let isTransitioning = false;

  async function loadCatalog() {
    try {
      const r = await fetch('books.json');
      if (!r.ok) throw new Error(r.statusText);
      booksCatalog = await r.json();
      if (!booksCatalog.length) throw new Error('empty catalog');
      displayRandomBook();
    } catch (err) {
      titleEl.textContent = "Unable to load library";
      authorEl.textContent = "Error";
      translatorNameEl.textContent = err.message;
      translatorInfoEl.classList.add('visible');
      loadingOverlay.classList.remove('active');
    }
  }

  function getRandomBook() {
    return booksCatalog[Math.floor(Math.random() * booksCatalog.length)];
  }

  function fade(out) {
    const m = out ? 'add' : 'remove';
    titleEl.classList[m]('fade-out');
    authorEl.classList[m]('fade-out');
    if (out) coverMainImg.classList.remove('loaded');
  }

  async function displayRandomBook() {
    if (!booksCatalog.length || isTransitioning) return;
    isTransitioning = true;
    nextBtn.disabled = true;
    fade(true);
    loadingOverlay.classList.add('active');
    await new Promise(r => setTimeout(r, 160));

    const book = getRandomBook();
    // Set text - CSS will clamp to 3 lines / 2 lines, no JS measuring
    titleEl.textContent = book.title;
    authorEl.textContent = book.author;
    readBtn.href = book.url;

    if (book.translators) {
      translatorNameEl.textContent = book.translators;
      translatorInfoEl.classList.add('visible');
    } else {
      translatorNameEl.textContent = '';
      translatorInfoEl.classList.remove('visible');
    }

    coverBlurImg.src = book.thumbnail_url;
    coverMainImg.classList.remove('loaded');

    const done = () => {
      coverMainImg.classList.add('loaded');
      fade(false);
      loadingOverlay.classList.remove('active');
      isTransitioning = false;
      nextBtn.disabled = false;
    };

    coverMainImg.onload = done;
    coverMainImg.onerror = () => {
      coverMainImg.src = book.thumbnail_url;
      done();
    };
    coverMainImg.src = book.cover_url;
  }

  nextBtn.addEventListener('click', displayRandomBook);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); displayRandomBook(); }
  });

  loadCatalog();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
