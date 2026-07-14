const CACHE_NAME = 'se-discover-v24'; // bumped!
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './books.json',
  './offline.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./offline.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        // cache covers dynamically
        if (e.request.url.includes('standardebooks.org')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // for images, fail silently
        if (e.request.destination === 'image') return new Response('', { status: 200 });
      });
    })
  );
});
