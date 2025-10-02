/**
 * Service Worker PWA - BuscaBuscaBrasil
 * APENAS AMAZON E MERCADO LIVRE
 * Cache limpo - Sem erros de mixed content
 */

const CACHE_VERSION = 'bbb-v3.0.0-clean';
const CACHE_NAME = `${CACHE_VERSION}-static`;

// Assets LOCAIS para cache (apenas nosso domínio)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// ✅ DOMÍNIOS PERMITIDOS - APENAS AMAZON E MERCADO LIVRE
const ALLOWED_DOMAINS = [
  'buscabuscabrasil.com.br',
  'www.buscabuscabrasil.com.br',
  // Amazon
  'amazon.com.br',
  'www.amazon.com.br',
  'amzn.to',
  'm.media-amazon.com',            // Imagens Amazon CDN
  'images-na.ssl-images-amazon.com', // Imagens Amazon CDN alternativo
  // Mercado Livre
  'mercadolivre.com.br',
  'www.mercadolivre.com.br',
  'mercadolibre.com',
  'http2.mlstatic.com',            // Imagens Mercado Livre CDN
  // Firebase
  'firebaseapp.com',
  'firestore.googleapis.com',
  'firebase.googleapis.com'
];

// Instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3.0.0 - Clean version');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[SW] Cache add failed (non-critical):', err);
      });
    }).then(() => {
      console.log('[SW] Install complete');
      // Skip waiting para atualizar imediatamente
      return self.skipWaiting();
    })
  );
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v3.0.0 - Cleaning old caches...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete - Taking control');
      return self.clients.claim();
    })
  );
});

// Função para verificar se domínio é permitido
function isAllowedDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

// Fetch - APENAS domínios permitidos
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar requisições não-HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // ❌ BLOQUEAR domínios não permitidos (evita mixed content)
  if (!isAllowedDomain(request.url)) {
    console.log('[SW] Blocked domain:', request.url);
    return; // Deixa o browser lidar (vai bloquear mixed content)
  }

  const url = new URL(request.url);

  // ✅ APENAS nosso domínio + Firebase
  if (url.hostname.includes('buscabuscabrasil') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('firestore')) {

    // Firebase - Network First
    if (url.hostname.includes('firebase') || url.hostname.includes('firestore')) {
      event.respondWith(networkFirstStrategy(request));
      return;
    }

    // Assets estáticos do nosso site - Cache First
    if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font') {
      event.respondWith(cacheFirstStrategy(request));
      return;
    }

    // Páginas HTML - Network First
    if (request.destination === 'document') {
      event.respondWith(networkFirstStrategy(request));
      return;
    }
  }

  // ✅ Amazon e Mercado Livre - APENAS PASSAR (não cachear)
  if (url.hostname.includes('amazon') ||
      url.hostname.includes('amzn') ||
      url.hostname.includes('mercado')) {
    console.log('[SW] Passing through to affiliate:', url.hostname);
    // NÃO interceptar - deixar o browser fazer a requisição normal
    return;
  }

  // Default: Network only (sem cache)
  event.respondWith(fetch(request));
});

// Estratégia: Network First (apenas para nosso domínio + Firebase)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Salvar no cache se for sucesso E método GET
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {});
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
      const offlineCache = await caches.match('/index.html');
      if (offlineCache) return offlineCache;
    }

    // Retornar erro de rede
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia: Cache First (apenas para assets locais)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Atualizar cache em background (silent)
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {}); // Ignorar erros de atualização

    return cachedResponse;
  }

  // Se não estiver no cache, buscar da rede
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }

    return networkResponse;
  } catch (error) {
    // Retornar erro
    return new Response('Resource not available', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

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
      }).then(() => {
        console.log('[SW] All caches cleared');
      })
    );
  }
});

console.log('[SW] Service Worker v3.0.0 loaded - Clean Amazon + ML only');
