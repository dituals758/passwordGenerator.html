const CACHE_NAME = 'password-generator-v1.2';
const urlsToCache = [
  './',
  './index.html',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Игнорируем запросы к chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша если есть
        if (response) {
          return response;
        }
        
        // Делаем сетевой запрос
        return fetch(event.request).then(response => {
          // Проверяем валидный ли ответ
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем ответ
          const responseToCache = response.clone();
          
          // Кэшируем только HTML и основные ресурсы
          if (event.request.url.includes('passwordGenerator.html') || 
              event.request.url.includes('manifest.json')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        }).catch(() => {
          // Оффлайн фолбэк для HTML
          if (event.request.mode === 'navigate') {
            return caches.match('./passwordGenerator.html');
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
    }).then(() => {
      // Включаем Service Worker сразу
      return self.clients.claim();
    })
  );
});

// Обработка push-уведомлений
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
        if (client.url.includes('passwordGenerator.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./passwordGenerator.html');
      }
    })
  );
});