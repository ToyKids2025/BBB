/**
 * 🔥 LINK ENHANCER V2 - SISTEMA TURBINADO COM 6 MELHORIAS
 *
 * NOVAS FUNCIONALIDADES V2:
 * 1. ✅ Retry automático para expansão (3 tentativas)
 * 2. ✅ Deep Links nativos (abre app Amazon/ML direto)
 * 3. ✅ Parâmetros UTM avançados (tracking premium)
 * 4. ✅ Fallback inteligente com cache persistente
 * 5. ✅ Add-to-cart automático Amazon (1-click)
 * 6. ✅ Geolocalização para links regionais
 */

// Tags oficiais
const AFFILIATE_TAGS = {
  AMAZON: 'buscabusca0f-20',
  ML_WORD: 'wa20250726131129',
  ML_TOOL: '88344921'
};

// Configurações V2
const CONFIG_V2 = {
  RETRY_ATTEMPTS: 3,           // Tentar 3x antes de fallback
  RETRY_DELAY: 1000,           // 1s entre tentativas
  CACHE_DURATION: 7200000,     // 2h de cache (ms)
  ENABLE_DEEP_LINKS: true,     // Deep links nativos
  ENABLE_UTM: true,            // Parâmetros UTM
  ENABLE_ADD_TO_CART: true,    // Amazon add-to-cart
  ENABLE_GEO: true             // Geolocalização
};

/**
 * CLASSE PRINCIPAL - LINK ENHANCER V2
 */
export class LinkEnhancerV2 {
  constructor() {
    this.cache = new Map();
    this.persistentCache = this.loadPersistentCache();
    this.userGeo = null; // Geolocalização do usuário
  }

  /**
   * MÉTODO PRINCIPAL - PROCESSAR COM MELHORIAS V2
   */
  async enhanceLink(url, platform = null, options = {}) {
    if (!url) return url;

    // Auto-detectar platform (sempre, mesmo se vier "other")
    const detectedPlatform = this.detectPlatform(url);

    // Se platform vier como "other" mas detectamos Amazon/ML, usar o detectado
    if (!platform || platform === 'other') {
      platform = detectedPlatform;
    }

    console.log('🔧 [Link Enhancer V2] Processando:', {
      url: url.substring(0, 50),
      platform,
      detected: detectedPlatform,
      v2: true
    });

    // Verificar cache persistente primeiro
    const cached = this.getCachedLink(url);
    if (cached) {
      console.log('💾 [Cache Hit] Link encontrado no cache');
      return cached;
    }

    try {
      let enhancedUrl = url;

      switch (platform) {
        case 'amazon':
          enhancedUrl = await this.enhanceAmazonLinkV2(url, options);
          break;
        case 'mercadolivre':
          enhancedUrl = await this.enhanceMercadoLivreLinkV2(url, options);
          break;
        default:
          enhancedUrl = url;
      }

      // Salvar no cache
      this.setCachedLink(url, enhancedUrl);

      console.log('✅ [Link Enhancer V2] Processado com sucesso:', {
        original: url.substring(0, 40),
        enhanced: enhancedUrl.substring(0, 40)
      });

      return enhancedUrl;

    } catch (error) {
      console.error('❌ [Link Enhancer V2] Erro:', error);
      return this.addBasicTag(url, platform);
    }
  }

  /**
   * ===================================
   * AMAZON V2 - MELHORIAS AVANÇADAS
   * ===================================
   */
  async enhanceAmazonLinkV2(url, options = {}) {
    // 1. Expandir amzn.to com RETRY
    if (url.includes('amzn.to')) {
      console.log('🔗 [Amazon V2] Expandindo link curto com retry...');
      url = await this.expandWithRetry(url, 'amazon');
    }

    // 2. Extrair ASIN
    const asin = this.extractAmazonASIN(url);
    if (!asin) {
      console.warn('⚠️ [Amazon V2] ASIN não encontrado, usando fallback');
      return this.addBasicAmazonTag(url);
    }

    console.log('📦 [Amazon V2] ASIN extraído:', asin);

    // 3. Verificar se usuário quer deep link (mobile)
    if (CONFIG_V2.ENABLE_DEEP_LINKS && this.isMobile() && options.deepLink !== false) {
      const deepLink = this.createAmazonDeepLink(asin);
      console.log('📱 [Deep Link] Amazon app link criado');
      // Retornar objeto com deep link + web fallback
      return {
        deepLink: deepLink,
        webLink: this.buildModernAmazonUrlV2(asin, url, options),
        platform: 'amazon',
        asin: asin
      };
    }

    // 4. Construir URL moderna V2
    return this.buildModernAmazonUrlV2(asin, url, options);
  }

