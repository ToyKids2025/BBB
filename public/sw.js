/**
 * Service Worker PWA - BuscaBuscaBrasil
 * Cache assets, offline support, background sync
 */

const CACHE_VERSION = 'bbb-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DATA_CACHE_NAME = `${CACHE_VERSION}-data`;

// Assets para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// Instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
    // Não fazer skipWaiting() automaticamente - aguardar confirmação do usuário
  );
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-HTTP
  if (!url.protocol.startsWith('http')) return;

  // API do Firebase - Network First
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore')) {
    event.respondWith(networkFirstStrategy(request, DATA_CACHE_NAME));
    return;
  }

  // Assets estáticos - Cache First
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Páginas HTML - Network First
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

// Estratégia: Network First
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Salvar no cache se for sucesso
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback para cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }

    // Se não tiver cache, retornar página offline
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }

    throw error;
  }
}

// Estratégia: Cache First
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Atualizar cache em background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {});

    return cachedResponse;
  }

  // Se não estiver no cache, buscar da rede
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Background Sync - Para salvar links offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-links') {
    event.waitUntil(syncLinks());
  }
});

async function syncLinks() {
  try {
    // Buscar dados pendentes do IndexedDB
    const pendingData = await getPendingData();

    if (pendingData.length === 0) return;

    // Enviar para Firebase
    for (const data of pendingData) {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Limpar dados pendentes
    await clearPendingData();

    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}

// Helpers para IndexedDB
function getPendingData() {
  return new Promise((resolve) => {
    // Implementar leitura do IndexedDB
    resolve([]);
  });
}

function clearPendingData() {
  return new Promise((resolve) => {
    // Implementar limpeza do IndexedDB
    resolve();
  });
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Você tem uma nova notificação!',
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
        title: 'Ver agora'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BuscaBuscaBrasil', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler para comunicação com app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');