/**
 * 🔥 LINK ENHANCER - SISTEMA DEFINITIVO DE UPGRADE DE LINKS
 * Expande links curtos, adiciona parâmetros modernos, garante 100% de comissão
 *
 * FUNCIONALIDADES:
 * 1. Expande amzn.to → amazon.com.br/dp/ASIN
 * 2. Converte /sec/ do ML → link completo com tag
 * 3. Adiciona Amazon OneLink (ascsubtag, ref_)
 * 4. Adiciona parâmetros de tracking avançado
 * 5. Remove tags de terceiros
 */

// Tags oficiais
const AFFILIATE_TAGS = {
  AMAZON: 'buscabusca0f-20',
  ML_WORD: 'wa20250726131129',
  ML_TOOL: '88344921'
};

/**
 * CLASSE PRINCIPAL - LINK ENHANCER
 */
export class LinkEnhancer {
  constructor() {
    this.cache = new Map(); // Cache de links expandidos
  }

  /**
   * MÉTODO PRINCIPAL - PROCESSAR QUALQUER LINK
   * @param {string} url - URL para processar
   * @param {string} platform - amazon | mercadolivre | other
   * @returns {Promise<string>} - URL processada e upgradada
   */
  async enhanceLink(url, platform = null) {
    if (!url) return url;

    // Auto-detectar platform (sempre, mesmo se vier "other")
    const detectedPlatform = this.detectPlatform(url);

    // Se platform vier como "other" ou não fornecida, usar o detectado
    if (!platform || platform === 'other') {
      platform = detectedPlatform;
    }

    console.log('🔧 [Link Enhancer] Processando:', { url: url.substring(0, 50), platform, detected: detectedPlatform });

    try {
      let enhancedUrl = url;

      switch (platform) {
        case 'amazon':
          enhancedUrl = await this.enhanceAmazonLink(url);
          break;
        case 'mercadolivre':
          enhancedUrl = await this.enhanceMercadoLivreLink(url);
          break;
        default:
          // Outras plataformas - retornar sem modificar
          enhancedUrl = url;
      }

      console.log('✅ [Link Enhancer] Processado:', {
        original: url.substring(0, 50),
        enhanced: enhancedUrl.substring(0, 50)
      });

      return enhancedUrl;

    } catch (error) {
      console.error('❌ [Link Enhancer] Erro ao processar:', error);
      // Em caso de erro, retornar URL original com tag básica
      return this.addBasicTag(url, platform);
    }
  }

  /**
   * DETECTAR PLATAFORMA
   */
  detectPlatform(url) {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) {
      return 'amazon';
    }

    if (urlLower.includes('mercadolivre.com') ||
        urlLower.includes('mercadolibre.com') ||
        urlLower.includes('/sec/') ||
        urlLower.includes('/social/')) {
      return 'mercadolivre';
    }