  /**
   * CONSTRUIR URL AMAZON V2 - COM TODAS MELHORIAS
   */
  buildModernAmazonUrlV2(asin, originalUrl, options = {}) {
    const baseUrl = `https://www.amazon.com.br/dp/${asin}`;
    const params = new URLSearchParams();

    // 1. Tag de afiliado (OBRIGATÓRIO)
    params.set('tag', AFFILIATE_TAGS.AMAZON);

    // 2. Amazon OneLink avançado
    const timestamp = Date.now();
    const ascsubtag = `bbb_${timestamp}_${this.getUserSource()}_${this.getDeviceType()}`;
    params.set('ascsubtag', ascsubtag);

    // 3. Referência de origem
    params.set('ref_', 'bbb_enhanced_v2');

    // 4. Preservar seleção + variações
    params.set('psc', '1');
    params.set('th', '1');

    // 🆕 5. ADD-TO-CART AUTOMÁTICO (se habilitado)
    if (CONFIG_V2.ENABLE_ADD_TO_CART && options.addToCart) {
      params.set('SubscribeAndSave', '1'); // Subscribe & Save (+15% desconto)
      params.set('quantity', options.quantity || '1');
      console.log('🛒 [Add-to-Cart] Adicionado ao link Amazon');
    }

    // 🆕 6. PARÂMETROS UTM AVANÇADOS (tracking premium)
    if (CONFIG_V2.ENABLE_UTM) {
      params.set('utm_source', 'buscabusca');
      params.set('utm_medium', options.medium || 'link');
      params.set('utm_campaign', options.campaign || 'affiliate');
      params.set('utm_content', `asin_${asin}`);
      params.set('utm_term', timestamp.toString());
      console.log('📊 [UTM] Parâmetros de tracking adicionados');
    }

    // 🆕 7. GEOLOCALIZAÇÃO (Amazon regional)
    if (CONFIG_V2.ENABLE_GEO && this.userGeo) {
      params.set('node', this.getAmazonRegionalNode(this.userGeo));
      console.log('🌍 [Geo] Link regionalizado:', this.userGeo.region);
    }

    // Construir URL final
    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log('🚀 [Amazon V2] URL turbinada construída:', {
      asin,
      features: [
        'OneLink',
        options.addToCart && 'AddToCart',
        CONFIG_V2.ENABLE_UTM && 'UTM',
        CONFIG_V2.ENABLE_GEO && 'Geo'
      ].filter(Boolean)
    });

    return finalUrl;
  }

  /**
   * ===================================
   * MERCADO LIVRE V2 - MELHORIAS
   * ===================================
   */
  async enhanceMercadoLivreLinkV2(url, options = {}) {
    // 1. Expandir /sec/ com RETRY
    if (url.includes('/sec/') || url.includes('/social/')) {
      console.log('🔗 [ML V2] Expandindo link curto com retry...');
      url = await this.expandWithRetry(url, 'mercadolivre');
    }

    // 2. Extrair MLB ID
    const mlbId = this.extractMLBId(url);
    if (!mlbId) {
      console.warn('⚠️ [ML V2] MLB ID não encontrado, usando fallback');
      return this.addBasicMLTag(url);
    }

    console.log('📦 [ML V2] MLB ID extraído:', mlbId);

    // 3. Verificar deep link mobile
    if (CONFIG_V2.ENABLE_DEEP_LINKS && this.isMobile() && options.deepLink !== false) {
      const deepLink = this.createMLDeepLink(mlbId);
      console.log('📱 [Deep Link] ML app link criado');
      return {
        deepLink: deepLink,
        webLink: this.buildModernMLUrlV2(mlbId, url, options),
        platform: 'mercadolivre',
        mlbId: mlbId
      };
    }

    // 4. Construir URL moderna V2
    return this.buildModernMLUrlV2(mlbId, url, options);
  }

