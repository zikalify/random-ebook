const CACHE_NAME = 'se-discover-v17';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './books.json',
  './offline.html',
  './manifest.json'
];

// Install Event - Pre-cache essential files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll to cache all assets
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle offline requests
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Check if it's a page navigation request
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Serve offline.html if network is unreachable
        return caches.match('./offline.html');
      })
    );
    return;
  }

  // Handle other resources
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network
      return fetch(e.request).then((networkResponse) => {
        // Cache book covers dynamically so they work offline once viewed!
        if (url.hostname === 'standardebooks.org' && url.pathname.includes('/downloads/')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silent catch for images/other assets when offline
        return new Response('', { status: 408, statusText: 'Offline Network Timeout' });
      });
    })
  );
});
