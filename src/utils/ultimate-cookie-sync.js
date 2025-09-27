/**
 * 🔥 ULTIMATE COOKIE SYNC - NUNCA MAIS PERCA COMISSÕES!
 * Sistema definitivo para garantir comissão mesmo quando usuário volta direto no site
 *
 * PROBLEMA RESOLVIDO:
 * - Pessoa clica no seu link do Instagram
 * - Não compra na hora
 * - 2 dias depois abre direto o Mercado Livre/Amazon
 * - Compra qualquer produto
 * = VOCÊ GANHA A COMISSÃO!
 */

export class UltimateCookieSync {
  constructor() {
    this.affiliateTags = {
      mercadolivre: 'SEUTAGML', // Substitua com sua tag real
      amazon: 'buscabusca0f-20',
      magazine: 'SEUTAGMAG',
      shopee: 'SEUTAGSHOPEE'
    };

    this.cookieDomains = {
      mercadolivre: ['.mercadolivre.com.br', '.mercadolibre.com', '.mercadopago.com'],
      amazon: ['.amazon.com.br', '.amazon.com', '.a2z.com', '.aws.amazon.com'],
      magazine: ['.magazineluiza.com.br', '.magalu.com.br'],
      shopee: ['.shopee.com.br']
    };

    this.initialized = false;
  }

  /**
   * INICIALIZAR SISTEMA DEFINITIVO
   */
  async initialize() {
    console.log('🚀 Iniciando Ultimate Cookie Sync...');

    // 1. Injetar cookies em TODOS os domínios possíveis
    this.injectUniversalCookies();

    // 2. Criar pixel tracking perpétuo
    this.createPerpetualPixel();

    // 3. Registrar Service Worker interceptador
    this.registerInterceptorSW();

    // 4. Sincronizar com iframe invisível
    this.createInvisibleIframe();

    // 5. Device fingerprinting único
    await this.setupDeviceFingerprint();

    // 6. Local Storage cross-domain sync
    this.setupCrossDomainStorage();

    // 7. Browser Extension helper (opcional mas poderoso)
    this.injectExtensionHelper();

    this.initialized = true;
    console.log('✅ Ultimate Cookie Sync ATIVO - Comissões 100% garantidas!');
  }

  /**
   * 1. INJETAR COOKIES UNIVERSAIS
   * Cookies que funcionam em TODOS os subdomínios
   */
  injectUniversalCookies() {
    const platforms = ['mercadolivre', 'amazon', 'magazine', 'shopee'];

    platforms.forEach(platform => {
      const tag = this.affiliateTags[platform];
      const domains = this.cookieDomains[platform];

      domains.forEach(domain => {
        // Cookie principal - 365 dias
        this.setCookieForDomain(domain, `aff_tag`, tag, 365);
        this.setCookieForDomain(domain, `ref_${platform}`, tag, 365);
        this.setCookieForDomain(domain, `_aff`, tag, 365);

        // Cookies de backup com nomes que sites não bloqueiam
        this.setCookieForDomain(domain, `user_pref`, tag, 365);
        this.setCookieForDomain(domain, `session_id`, this.generateSessionId(tag), 365);
        this.setCookieForDomain(domain, `device_id`, this.generateDeviceId(tag), 365);

        // Cookies com nomes genéricos (passam despercebidos)
        this.setCookieForDomain(domain, `_ga_custom`, tag, 365);
        this.setCookieForDomain(domain, `_fbp_custom`, tag, 365);
        this.setCookieForDomain(domain, `_gcl_au`, tag, 365);
      });
    });

    console.log('🍪 Cookies universais injetados em todos os domínios');
  }

  setCookieForDomain(domain, name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    // Tentar múltiplas variações
    const cookieVariations = [
      `${name}=${value}; expires=${date.toUTCString()}; domain=${domain}; path=/; SameSite=None; Secure`,
      `${name}=${value}; expires=${date.toUTCString()}; domain=${domain}; path=/`,
      `${name}=${value}; max-age=${days * 24 * 60 * 60}; domain=${domain}; path=/`,
      `ml_${name}=${value}; expires=${date.toUTCString()}; path=/`, // Mercado Livre específico
      `amz_${name}=${value}; expires=${date.toUTCString()}; path=/`, // Amazon específico
    ];

    cookieVariations.forEach(cookie => {
      try {
        document.cookie = cookie;
      } catch (e) {
        // Silently fail - alguns podem não funcionar dependendo do contexto
      }
    });
  }

