/**
 * Random Book
 * Client-side script to load catalog and manage book presentation
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const bookCard = document.getElementById('book-card');
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

  // Make the cover open the same link as the "Read Book" button
  if (coverLink) {
    coverLink.addEventListener('click', (e) => {
      e.preventDefault();
      const tryOpen = () => {
        const url = readBtn && readBtn.href;
        if (url && url !== '#' && url !== window.location.href) {
          window.open(url, '_blank', 'noopener');
          return true;
        }
        return false;
      };
      if (!tryOpen()) {
        setTimeout(() => { tryOpen(); }, 150);
      }
    });
  }
  
  // App State
  let booksCatalog = [];
  let isTransitioning = false;

  // Auto-fit text to its locked container - shrinks font instead of growing box
  function fitTextToContainer(el, maxSizeRem, minSizeRem) {
    if (!el) return;
    let size = maxSizeRem;
    el.style.fontSize = size + 'rem';
    // Reduce until it fits inside its fixed height (3.6em for title, 2.4em for author)
    let attempts = 0;
    while (el.scrollHeight > el.clientHeight + 1 && size > minSizeRem && attempts < 30) {
      size -= 0.05;
      el.style.fontSize = size + 'rem';
      attempts++;
    }
  }

  // Load books catalog from local JSON
  async function loadCatalog() {
    try {
      showLoading(true);
      const response = await fetch('books.json');
      if (!response.ok) {
        throw new Error(`Failed to load books catalog: ${response.statusText}`);
      }
      booksCatalog = await response.json();
      if (!booksCatalog || booksCatalog.length === 0) {
        throw new Error('Books catalog is empty.');
      }
      displayRandomBook();
    } catch (error) {
      console.error(error);
      displayErrorState(error.message);
    }
  }

  function getRandomBook() {
    const randomIndex = Math.floor(Math.random() * booksCatalog.length);
    return booksCatalog[randomIndex];
  }

  function fadeElements(out = true) {
    const classAction = out ? 'add' : 'remove';
    titleEl.classList[classAction]('fade-out');
    authorEl.classList[classAction]('fade-out');
    translatorInfoEl.classList[classAction]('fade-out');
    if (out) {
      coverMainImg.classList.remove('loaded');
    }
  }

  async function displayRandomBook() {
    if (booksCatalog.length === 0 || isTransitioning) return;
    isTransitioning = true;
    nextBtn.disabled = true;
    fadeElements(true);
    showLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const book = getRandomBook();
    
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

    // Auto-shrink text to fit locked box instead of growing box
    requestAnimationFrame(() => {
      // Desktop: title up to 2.5rem down to 1.3rem, author 1.45rem down to 1.0rem
      // Mobile will be clamped by CSS but JS still helps
      const isMobile = window.innerWidth <= 980;
      if (isMobile) {
        fitTextToContainer(titleEl, 2.0, 1.2);
        fitTextToContainer(authorEl, 1.3, 1.0);
      } else {
        fitTextToContainer(titleEl, 2.5, 1.3);
        fitTextToContainer(authorEl, 1.45, 1.0);
      }
    });
    
    coverBlurImg.src = book.thumbnail_url;
    coverMainImg.classList.remove('loaded');
    
    coverMainImg.onload = () => {
      coverMainImg.classList.add('loaded');
      fadeElements(false);
      showLoading(false);
      isTransitioning = false;
      nextBtn.disabled = false;
    };
    
    coverMainImg.onerror = () => {
      console.warn(`Failed to load high-res cover: ${book.cover_url}. Falling back to thumbnail.`);
      coverMainImg.src = book.thumbnail_url;
      coverMainImg.classList.add('loaded');
      fadeElements(false);
      showLoading(false);
      isTransitioning = false;
      nextBtn.disabled = false;
    };

    coverMainImg.src = book.cover_url;
  }

  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.add('active');
    } else {
      loadingOverlay.classList.remove('active');
    }
  }

  function displayErrorState(message) {
    showLoading(false);
    titleEl.textContent = "Unable to load library";
    authorEl.textContent = "Error Details";
    translatorInfoEl.classList.add('visible');
    translatorNameEl.innerHTML = `<span style="color: #ff6b6b;">${message}</span><br><br>Please check that <strong>books.json</strong> exists and contains valid JSON metadata.`;
    coverBlurImg.src = "";
    coverMainImg.src = "";
    readBtn.style.pointerEvents = "none";
    readBtn.style.opacity = 0.5;
    nextBtn.disabled = true;
  }

  nextBtn.addEventListener('click', displayRandomBook);
  
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      displayRandomBook();
    }
  });

  loadCatalog();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
