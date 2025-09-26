/**
 * Busca Busca Brasil - Link Enhancer Worker
 * Cloudflare Worker para redirects inteligentes com persistência máxima
 * TAGS REAIS DE AFILIADO - ALEXANDRE
 */

// Configurações - TAGS REAIS DO ALEXANDRE
const AMAZON_TAG = 'buscabusca0f-20';  // Tag real Amazon
const MERCADOLIVRE_TAG = 'wa20250726131129';  // Tag real Mercado Livre
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias
const INTERMEDIATE_DELAY = 800; // ms antes do redirect
const KV_NAMESPACE = 'BBB_LINKS'; // Configurar no Cloudflare

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Rota principal de redirect
  if (url.pathname.startsWith('/r/')) {
    return handleRedirect(request, url);
  }
  
  // API endpoints
  if (url.pathname.startsWith('/api/')) {
    return handleAPI(request, url);
  }
  
  // Fallback para origin
  return fetch(request);
}

/**
 * Processa redirects com tracking
 */
async function handleRedirect(request, url) {
  const key = url.pathname.split('/r/')[1].split('?')[0];
  
  if (!key) {
    return new Response('Link inválido', { status: 404 });
  }
  
  // Buscar dados do redirect no KV
  const redirectData = await BBB_LINKS.get(`redirect:${key}`, 'json');
  
  if (!redirectData || !redirectData.active) {
    return new Response('Link não encontrado ou expirado', { status: 404 });
  }
  
  // Verificar expiração
  if (redirectData.expires_at && new Date(redirectData.expires_at) < new Date()) {
    return new Response('Link expirado', { status: 410 });
  }
  
  // Gerar ID único do click
  const clickId = generateClickId();
  
  // Capturar dados do usuário
  const clickData = {
    key,
    click_id: clickId,
    ua: request.headers.get('user-agent') || 'unknown',
    ip: request.headers.get('cf-connecting-ip') || 'unknown',
    referrer: request.headers.get('referer') || 'direct',
    device: detectDevice(request.headers.get('user-agent')),
    country: request.headers.get('cf-ipcountry') || 'unknown',
    ts: new Date().toISOString(),
    platform: redirectData.platform,
    owner: redirectData.owner
  };
  
  // Salvar click no KV (async sem await para não atrasar redirect)
  saveClick(clickData);
  
  // Preparar cookies first-party
  const cookieValue = `${redirectData.platform}:${redirectData.owner}:${clickId}`;
  const setCookieHeader = `bb_ref=${cookieValue}; Max-Age=${COOKIE_MAX_AGE}; Path=/; Secure; SameSite=Lax; HttpOnly`;
  
  // Gerar HTML intermediário com persistência máxima
  const html = generateIntermediatePage({
    dest: redirectData.dest,
    clickId,
    platform: redirectData.platform,
    owner: redirectData.owner,
    title: redirectData.title || 'Redirecionando...',
    delay: INTERMEDIATE_DELAY,
    addToCart: shouldAttemptAddToCart(redirectData)
  });
  
  // Retornar resposta com cookie e HTML
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'set-cookie': setCookieHeader,
      'cache-control': 'no-cache, no-store, must-revalidate'
    }
  });
}

/**
 * Gera página intermediária com múltiplas estratégias de persistência
 */
