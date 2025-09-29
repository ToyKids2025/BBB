// public/service-worker.js

const STATIC_CACHE_NAME = 'bbb-static-cache-v2';
const DYNAMIC_CACHE_NAME = 'bbb-dynamic-cache-v1';
// Lista de arquivos essenciais para o funcionamento offline do app shell.
// O '.' representa a raiz (index.html).
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// Evento de instalação: é acionado quando o Service Worker é instalado pela primeira vez.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  // waitUntil() garante que o Service Worker não será instalado até que o código dentro dele seja executado com sucesso.
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Força o novo Service Worker a se tornar ativo imediatamente.
  self.skipWaiting();
});

// Evento de ativação: é acionado quando o Service Worker é ativado.
// É um bom lugar para limpar caches antigos.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (!cacheWhitelist.includes(key)) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Garante que o Service Worker ativado tome controle imediato da página.
  self.clients.claim();
});

// Evento de fetch: intercepta todas as requisições de rede.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET (ex: POST para o Firebase)
  if (event.request.method !== 'GET') {
    return;
  }

  // Estratégia: Stale-While-Revalidate para o App Shell (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          const cacheToOpen = caches.open(STATIC_CACHE_NAME);
          cacheToOpen.then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return response || fetchPromise;
      })
    );
    return;
  }

  // Estratégia: Cache First para outros recursos (CSS, JS, Imagens)
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // Retorna do cache se encontrar
      }
      // Se não, busca na rede, salva no cache dinâmico e retorna
      return fetch(event.request).then(networkResponse => {
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request.url, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});