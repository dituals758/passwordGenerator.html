const CACHE_VERSION = 'v1.3.0';
const CACHE_NAME = `password-generator-${CACHE_VERSION}`;

// Критические ресурсы для кэширования
const CRITICAL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Стратегия кэширования: Network First, Cache Fallback
const CACHE_STRATEGY = 'network-first';

/**
 * Установка Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Установка началась');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Кэширование критических ресурсов');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Установка завершена');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Ошибка установки:', error);
      })
  );
});

/**
 * Активация Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Активация');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Удаляем старые кэши
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Удаление старого кэша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Активация завершена');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[Service Worker] Ошибка активации:', error);
      })
  );
});

/**
 * Обработка запросов
 */
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Пропускаем запросы к внешним ресурсам
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Пропускаем запросы к аналитике
  if (event.request.url.includes('analytics') || 
      event.request.url.includes('chrome-extension')) {
    return;
  }
  
  event.respondWith(
    this.handleFetch(event.request)
      .catch((error) => {
        console.error('[Service Worker] Ошибка обработки запроса:', error);
        return this.handleOffline(event.request);
      })
  );
});

/**
 * Обработка fetch запроса
 */
async function handleFetch(request) {
  try {
    // Пробуем получить из сети
    const networkResponse = await fetch(request);
    
    // Клонируем ответ для кэширования
    const responseToCache = networkResponse.clone();
    
    // Кэшируем успешные ответы
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Если сеть недоступна, пробуем из кэша
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Обработка оффлайн режима
 */
async function handleOffline(request) {
  // Для страниц возвращаем оффлайн страницу
  if (request.mode === 'navigate') {
    const cache = await caches.open(CACHE_NAME);
    const cachedPage = await cache.match('./index.html');
    
    if (cachedPage) {
      return cachedPage;
    }
  }
  
  // Для других ресурсов возвращаем ошибку
  return new Response('Сеть недоступна. Проверьте подключение к интернету.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain; charset=utf-8'
    })
  });
}

/**
 * Push уведомления
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push уведомление получено');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Доступно новое обновление генератора паролей',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './index.html',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: './assets/icons/icon-32.png'
      },
      {
        action: 'dismiss',
        title: 'Закрыть',
        icon: './assets/icons/icon-32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Генератор паролей', options)
  );
});

/**
 * Обработка кликов по уведомлениям
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Уведомление нажато:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Ищем открытое окно приложения
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Если окно не найдено, открываем новое
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url || './index.html');
      }
    })
    .catch((error) => {
      console.error('[Service Worker] Ошибка открытия приложения:', error);
    })
  );
});

/**
 * Фоновая синхронизация
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Синхронизация:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('[Service Worker] Фоновая синхронизация начата');
    
    // Здесь можно реализовать фоновую синхронизацию данных
    // Например, отправку статистики или обновление кэша
    
    console.log('[Service Worker] Фоновая синхронизация завершена');
  } catch (error) {
    console.error('[Service Worker] Ошибка фоновой синхронизации:', error);
  }
}

/**
 * Сообщения от главного потока
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Сообщение получено:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    updateCache();
  }
});

async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CRITICAL_ASSETS);
    console.log('[Service Worker] Кэш обновлен');
  } catch (error) {
    console.error('[Service Worker] Ошибка обновления кэша:', error);
  }
}

/**
 * Периодическая синхронизация
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

/**
 * Обработка ошибок
 */
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Ошибка:', event.error);
});

/**
 * Обработка отказов промисов
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Необработанный отказ промиса:', event.reason);
});