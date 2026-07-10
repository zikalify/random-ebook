/**
 * Random Standard Ebooks Cover Generator
 * Client-side script to load catalog and manage book presentation
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const bookCard = document.getElementById('book-card');
  const coverWrapper = document.getElementById('cover-wrapper');
  const coverBlurImg = document.getElementById('cover-blur');
  const coverMainImg = document.getElementById('cover-img');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  const titleEl = document.getElementById('book-title');
  const authorEl = document.getElementById('book-author');
  const translatorInfoEl = document.getElementById('translator-info');
  const translatorNameEl = document.getElementById('book-translator');
  
  const readBtn = document.getElementById('read-btn');
  const nextBtn = document.getElementById('next-btn');

  // App State
  let booksCatalog = [];
  let isTransitioning = false;

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
      
      // Load initial random book
      displayRandomBook();
    } catch (error) {
      console.error(error);
      displayErrorState(error.message);
    }
  }

  // Get a random book from the catalog
  function getRandomBook() {
    const randomIndex = Math.floor(Math.random() * booksCatalog.length);
    return booksCatalog[randomIndex];
  }

  // Fade out elements before updating
  function fadeElements(out = true) {
    const classAction = out ? 'add' : 'remove';
    titleEl.classList[classAction]('fade-out');
    authorEl.classList[classAction]('fade-out');
    translatorInfoEl.classList[classAction]('fade-out');
    if (out) {
      coverMainImg.classList.remove('loaded'); // will fade main cover out
    }
  }

  // Display a random book with beautiful transitions
  async function displayRandomBook() {
    if (booksCatalog.length === 0 || isTransitioning) return;
    isTransitioning = true;
    
    // Disable next button temporarily during transition
    nextBtn.disabled = true;
    
    // 1. Fade out current metadata & main cover
    fadeElements(true);
    showLoading(true);
    
    // Wait for the fade-out CSS transition (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const book = getRandomBook();
    
    // 2. Update text content & URLs
    titleEl.textContent = book.title;
    authorEl.textContent = book.author;
    readBtn.href = book.url;
    
    if (book.translators) {
      translatorNameEl.textContent = book.translators;
      translatorInfoEl.style.display = 'block';
    } else {
      translatorInfoEl.style.display = 'none';
    }
    
    // 3. Setup images (low-res thumbnail loads fast, high-res in background)
    coverBlurImg.src = book.thumbnail_url;
    coverMainImg.classList.remove('loaded');
    
    // Set onload and onerror handlers before setting src to ensure cached loads are captured
    coverMainImg.onload = () => {
      coverMainImg.classList.add('loaded');
      
      // Fade back in metadata
      fadeElements(false);
      showLoading(false);
      
      isTransitioning = false;
      nextBtn.disabled = false;
    };
    
    coverMainImg.onerror = () => {
      console.warn(`Failed to load high-res cover: ${book.cover_url}. Falling back to thumbnail.`);
      // Fallback: set main cover to thumbnail url
      coverMainImg.src = book.thumbnail_url;
      coverMainImg.classList.add('loaded');
      
      fadeElements(false);
      showLoading(false);
      
      isTransitioning = false;
      nextBtn.disabled = false;
    };

    // Set src to trigger loading
    coverMainImg.src = book.cover_url;
  }

  // Show/Hide Loading Spinner
  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.add('active');
    } else {
      loadingOverlay.classList.remove('active');
    }
  }

  // Display clean error card if fetch fails
  function displayErrorState(message) {
    showLoading(false);
    titleEl.textContent = "Unable to load library";
    authorEl.textContent = "Error Details";
    translatorInfoEl.style.display = 'block';
    translatorNameEl.innerHTML = `<span style="color: #ff6b6b;">${message}</span><br><br>Please check that <strong>books.json</strong> exists and contains valid JSON metadata.`;
    coverBlurImg.src = "";
    coverMainImg.src = "";
    readBtn.style.pointerEvents = "none";
    readBtn.style.opacity = 0.5;
    nextBtn.disabled = true;
  }

  // Event Listeners
  nextBtn.addEventListener('click', displayRandomBook);

  // Keyboard navigation (spacebar to get next book)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault(); // Stop page scrolling
      displayRandomBook();
    }
  });

  // Init App
  loadCatalog();
});

// Register Service Worker for PWA (offline capability & installability)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