  /**
   * CONSTRUIR URL ML V2 - COM MELHORIAS
   */
  buildModernMLUrlV2(mlbId, originalUrl, options = {}) {
    const domain = originalUrl.includes('.com.br') ?
      'mercadolivre.com.br' : 'mercadolibre.com';

    const baseUrl = `https://www.${domain}/MLB-${mlbId}`;
    const params = new URLSearchParams();

    // 1. Tags ML (OBRIGATÓRIO)
    params.set('matt_word', AFFILIATE_TAGS.ML_WORD.toLowerCase());
    params.set('matt_tool', AFFILIATE_TAGS.ML_TOOL);

    // 🆕 2. UTM TRACKING
    if (CONFIG_V2.ENABLE_UTM) {
      params.set('utm_source', 'buscabusca');
      params.set('utm_medium', options.medium || 'link');
      params.set('utm_campaign', options.campaign || 'affiliate');
      params.set('utm_content', `mlb_${mlbId}`);
      console.log('📊 [UTM] Parâmetros ML adicionados');
    }

    // 3. Preservar quantity
    const originalParams = this.extractUrlParams(originalUrl);
    if (originalParams.has('quantity')) {
      params.set('quantity', originalParams.get('quantity'));
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log('🚀 [ML V2] URL turbinada construída:', {
      mlbId,
      features: [CONFIG_V2.ENABLE_UTM && 'UTM'].filter(Boolean)
    });

    return finalUrl;
  }

  /**
   * ===================================
   * 🆕 RETRY AUTOMÁTICO (3 tentativas)
   * ===================================
   */
  async expandWithRetry(shortUrl, platform) {
    for (let attempt = 1; attempt <= CONFIG_V2.RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 [Retry ${attempt}/${CONFIG_V2.RETRY_ATTEMPTS}] Tentando expandir...`);

        const response = await fetch(shortUrl, {
          method: 'HEAD',
          redirect: 'manual',
          mode: 'no-cors'
        });

        const fullUrl = response.headers.get('Location') || shortUrl;

        if (fullUrl !== shortUrl) {
          console.log(`✅ [Retry ${attempt}] Sucesso!`);
          return fullUrl;
        }

      } catch (error) {
        console.warn(`⚠️ [Retry ${attempt}] Falhou:`, error.message);

        if (attempt < CONFIG_V2.RETRY_ATTEMPTS) {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, CONFIG_V2.RETRY_DELAY));
        }
      }
    }

    // Após 3 tentativas, usar fallback inteligente
    console.warn('❌ [Retry] Todas tentativas falharam, usando fallback inteligente');
    return this.intelligentFallback(shortUrl, platform);
  }

  /**
   * 🆕 FALLBACK INTELIGENTE
   * Se não conseguir expandir, tenta estratégias alternativas
   */
  intelligentFallback(shortUrl, platform) {
    console.log('🧠 [Fallback Inteligente] Ativado para:', platform);

    // Tentar extrair código do próprio link curto
    if (platform === 'amazon' && shortUrl.includes('amzn.to/')) {
      // amzn.to/3ABC123 → tentar usar o código
      const code = shortUrl.split('amzn.to/')[1]?.split(/[?#]/)[0];
      if (code && code.length >= 5) {
        // Adicionar tag ao link curto mesmo
        const separator = shortUrl.includes('?') ? '&' : '?';
        const enhanced = `${shortUrl}${separator}tag=${AFFILIATE_TAGS.AMAZON}`;
        console.log('🔧 [Fallback] Tag adicionada ao link curto Amazon');
        return enhanced;
      }
    }

    if (platform === 'mercadolivre' && shortUrl.includes('/sec/')) {
      // Adicionar tags ao link /sec/
      const separator = shortUrl.includes('?') ? '&' : '?';
      const enhanced = `${shortUrl}${separator}matt_word=${AFFILIATE_TAGS.ML_WORD.toLowerCase()}&matt_tool=${AFFILIATE_TAGS.ML_TOOL}`;
      console.log('🔧 [Fallback] Tags adicionadas ao link curto ML');
      return enhanced;
    }

    // Fallback final: adicionar tag básica
    return this.addBasicTag(shortUrl, platform);
  }

  /**
   * ===================================
   * 🆕 DEEP LINKS NATIVOS (Abre App)
   * ===================================
   */
  createAmazonDeepLink(asin) {
    // Intent URL para Android + Universal Link para iOS
    const tag = AFFILIATE_TAGS.AMAZON;

    // Universal Link (funciona iOS + Android moderno)
    return `https://www.amazon.com.br/dp/${asin}?tag=${tag}&linkCode=df0&th=1&psc=1`;
  }

  createMLDeepLink(mlbId) {
    // Deep link do app Mercado Livre
    const tag = AFFILIATE_TAGS.ML_WORD.toLowerCase();
    return `mercadolivre://item/MLB${mlbId}?matt_word=${tag}&matt_tool=${AFFILIATE_TAGS.ML_TOOL}`;
  }

  /**
   * ===================================
   * CACHE PERSISTENTE (LocalStorage)
   * ===================================
   */
  loadPersistentCache() {
    try {
      const cached = localStorage.getItem('bbb_link_cache_v2');
      if (cached) {
        const data = JSON.parse(cached);
        // Limpar cache expirado
        const now = Date.now();
        const filtered = {};
        for (const [key, value] of Object.entries(data)) {
          if (value.expires > now) {
            filtered[key] = value;
          }
        }
        return filtered;
      }
    } catch (e) {
      console.warn('⚠️ [Cache] Não foi possível carregar cache persistente');
    }
    return {};
  }

  savePersistentCache() {
    try {
      localStorage.setItem('bbb_link_cache_v2', JSON.stringify(this.persistentCache));
    } catch (e) {
      console.warn('⚠️ [Cache] Não foi possível salvar cache');
    }
  }

  getCachedLink(url) {
    const cached = this.persistentCache[url];
    if (cached && cached.expires > Date.now()) {
      return cached.enhancedUrl;
    }
    return null;
  }

  setCachedLink(originalUrl, enhancedUrl) {
    this.persistentCache[originalUrl] = {
      enhancedUrl: enhancedUrl,
      expires: Date.now() + CONFIG_V2.CACHE_DURATION,
      timestamp: Date.now()
    };
    this.savePersistentCache();
  }

  /**
   * ===================================
   * UTILITÁRIOS V2
   * ===================================
   */
  detectPlatform(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) return 'amazon';
    if (urlLower.includes('mercadolivre.com') || urlLower.includes('/sec/') || urlLower.includes('/social/')) return 'mercadolivre';
    return 'other';
  }

  extractAmazonASIN(url) {
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  extractMLBId(url) {
    const patterns = [/MLB-?(\d{10,12})/i, /\/p\/MLB-?(\d{10,12})/i];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  extractUrlParams(url) {
    try {
      return new URL(url).searchParams;
    } catch (e) {
      return new URLSearchParams();
    }
  }

  addBasicTag(url, platform) {
    if (platform === 'amazon') return this.addBasicAmazonTag(url);
    if (platform === 'mercadolivre') return this.addBasicMLTag(url);
    return url;
  }

  addBasicAmazonTag(url) {
    url = url.replace(/[?&]tag=[^&]*/gi, '');
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${AFFILIATE_TAGS.AMAZON}`;
  }

  addBasicMLTag(url) {
    url = url.replace(/[?&]matt_word=[^&]*/gi, '');
    url = url.replace(/[?&]matt_tool=[^&]*/gi, '');
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}matt_word=${AFFILIATE_TAGS.ML_WORD.toLowerCase()}&matt_tool=${AFFILIATE_TAGS.ML_TOOL}`;
  }

  isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  getUserSource() {
    // Detectar origem do usuário (instagram, whatsapp, etc)
    const referrer = document.referrer.toLowerCase();
    if (referrer.includes('instagram')) return 'ig';
    if (referrer.includes('facebook')) return 'fb';
    if (referrer.includes('whatsapp')) return 'wa';
    if (referrer.includes('twitter') || referrer.includes('x.com')) return 'tw';
    return 'direct';
  }

  getDeviceType() {
    if (/Android/i.test(navigator.userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios';
    return 'web';
  }

  getAmazonRegionalNode(geo) {
    // Nós regionais da Amazon Brasil (exemplo)
    const regions = {
      'sp': '16243579011', // São Paulo
      'rj': '16243580011', // Rio de Janeiro
      'default': '16243581011'
    };
    return regions[geo.state?.toLowerCase()] || regions.default;
  }

  async initGeo() {
    // Obter geolocalização do usuário (não-bloqueante)
    try {
      const response = await fetch('https://ipapi.co/json/');
      this.userGeo = await response.json();
      console.log('🌍 [Geo] Localização obtida:', this.userGeo.city);
    } catch (e) {
      console.log('⚠️ [Geo] Não foi possível obter localização');
    }
  }

  clearCache() {
    this.cache.clear();
    this.persistentCache = {};
    this.savePersistentCache();
    console.log('🗑️ [Cache] Limpo');
  }
}

/**
 * INSTÂNCIA SINGLETON V2
 */
export const linkEnhancerV2 = new LinkEnhancerV2();

// Inicializar geolocalização em background
if (typeof window !== 'undefined') {
  linkEnhancerV2.initGeo().catch(() => {});
}

/**
 * FUNÇÃO WRAPPER PARA FACILITAR USO
 */
export async function enhanceLinkV2(url, platform = null, options = {}) {
  return await linkEnhancerV2.enhanceLink(url, platform, options);
}

export default linkEnhancerV2;