function generateIntermediatePage(params) {
  const { dest, clickId, platform, owner, title, delay, addToCart } = params;
  
  // Preparar URL final (com add-to-cart se aplicável)
  let finalUrl = dest;
  if (addToCart && platform === 'amazon') {
    finalUrl = convertToAddToCart(dest);
  }
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 400px;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 32px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border: 4px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .fallback {
            margin-top: 24px;
            font-size: 14px;
            opacity: 0.8;
        }
        .fallback a {
            color: white;
            text-decoration: underline;
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">BBB</div>
        <h1>Preparando seu link...</h1>
        <p>Você está sendo direcionado para a melhor oferta disponível</p>
        <div class="spinner"></div>
        <div class="fallback hidden" id="fallback">
            <p>Se não for redirecionado automaticamente,<br>
            <a href="${finalUrl}" id="fallbackLink">clique aqui</a></p>
        </div>
    </div>
    
    <script>
        // Configuração
        const DEST_URL = '${finalUrl}';
        const CLICK_ID = '${clickId}';
        const PLATFORM = '${platform}';
        const OWNER = '${owner}';
        const DELAY = ${delay};
        
        // Função para salvar dados localmente (múltiplas estratégias)
        function persistData() {
            const data = {
                click_id: CLICK_ID,
                platform: PLATFORM,
                owner: OWNER,
                ts: Date.now(),
                ref: window.location.href
            };
            
            // 1. localStorage (mais persistente)
            try {
                localStorage.setItem('bb_ref', JSON.stringify(data));
                localStorage.setItem('bb_last_click', CLICK_ID);
                // Manter histórico de clicks (útil para reconciliação)
                const history = JSON.parse(localStorage.getItem('bb_history') || '[]');
                history.push(data);
                // Manter apenas últimos 10 clicks
                if (history.length > 10) history.shift();
                localStorage.setItem('bb_history', JSON.stringify(history));
            } catch(e) {
                console.log('localStorage não disponível');
            }
            
            // 2. sessionStorage (backup)
            try {
                sessionStorage.setItem('bb_ref', JSON.stringify(data));
            } catch(e) {}
            
            // 3. IndexedDB (máxima persistência - PWA ready)
            if ('indexedDB' in window) {
                try {
                    const request = indexedDB.open('BBBTracker', 1);
                    request.onsuccess = function(event) {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('clicks')) {
                            db.close();
                            return;
                        }
                        const transaction = db.transaction(['clicks'], 'readwrite');
                        const store = transaction.objectStore('clicks');
                        store.add(data);
                    };
                    request.onupgradeneeded = function(event) {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('clicks')) {
                            db.createObjectStore('clicks', { keyPath: 'click_id' });
                        }
                    };
                } catch(e) {}
            }
        }
        
        // Função para tentar deep link em apps
        function attemptDeepLink() {
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);
            
            if (PLATFORM === 'mercadolivre' && (isIOS || isAndroid)) {
                // Tentar abrir app do Mercado Livre
                const productId = DEST_URL.match(/MLB-?(\d+)/)?.[1];
                if (productId) {
                    const deepLink = isIOS 
                        ? 'mercadolibre://item?id=MLB' + productId
                        : 'intent://item?id=MLB' + productId + '#Intent;scheme=mercadolibre;package=com.mercadolibre;end';
                    
                    // Tentar abrir app
                    const start = Date.now();
                    window.location = deepLink;
                    
                    // Fallback se app não abrir
                    setTimeout(() => {
                        if (Date.now() - start < 1500) {
                            redirect();
                        }
                    }, 1000);
                    return true;
                }
            }
            
            if (PLATFORM === 'amazon' && (isIOS || isAndroid)) {
                // Tentar abrir app da Amazon
                const asin = DEST_URL.match(/\/dp\/([A-Z0-9]+)/)?.[1];
                if (asin) {
                    const deepLink = 'com.amazon.mobile.shopping://www.amazon.com.br/dp/' + asin;
                    
                    const start = Date.now();
                    window.location = deepLink;
                    
                    setTimeout(() => {
                        if (Date.now() - start < 1500) {
                            redirect();
                        }
                    }, 1000);
                    return true;
                }
            }
            
            return false;
        }
        
        // Função de redirect
        function redirect() {
            // Usar replace para não adicionar ao histórico
            window.location.replace(DEST_URL);
        }
        
        // Executar ao carregar
        document.addEventListener('DOMContentLoaded', function() {
            // Persistir dados imediatamente
            persistData();
            
            // Mostrar fallback após 2 segundos
            setTimeout(() => {
                document.getElementById('fallback').classList.remove('hidden');
            }, 2000);
            
            // Tentar deep link ou redirect direto
            setTimeout(() => {
                if (!attemptDeepLink()) {
                    redirect();
                }
            }, DELAY);
        });
        
        // Service Worker para PWA (preparação futura)
        if ('serviceWorker' in navigator && location.protocol === 'https:') {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    </script>
</body>
</html>`;
}

/**
 * Detecta tipo de dispositivo
 */
function detectDevice(userAgent) {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (/iphone|ipod/.test(ua)) return 'iphone';
  if (/ipad/.test(ua)) return 'ipad';
  if (/android.*mobile/.test(ua)) return 'android_phone';
  if (/android/.test(ua)) return 'android_tablet';
  if (/windows phone/.test(ua)) return 'windows_phone';
  if (/mac os x/.test(ua)) return 'mac';
  if (/windows/.test(ua)) return 'windows';
  if (/linux/.test(ua)) return 'linux';
  
  return 'other';
}

/**
 * Determina se deve tentar add-to-cart
 */
function shouldAttemptAddToCart(redirectData) {
  // Só para Amazon e quando configurado
  return redirectData.platform === 'amazon' && 
         redirectData.add_to_cart === true &&
         redirectData.dest.includes('/dp/');
}

/**
 * Converte link de produto Amazon em add-to-cart
 */
function convertToAddToCart(url) {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]+)/);
  const tagMatch = url.match(/tag=([^&]+)/);
  
  if (asinMatch && tagMatch) {
    const asin = asinMatch[1];
    const tag = tagMatch[1];
    return `https://www.amazon.com.br/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&tag=${tag}`;
  }
  
  return url;
}

