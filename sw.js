// Bump the cache version when changing assets so clients fetch updated files
const cacheName = 'vigie-sst-cache-v2';
const assetsToCache = [
  '.',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'colas.png'
];

self.addEventListener('install', event => {
  // Activate this service worker immediately (don't wait)
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('activate', event => {
  // Take control of clients as soon as this worker activates
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(cacheName).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});

// Listen for messages from the page (e.g., ask worker to skip waiting)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
