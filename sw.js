const CACHE_NAME = 'password-generator-v1.3.0';
const urlsToCache = [
  './',
  './index.html',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json',
  './styles.css',
  './app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          if (event.request.url.includes('passwordGenerator.html') || 
              event.request.url.includes('manifest.json') ||
              event.request.url.includes('styles.css') ||
              event.request.url.includes('app.js')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Новое обновление генератора паролей!',
    icon: './icon-192x192.png',
    badge: './icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: './icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Генератор паролей', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});