/**
 * Salva click no KV (async)
 */
async function saveClick(clickData) {
  try {
    // Salvar click individual
    await BBB_LINKS.put(
      `click:${clickData.click_id}`,
      JSON.stringify(clickData),
      {
        expirationTtl: 90 * 24 * 60 * 60 // 90 dias
      }
    );
    
    // Incrementar contador do link
    const stats = await BBB_LINKS.get(`stats:${clickData.key}`, 'json') || { clicks: 0 };
    stats.clicks++;
    stats.last_click = clickData.ts;
    await BBB_LINKS.put(`stats:${clickData.key}`, JSON.stringify(stats));
    
    // Adicionar ao log diário (para analytics)
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `daily:${today}:${clickData.key}`;
    const dailyStats = await BBB_LINKS.get(dailyKey, 'json') || { clicks: 0 };
    dailyStats.clicks++;
    await BBB_LINKS.put(
      dailyKey,
      JSON.stringify(dailyStats),
      { expirationTtl: 180 * 24 * 60 * 60 } // 6 meses
    );
    
  } catch (error) {
    console.error('Erro salvando click:', error);
  }
}

/**
 * Gera ID único para click
 */
function generateClickId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Handler para API endpoints
 */
async function handleAPI(request, url) {
  const path = url.pathname.replace('/api/', '');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Verificar autenticação (simplified para MVP)
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Rotas da API
  try {
    // Criar novo redirect
    if (path === 'redirects' && request.method === 'POST') {
      const data = await request.json();
      const key = generateShortKey();
      
      const redirectData = {
        key,
        dest: data.dest,
        platform: data.platform || detectPlatform(data.dest),
        owner: data.owner || 'default',
        title: data.title || '',
        add_to_cart: data.add_to_cart || false,
        expires_at: data.expires_at || null,
        active: true,
        created_at: new Date().toISOString()
      };
      
      await BBB_LINKS.put(`redirect:${key}`, JSON.stringify(redirectData));
      
      return new Response(
        JSON.stringify({
          success: true,
          key,
          short_url: `https://bbbrasil.com/r/${key}`,
          data: redirectData
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Listar redirects
    if (path === 'redirects' && request.method === 'GET') {
      const list = await BBB_LINKS.list({ prefix: 'redirect:' });
      const redirects = [];
      
      for (const item of list.keys) {
        const data = await BBB_LINKS.get(item.name, 'json');
        if (data) {
          const stats = await BBB_LINKS.get(`stats:${data.key}`, 'json') || { clicks: 0 };
          redirects.push({ ...data, clicks: stats.clicks });
        }
      }
      
      return new Response(
        JSON.stringify(redirects),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Obter estatísticas
    if (path.startsWith('stats/') && request.method === 'GET') {
      const key = path.replace('stats/', '');
      const stats = await BBB_LINKS.get(`stats:${key}`, 'json') || { clicks: 0 };
      
      // Buscar clicks recentes
      const recentClicks = [];
      const list = await BBB_LINKS.list({ prefix: 'click:' });
      
      for (const item of list.keys) {
        const click = await BBB_LINKS.get(item.name, 'json');
        if (click && click.key === key) {
          recentClicks.push(click);
        }
        if (recentClicks.length >= 100) break; // Limitar a 100 clicks recentes
      }
      
      return new Response(
        JSON.stringify({
          ...stats,
          recent_clicks: recentClicks.sort((a, b) => 
            new Date(b.ts).getTime() - new Date(a.ts).getTime()
          )
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Gera chave curta única
 */
function generateShortKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 6; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

/**
 * Detecta plataforma do link
 */
function detectPlatform(url) {
  if (url.includes('amazon.com')) return 'amazon';
  if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) return 'mercadolivre';
  if (url.includes('magazineluiza.com') || url.includes('magalu.com')) return 'magalu';
  if (url.includes('americanas.com')) return 'americanas';
  if (url.includes('casasbahia.com')) return 'casasbahia';
  if (url.includes('shopee.com')) return 'shopee';
  if (url.includes('aliexpress.com')) return 'aliexpress';
  return 'other';
}
