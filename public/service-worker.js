// BBB Link Enhancer Premium - Service Worker
const CACHE_NAME = 'bbb-links-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
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

// Fetch Event - Network First Strategy for API, Cache First for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external API requests to avoid CORS issues
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request) || new Response('{}', {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Static assets - Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Background Sync for offline link creation
self.addEventListener('sync', event => {
  if (event.tag === 'sync-links') {
    event.waitUntil(syncLinks());
  }
});

async function syncLinks() {
  try {
    const cache = await caches.open('pending-links');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.log('Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Push Notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação BBB Links',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Dashboard',
        icon: '/icon-96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BBB Links Premium', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?view=dashboard')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic Background Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-stats') {
    event.waitUntil(updateStats());
  }
});

async function updateStats() {
  try {
    const response = await fetch('/api/stats/sync');
    const data = await response.json();

    // Update cached stats
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/stats', new Response(JSON.stringify(data)));

    // Show notification if significant changes
    if (data.newConversions > 0) {
      self.registration.showNotification('BBB Links Premium', {
        body: `${data.newConversions} novas conversões detectadas!`,
        icon: '/icon-192.png',
        badge: '/icon-96.png'
      });
    }
  } catch (error) {
    console.error('Stats update failed:', error);
  }
}