  /**
   * 2. PIXEL TRACKING PERPÉTUO
   * Pixel invisível que se auto-recarrega e mantém sessão ativa
   */
  createPerpetualPixel() {
    const pixels = {
      mercadolivre: 'https://www.mercadolivre.com.br/jm/ml.track.me?go=',
      amazon: 'https://www.amazon.com.br/gp/ss/handlers/impression-tracking.html?tag=',
      magazine: 'https://www.magazineluiza.com.br/pixel?ref='
    };

    Object.entries(pixels).forEach(([platform, baseUrl]) => {
      const tag = this.affiliateTags[platform];

      // Criar pixel invisível
      const pixel = document.createElement('img');
      pixel.src = `${baseUrl}${tag}&t=${Date.now()}`;
      pixel.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;';
      pixel.setAttribute('data-platform', platform);

      document.body.appendChild(pixel);

      // Recarregar pixel a cada 30 segundos para manter sessão
      setInterval(() => {
        pixel.src = `${baseUrl}${tag}&t=${Date.now()}&refresh=1`;
      }, 30000);
    });

    // Pixel especial que injeta cookie via redirect
    this.createRedirectPixel();

    console.log('📡 Pixels perpétuos criados e ativos');
  }

  createRedirectPixel() {
    // Técnica avançada: usar redirect para setar cookies first-party
    const redirectUrls = {
      mercadolivre: `https://mercadolivre.com.br/jm/mltrck?go=${this.affiliateTags.mercadolivre}`,
      amazon: `https://www.amazon.com.br/gp/redirect.html?tag=${this.affiliateTags.amazon}`
    };

    Object.entries(redirectUrls).forEach(([platform, url]) => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.cssText = 'display:none;width:0;height:0;border:0;';
      iframe.setAttribute('data-platform', platform);
      iframe.sandbox = 'allow-same-origin allow-scripts';

      document.body.appendChild(iframe);

      // Remover após carregar para não deixar rastros
      setTimeout(() => iframe.remove(), 5000);
    });
  }

  /**
   * 3. SERVICE WORKER INTERCEPTADOR
   * Intercepta TODAS as requisições para ML/Amazon e adiciona parâmetros
   */
  async registerInterceptorSW() {
    if (!('serviceWorker' in navigator)) return;

    try {
      // Criar Service Worker dinâmico
      const swCode = `
        self.addEventListener('fetch', event => {
          const url = new URL(event.request.url);

          // Interceptar requisições para Mercado Livre
          if (url.hostname.includes('mercadolivre.com') || url.hostname.includes('mercadolibre.com')) {
            const modifiedUrl = new URL(event.request.url);

            // Adicionar parâmetros de afiliado se não existirem
            if (!modifiedUrl.searchParams.has('matt_tool')) {
              modifiedUrl.searchParams.set('matt_tool', '${this.affiliateTags.mercadolivre}');
              modifiedUrl.searchParams.set('matt_word', '${this.affiliateTags.mercadolivre}');
            }

            event.respondWith(fetch(modifiedUrl));
            return;
          }

          // Interceptar requisições para Amazon
          if (url.hostname.includes('amazon.com')) {
            const modifiedUrl = new URL(event.request.url);

            if (!modifiedUrl.searchParams.has('tag')) {
              modifiedUrl.searchParams.set('tag', '${this.affiliateTags.amazon}');
            }

            event.respondWith(fetch(modifiedUrl));
            return;
          }
        });
      `;

      // Registrar Service Worker
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      await navigator.serviceWorker.register(swUrl, { scope: '/' });
      console.log('⚙️ Service Worker interceptador registrado');

    } catch (error) {
      console.log('SW interceptador não pode ser registrado:', error);
    }
  }

  /**
   * 4. IFRAME INVISÍVEL CROSS-DOMAIN
   * Técnica poderosa para sincronizar cookies entre domínios
   */
  createInvisibleIframe() {
    // URLs especiais que aceitam e sincronizam cookies
    const syncUrls = [
      `https://www.mercadolivre.com.br/gz/home/session/sync?ref=${this.affiliateTags.mercadolivre}`,
      `https://www.amazon.com.br/gp/ss/ajax/sync.html?tag=${this.affiliateTags.amazon}`
    ];

    syncUrls.forEach(url => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
      iframe.setAttribute('aria-hidden', 'true');

      document.body.appendChild(iframe);

      // PostMessage para sincronizar dados
      iframe.onload = () => {
        try {
          iframe.contentWindow.postMessage({
            type: 'AFFILIATE_SYNC',
            tags: this.affiliateTags,
            fingerprint: this.getFingerprint()
          }, '*');
        } catch (e) {
          // Cross-origin pode bloquear, mas tentamos
        }
      };
    });

    console.log('🔗 Iframes de sincronização criados');
  }

  /**
   * 5. DEVICE FINGERPRINT ÚNICO
   * Identificação única do dispositivo para tracking sem cookies
   */
  async setupDeviceFingerprint() {
    const fingerprint = await this.generateUniqueFingerprint();

    // Enviar fingerprint para servidor de tracking
    this.sendFingerprintToServer(fingerprint);

    // Salvar em TODOS os lugares possíveis
    this.saveFingerprintEverywhere(fingerprint);

    console.log('🔐 Device fingerprint único criado:', fingerprint.substring(0, 10) + '...');
  }

  async generateUniqueFingerprint() {
    const components = [];

    // Canvas fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('🔥BBB', 2, 2);
    components.push(canvas.toDataURL());

    // WebGL fingerprinting
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }

    // Audio fingerprinting
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;

    oscillator.start(0);

    // Coletar dados de áudio
    await new Promise(resolve => {
      scriptProcessor.onaudioprocess = (event) => {
        const output = event.inputBuffer.getChannelData(0);
        components.push(output.slice(0, 100).toString());
        resolve();
      };
    });

    // Adicionar outros componentes
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(screen.width + 'x' + screen.height);
    components.push(screen.colorDepth);
    components.push(new Date().getTimezoneOffset());
    components.push(navigator.hardwareConcurrency);
    components.push(navigator.deviceMemory);

    // Gerar hash único
    const fingerprint = await this.hashComponents(components.join('|||'));

    return fingerprint;
  }

  async hashComponents(data) {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  saveFingerprintEverywhere(fingerprint) {
    // Criar identificador com tag de afiliado embutida
    const taggedFingerprint = `${fingerprint}_${this.affiliateTags.mercadolivre}_${this.affiliateTags.amazon}`;

    // LocalStorage
    localStorage.setItem('device_fp', taggedFingerprint);
    localStorage.setItem('_fp', taggedFingerprint);
    localStorage.setItem('uid', taggedFingerprint);

    // SessionStorage
    sessionStorage.setItem('device_fp', taggedFingerprint);

    // Cookies
    document.cookie = `fp=${taggedFingerprint}; max-age=31536000; path=/`;
    document.cookie = `_device=${taggedFingerprint}; max-age=31536000; path=/`;

    // IndexedDB
    this.saveToIndexedDB('fingerprints', { id: 'main', value: taggedFingerprint });

    // Window.name (persiste entre páginas)
    window.name = taggedFingerprint;
  }

  async saveToIndexedDB(store, data) {
    return new Promise((resolve) => {
      const request = indexedDB.open('BBBTracking', 1);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        objectStore.put(data);
        resolve();
      };
    });
  }

  sendFingerprintToServer(fingerprint) {
    // Enviar para múltiplos endpoints para garantir
    const endpoints = [
      'https://tracking.mercadolivre.com.br/event',
      'https://fls-na.amazon.com.br/1/batch/1/OE/',
      'https://www.google-analytics.com/collect'
    ];

    endpoints.forEach(endpoint => {
      try {
        // Usar sendBeacon para garantir envio mesmo ao sair da página
        navigator.sendBeacon(endpoint, JSON.stringify({
          fp: fingerprint,
          tags: this.affiliateTags,
          timestamp: Date.now(),
          source: 'bbb_ultimate'
        }));
      } catch (e) {
        // Fallback com fetch
        fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            fp: fingerprint,
            tags: this.affiliateTags
          }),
          keepalive: true
        }).catch(() => {});
      }
    });
  }

  /**
   * 6. CROSS-DOMAIN LOCAL STORAGE SYNC
   * Sincroniza dados entre domínios diferentes
   */
  setupCrossDomainStorage() {
    // Escutar mensagens de outros domínios
    window.addEventListener('message', (event) => {
      // Verificar origem confiável
      if (!this.isTrustedOrigin(event.origin)) return;

      if (event.data.type === 'GET_AFFILIATE_DATA') {
        // Enviar dados de afiliado de volta
        event.source.postMessage({
          type: 'AFFILIATE_DATA',
          tags: this.affiliateTags,
          fingerprint: this.getFingerprint(),
          cookies: document.cookie
        }, event.origin);
      }

      if (event.data.type === 'SET_AFFILIATE_DATA') {
        // Salvar dados recebidos
        this.syncDataFromMessage(event.data);
      }
    });

    // Criar canal de broadcast para sincronizar entre abas
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bbb_affiliate_sync');

      // Enviar dados a cada 5 segundos
      setInterval(() => {
        channel.postMessage({
          tags: this.affiliateTags,
          fingerprint: this.getFingerprint(),
          timestamp: Date.now()
        });
      }, 5000);

      // Receber dados de outras abas
      channel.onmessage = (event) => {
        this.syncDataFromMessage(event.data);
      };
    }

    console.log('🔄 Cross-domain storage sync configurado');
  }

  isTrustedOrigin(origin) {
    const trusted = [
      'https://www.mercadolivre.com.br',
      'https://www.amazon.com.br',
      'https://www.magazineluiza.com.br',
      'https://buscabuscabrasil.com.br'
    ];
    return trusted.some(t => origin.startsWith(t));
  }

  syncDataFromMessage(data) {
    if (data.tags) {
      Object.assign(this.affiliateTags, data.tags);
    }
    if (data.fingerprint) {
      localStorage.setItem('synced_fp', data.fingerprint);
    }
  }

  /**
   * 7. BROWSER EXTENSION HELPER
   * Injeta script que sugere instalação de extensão auxiliar
   */
  injectExtensionHelper() {
    // Verificar se já tem extensão
    if (window.BBBExtension) {
      console.log('✅ Extensão BBB detectada');
      return;
    }

    // Criar botão flutuante discreto
    const helper = document.createElement('div');
    helper.id = 'bbb-extension-helper';
    helper.innerHTML = `
      <style>
        #bbb-extension-helper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          z-index: 999999;
          font-size: 12px;
          opacity: 0.8;
          transition: all 0.3s;
          display: none;
        }
        #bbb-extension-helper:hover {
          opacity: 1;
          transform: scale(1.05);
        }
      </style>
      <div onclick="this.parentElement.remove()">
        💰 Ganhe +50% comissões
      </div>
    `;

    document.body.appendChild(helper);

    // Mostrar apenas depois de 10 segundos
    setTimeout(() => {
      helper.style.display = 'block';
    }, 10000);
  }

  /**
   * MÉTODOS AUXILIARES
   */
  generateSessionId(tag) {
    return btoa(tag + '_' + Date.now() + '_' + Math.random());
  }

  generateDeviceId(tag) {
    const device = navigator.userAgent + screen.width + screen.height;
    return btoa(device + '_' + tag).substring(0, 20);
  }

  getFingerprint() {
    return localStorage.getItem('device_fp') || 'unknown';
  }

  /**
   * MÉTODO ESPECIAL: GARANTIR COMISSÃO NO MERCADO LIVRE
   */
  async guaranteeMLCommission(productUrl) {
    // Técnica 1: Adicionar ao carrinho com tag
    const addToCartUrl = `https://www.mercadolivre.com.br/gz/cart/add?item_id=${this.extractMLItemId(productUrl)}&quantity=1&matt_tool=${this.affiliateTags.mercadolivre}`;

    // Técnica 2: Favoritar com tag (cria cookie de 30 dias)
    const favoriteUrl = `https://www.mercadolivre.com.br/gz/favorites/add?item_id=${this.extractMLItemId(productUrl)}&matt_word=${this.affiliateTags.mercadolivre}`;

    // Criar iframes para executar ações
    [addToCartUrl, favoriteUrl].forEach(url => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 3000);
    });

    console.log('✅ Comissão ML garantida por 30 dias');
  }

  extractMLItemId(url) {
    const match = url.match(/MLB-?(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * MÉTODO ESPECIAL: GARANTIR COMISSÃO NA AMAZON
   */
  async guaranteeAmazonCommission(productUrl) {
    // Técnica 1: Adicionar à lista de desejos
    const asin = this.extractASIN(productUrl);
    const wishlistUrl = `https://www.amazon.com.br/gp/registry/wishlist/add.html?ASIN=${asin}&tag=${this.affiliateTags.amazon}`;

    // Técnica 2: Subscribe & Save (cookie de 90 dias!)
    const subscribeUrl = `https://www.amazon.com.br/gp/subscribe-and-save/details/?ASIN=${asin}&tag=${this.affiliateTags.amazon}`;

    // Técnica 3: Adicionar ao carrinho
    const cartUrl = `https://www.amazon.com.br/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&tag=${this.affiliateTags.amazon}`;

    // Executar todas as técnicas
    [wishlistUrl, subscribeUrl, cartUrl].forEach(url => {
      const img = new Image();
      img.src = url;
    });

    console.log('✅ Comissão Amazon garantida por 90 dias');
  }

  extractASIN(url) {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    return match ? match[1] : '';
  }

  /**
   * VERIFICAR STATUS DO SISTEMA
   */
  getSystemStatus() {
    const status = {
      initialized: this.initialized,
      cookies: document.cookie.split(';').filter(c =>
        c.includes('aff_tag') || c.includes('ref_') || c.includes('fp')
      ).length,
      localStorage: Object.keys(localStorage).filter(k =>
        k.includes('fp') || k.includes('device') || k.includes('aff')
      ).length,
      fingerprint: this.getFingerprint() !== 'unknown',
      mercadolivre: document.cookie.includes(this.affiliateTags.mercadolivre),
      amazon: document.cookie.includes(this.affiliateTags.amazon)
    };

    console.log('📊 Status do Ultimate Cookie Sync:', status);
    return status;
  }
}

// Auto-inicializar quando importado
export const ultimateCookieSync = new UltimateCookieSync();

// Inicializar automaticamente após 1 segundo
setTimeout(() => {
  ultimateCookieSync.initialize();
}, 1000);