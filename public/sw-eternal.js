/**
 * 🔥 ETERNAL SERVICE WORKER - PERSISTÊNCIA INFINITA
 * Service Worker que NUNCA perde dados de tracking
 * Sincronização perpétua mesmo offline
 */

const CACHE_NAME = 'bbb-eternal-v1';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
const API_BASE = 'https://buscabuscabrasil.com.br';

// Dados salvos no SW (persistem mesmo sem cookies/localStorage)
let clickData = null;
let events = [];
let lastSync = Date.now();

/**
 * INSTALL - Configuração inicial
 */
self.addEventListener('install', (event) => {
  console.log('🚀 Eternal Service Worker instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/tracker.js',
        '/pixel.gif'
      ]).catch(err => console.log('Cache inicial:', err));
    })
  );

  // Ativar imediatamente
  self.skipWaiting();
});

/**
 * ACTIVATE - Limpar caches antigos e configurar
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Eternal Service Worker ativado');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('bbb-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Controlar todas as páginas imediatamente
  self.clients.claim();

  // Iniciar sync periódico
  startPeriodicSync();
});

/**
 * FETCH - Interceptar todas as requisições
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Tracking de requisições
  if (url.pathname.includes('amazon.com') ||
      url.pathname.includes('mercadolivre.com') ||
      url.pathname.includes('magazineluiza.com')) {
    trackAffiliateClick(url);
  }

  // Interceptar requisições de tracking
  if (url.pathname === '/track' || url.pathname.includes('/pixel')) {
    event.respondWith(handleTrackingRequest(event.request));
    return;
  }

  // Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Não cachear respostas não-ok
        if (!response || response.status !== 200) {
          return response;
        }

        // Clonar resposta para cache
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Retornar página offline se falhar
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }

        // Retornar pixel transparente para imagens
        if (event.request.destination === 'image') {
          return new Response(
            '\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00\x21\xF9\x04\x01\x00\x00\x00\x00\x2C\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3B',
            { headers: { 'Content-Type': 'image/gif' } }
          );
        }
      });
    })
  );
});

/**
 * MESSAGE - Receber dados das páginas
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SYNC_DATA':
      clickData = data;
      saveToCache(data);
      syncWithServer();
      break;

    case 'TRACK_EVENT':
      events.push(data);
      if (events.length > 100) {
        events = events.slice(-100); // Manter últimos 100 eventos
      }
      saveEventsToCache();
      break;

    case 'GET_DATA':
      event.ports[0].postMessage({
        clickData: clickData,
        events: events
      });
      break;

    case 'FORCE_SYNC':
      syncWithServer();
      break;
  }
});

/**
 * SYNC - Background Sync API
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync triggered:', event.tag);

  if (event.tag === 'sync-tracking') {
    event.waitUntil(syncWithServer());
  }
});

/**
 * PERIODIC SYNC - Chrome 80+
 */
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic Sync triggered:', event.tag);

  if (event.tag === 'sync-tracking-periodic') {
    event.waitUntil(syncWithServer());
  }
});

/**
 * PUSH - Notificações Push
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    title: data.title || '🔥 Oferta Especial!',
    body: data.body || 'Confira as melhores ofertas do dia!',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      clickId: clickData?.clickId,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Ver Oferta'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

/**
 * NOTIFICATION CLICK - Ação ao clicar na notificação
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Procurar janela existente
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        // Abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

/**
 * FUNÇÕES AUXILIARES
 */

// Salvar dados no cache
async function saveToCache(data) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(data));
    await cache.put('/click-data', response);
  } catch (error) {
    console.error('Erro ao salvar no cache:', error);
  }
}

// Salvar eventos no cache
async function saveEventsToCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(events));
    await cache.put('/events', response);
  } catch (error) {
    console.error('Erro ao salvar eventos:', error);
  }
}

// Recuperar dados do cache
async function loadFromCache() {
  try {
    const cache = await caches.open(CACHE_NAME);

    const clickResponse = await cache.match('/click-data');
    if (clickResponse) {
      clickData = await clickResponse.json();
    }

    const eventsResponse = await cache.match('/events');
    if (eventsResponse) {
      events = await eventsResponse.json();
    }
  } catch (error) {
    console.error('Erro ao carregar do cache:', error);
  }
}

