// Service Worker для GitHub Pages
const CACHE_NAME = 'password-generator-v1.3.1';

// Базовые ресурсы
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Установка
self.addEventListener('install', event => {
  console.log('[Service Worker] Установка для GitHub Pages');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Кэширование базовых ресурсов');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация
self.addEventListener('activate', event => {
  console.log('[Service Worker] Активация');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener('fetch', event => {
  // Пропускаем не-GET запросы и внешние ресурсы
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // GitHub Pages friendly strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша если есть
        if (response) {
          return response;
        }
        
        // Делаем сетевой запрос
        return fetch(event.request)
          .then(networkResponse => {
            // Клонируем для кэширования
            const responseToCache = networkResponse.clone();
            
            // Кэшируем только успешные ответы
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            
            return networkResponse;
          })
          .catch(() => {
            // Fallback для страниц
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Fallback для других ресурсов
            return new Response('Оффлайн режим', {
              status: 503,
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          });
      })
  );
});