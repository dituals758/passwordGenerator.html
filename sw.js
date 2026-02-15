const APP_VERSION = "20260215_hotfix3";
const CACHE_NAME = `password-generator-v${APP_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './script.js',
  './assets/icons/icon-96.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-32.png',
  './assets/icons/icon-16.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192-maskable.png',
  './assets/icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }
  
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
        }
        return networkResponse;
      });
      
      return cachedResponse || fetchPromise;
    })
  );
});