    return 'other';
  }

  /**
   * ===================================
   * AMAZON LINK ENHANCEMENT
   * ===================================
   */
  async enhanceAmazonLink(url) {
    // 1. Expandir amzn.to se necessário
    if (url.includes('amzn.to')) {
      console.log('🔗 [Amazon] Expandindo link curto amzn.to...');
      url = await this.expandAmazonShortLink(url);
    }

    // 2. Extrair ASIN
    const asin = this.extractAmazonASIN(url);
    if (!asin) {
      console.warn('⚠️ [Amazon] ASIN não encontrado, usando URL original');
      return this.addBasicAmazonTag(url);
    }

    console.log('📦 [Amazon] ASIN extraído:', asin);

    // 3. Construir URL moderna com Amazon OneLink
    const enhancedUrl = this.buildModernAmazonUrl(asin, url);

    return enhancedUrl;
  }

  /**
   * EXPANDIR LINK CURTO AMAZON (amzn.to)
   */
  async expandAmazonShortLink(shortUrl) {
    // Verificar cache primeiro
    if (this.cache.has(shortUrl)) {
      console.log('💾 [Cache] Link encontrado no cache');
      return this.cache.get(shortUrl);
    }

    try {
      console.log('🌐 [Amazon] Expandindo via unshorten.me API...');

      // Usar API pública de unshorten (suporta CORS)
      const apiUrl = `https://unshorten.me/json/${encodeURIComponent(shortUrl)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('API unshorten falhou');
      }

      const data = await response.json();

      // A API retorna { success: true, resolved_url: "full_url" }
      if (data.success && data.resolved_url) {
        const fullUrl = data.resolved_url;

        // Salvar no cache
        this.cache.set(shortUrl, fullUrl);

        console.log('✅ [Amazon] Link expandido:', fullUrl.substring(0, 80));
        return fullUrl;
      }

      throw new Error('API não retornou URL válida');

    } catch (error) {
      console.warn('⚠️ [Amazon] Não foi possível expandir via API, usando fallback');

      // FALLBACK: Adicionar tag ao link curto mesmo
      // O redirect do amzn.to vai preservar nossa tag
      return this.addBasicAmazonTag(shortUrl);
    }
  }

  /**
   * EXTRAIR ASIN DA URL AMAZON
   */
  extractAmazonASIN(url) {
    // Padrões comuns de ASIN na Amazon
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /[?&]asin=([A-Z0-9]{10})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * CONSTRUIR URL MODERNA AMAZON COM ONELINK
   */
  buildModernAmazonUrl(asin, originalUrl) {
    // URL base limpa
    const baseUrl = `https://www.amazon.com.br/dp/${asin}`;

    // Parâmetros modernos da Amazon
    const params = new URLSearchParams();

    // 1. Tag de afiliado (OBRIGATÓRIO)
    params.set('tag', AFFILIATE_TAGS.AMAZON);

    // 2. Amazon OneLink - ascsubtag (tracking avançado)
    // Formato: source_campaign_medium_timestamp
    const ascsubtag = `bbb_${Date.now()}_web`;
    params.set('ascsubtag', ascsubtag);

    // 3. ref_ (tracking de origem)
    params.set('ref_', 'bbb_link');

    // 4. psc=1 (preservar seleção - importante para variações)
    params.set('psc', '1');

    // 5. th=1 (mostrar todas as variações)
    params.set('th', '1');

    // 6. Verificar se tem variação (color, size, etc) na URL original
    const originalParams = this.extractUrlParams(originalUrl);
    if (originalParams.has('th')) params.set('th', originalParams.get('th'));
    if (originalParams.has('psc')) params.set('psc', originalParams.get('psc'));

    // Construir URL final
    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log('🚀 [Amazon] URL moderna construída:', {
      asin,
      tag: AFFILIATE_TAGS.AMAZON,
      ascsubtag
    });

    return finalUrl;
  }

  /**
   * ADICIONAR TAG BÁSICA AMAZON (FALLBACK)
   */
  addBasicAmazonTag(url) {
    // Remover tag existente se houver
    url = url.replace(/[?&]tag=[^&]*/gi, '');

    // Adicionar nossa tag
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tag=${AFFILIATE_TAGS.AMAZON}`;
  }

  /**
   * ===================================
   * MERCADO LIVRE LINK ENHANCEMENT
   * ===================================
   */
  async enhanceMercadoLivreLink(url) {
    // 1. Verificar se é link /sec/ ou /social/
    if (url.includes('/sec/') || url.includes('/social/')) {
      console.log('🔗 [ML] Link curto detectado (/sec/ ou /social/)');
      url = await this.expandMercadoLivreShortLink(url);
    }

    // 2. Extrair MLB ID
    const mlbId = this.extractMLBId(url);
    if (!mlbId) {
      console.warn('⚠️ [ML] MLB ID não encontrado, usando URL original');
      return this.addBasicMLTag(url);
    }

    console.log('📦 [ML] MLB ID extraído:', mlbId);

    // 3. Construir URL com tags
    const enhancedUrl = this.buildModernMLUrl(mlbId, url);

    return enhancedUrl;
  }

  /**
   * EXPANDIR LINK CURTO MERCADO LIVRE (/sec/ ou /social/)
   */
  async expandMercadoLivreShortLink(shortUrl) {
    // Verificar cache
    if (this.cache.has(shortUrl)) {
      return this.cache.get(shortUrl);
    }

    try {
      console.log('🌐 [ML] Expandindo link curto...');

      // Fazer request para obter redirect
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'manual',
        mode: 'no-cors'
      });

      const fullUrl = response.headers.get('Location') || shortUrl;
      this.cache.set(shortUrl, fullUrl);

      console.log('✅ [ML] Link expandido:', fullUrl.substring(0, 80));
      return fullUrl;

    } catch (error) {
      console.warn('⚠️ [ML] Não foi possível expandir, usando fallback');
      return this.addBasicMLTag(shortUrl);
    }
  }

  /**
   * EXTRAIR MLB ID
   */
  extractMLBId(url) {
    // Padrões: MLB-1234567890 ou MLB1234567890
    const patterns = [
      /MLB-?(\d{10,12})/i,
      /\/p\/MLB-?(\d{10,12})/i,
      /produto\/MLB-?(\d{10,12})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * CONSTRUIR URL MODERNA ML COM TAGS
   */
  buildModernMLUrl(mlbId, originalUrl) {
    // Determinar domínio (.br ou .com)
    const domain = originalUrl.includes('.com.br') ?
      'mercadolivre.com.br' : 'mercadolibre.com';

    // URL base
    const baseUrl = `https://www.${domain}/MLB-${mlbId}`;

    // Parâmetros ML
    const params = new URLSearchParams();

    // 1. matt_word (OBRIGATÓRIO - minúsculo!)
    params.set('matt_word', AFFILIATE_TAGS.ML_WORD.toLowerCase());

    // 2. matt_tool (OBRIGATÓRIO)
    params.set('matt_tool', AFFILIATE_TAGS.ML_TOOL);

    // 3. Preservar quantity, variations, etc da URL original
    const originalParams = this.extractUrlParams(originalUrl);
    if (originalParams.has('quantity')) {
      params.set('quantity', originalParams.get('quantity'));
    }

    // Construir URL final
    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log('🚀 [ML] URL moderna construída:', {
      mlbId,
      matt_word: AFFILIATE_TAGS.ML_WORD.toLowerCase(),
      matt_tool: AFFILIATE_TAGS.ML_TOOL
    });

    return finalUrl;
  }

  /**
   * ADICIONAR TAG BÁSICA ML (FALLBACK)
   */
  addBasicMLTag(url) {
    // Remover tags existentes
    url = url.replace(/[?&]matt_word=[^&]*/gi, '');
    url = url.replace(/[?&]matt_tool=[^&]*/gi, '');

    // Adicionar nossas tags
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}matt_word=${AFFILIATE_TAGS.ML_WORD.toLowerCase()}&matt_tool=${AFFILIATE_TAGS.ML_TOOL}`;
  }

  /**
   * ===================================
   * UTILIDADES
   * ===================================
   */

  /**
   * EXTRAIR PARÂMETROS DA URL
   */
  extractUrlParams(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams;
    } catch (error) {
      return new URLSearchParams();
    }
  }

  /**
   * ADICIONAR TAG BÁSICA (FALLBACK GENÉRICO)
   */
  addBasicTag(url, platform) {
    switch (platform) {
      case 'amazon':
        return this.addBasicAmazonTag(url);
      case 'mercadolivre':
        return this.addBasicMLTag(url);
      default:
        return url;
    }
  }

  /**
   * LIMPAR CACHE (útil para testes)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ [Link Enhancer] Cache limpo');
  }
}

/**
 * INSTÂNCIA SINGLETON
 */
export const linkEnhancer = new LinkEnhancer();

/**
 * FUNÇÃO WRAPPER PARA FACILITAR USO
 */
export async function enhanceLink(url, platform = null) {
  return await linkEnhancer.enhanceLink(url, platform);
}

export default linkEnhancer;