// Sincronizar com servidor
async function syncWithServer() {
  if (!clickData) {
    await loadFromCache();
  }

  if (!clickData) {
    console.log('Nenhum dado para sincronizar');
    return;
  }

  const syncData = {
    clickData: clickData,
    events: events,
    lastSync: lastSync,
    timestamp: Date.now(),
    swVersion: '1.0.0'
  };

  try {
    const response = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncData)
    });

    if (response.ok) {
      lastSync = Date.now();
      console.log('✅ Sync completo:', await response.json());

      // Limpar eventos sincronizados
      events = [];
      saveEventsToCache();
    }
  } catch (error) {
    console.error('❌ Erro no sync:', error);

    // Salvar para retry
    await saveFailedSync(syncData);
  }
}

// Salvar sync que falhou
async function saveFailedSync(data) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match('/failed-syncs');
    const failedSyncs = existing ? await existing.json() : [];

    failedSyncs.push(data);

    // Manter apenas últimos 50 syncs falhos
    if (failedSyncs.length > 50) {
      failedSyncs.splice(0, failedSyncs.length - 50);
    }

    await cache.put('/failed-syncs', new Response(JSON.stringify(failedSyncs)));
  } catch (error) {
    console.error('Erro ao salvar sync falho:', error);
  }
}

// Retentar syncs falhos
async function retryFailedSyncs() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/failed-syncs');

    if (!response) return;

    const failedSyncs = await response.json();

    for (const syncData of failedSyncs) {
      try {
        await fetch(`${API_BASE}/api/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(syncData)
        });
      } catch (error) {
        console.error('Retry falhou:', error);
      }
    }

    // Limpar syncs processados
    await cache.delete('/failed-syncs');
  } catch (error) {
    console.error('Erro ao retentar syncs:', error);
  }
}

// Track clicks em links de afiliado
function trackAffiliateClick(url) {
  const event = {
    type: 'affiliate_click',
    url: url.href,
    platform: detectPlatform(url.href),
    timestamp: Date.now(),
    clickId: clickData?.clickId
  };

  events.push(event);
  saveEventsToCache();

  // Sync imediato para clicks importantes
  syncWithServer();
}

// Detectar plataforma
function detectPlatform(url) {
  if (url.includes('amazon.com')) return 'amazon';
  if (url.includes('mercadolivre.com')) return 'mercadolivre';
  if (url.includes('magazineluiza.com')) return 'magazineluiza';
  if (url.includes('americanas.com')) return 'americanas';
  if (url.includes('shopee.com')) return 'shopee';
  if (url.includes('aliexpress.com')) return 'aliexpress';
  return 'outros';
}

// Iniciar sync periódico
function startPeriodicSync() {
  // Sync a cada 5 minutos
  setInterval(() => {
    syncWithServer();
  }, SYNC_INTERVAL);

  // Retry syncs falhos a cada 15 minutos
  setInterval(() => {
    retryFailedSyncs();
  }, 15 * 60 * 1000);

  // Registrar periodic sync se disponível
  if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('sync-tracking-periodic', {
      minInterval: 12 * 60 * 60 * 1000 // 12 horas
    }).catch(err => console.log('Periodic sync não disponível:', err));
  }
}

// Lidar com requisições de tracking
async function handleTrackingRequest(request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  const trackingData = {
    clickId: params.get('id') || clickData?.clickId,
    event: params.get('event') || 'pageview',
    timestamp: Date.now(),
    url: params.get('url') || request.referrer
  };

  // Salvar evento
  events.push(trackingData);
  saveEventsToCache();

  // Retornar pixel transparente
  return new Response(
    '\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00\x21\xF9\x04\x01\x00\x00\x00\x00\x2C\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3B',
    {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
}

// Carregar dados ao iniciar
loadFromCache();

console.log('🔥 Eternal Service Worker pronto!');