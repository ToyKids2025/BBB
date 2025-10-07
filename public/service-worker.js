// public/service-worker.js
// 🔥 FIX SW CLONE ERROR: Response validation + API exclusion

const STATIC_CACHE_NAME = 'bbb-static-cache-v6'; // ⚡ FAST: No pre-caching
const DYNAMIC_CACHE_NAME = 'bbb-dynamic-cache-v6'; // ⚡ FAST: No pre-caching

// ⚡ OTIMIZAÇÃO: Removido pre-caching para carregar instantaneamente
// Cache será feito sob demanda conforme usuário navega

// Evento de instalação: é acionado quando o Service Worker é instalado pela primeira vez.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install (Fast Mode)');
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

  // 🔧 FIX: Ignorar APIs externas que causam erro
  const urlString = event.request.url;
  if (urlString.includes('ipapi.co') ||
      urlString.includes('unshorten.me') ||
      urlString.includes('firebaseinstallations') ||
      urlString.includes('firebaselogging')) {
    // Deixar passar sem cachear
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia: Stale-While-Revalidate para o App Shell (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // ✅ FIX: Verificar se response é válida antes de clonar
          if (networkResponse && networkResponse.ok) {
            caches.open(STATIC_CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            }).catch(() => {}); // Ignorar erros de cache
          }
          return networkResponse;
        }).catch(err => {
          // Se network falhar, retornar cache (se existir)
          return response || new Response('Offline', { status: 503 });
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
        // ✅ FIX: Verificar se response é válida e clonável
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request.url, networkResponse.clone()).catch(() => {});
          return networkResponse;
        }).catch(() => networkResponse);
      }).catch(() => {
        // Fallback se tudo falhar
        return new Response('Resource not available', { status: 404 });
      });
    })
  );
});