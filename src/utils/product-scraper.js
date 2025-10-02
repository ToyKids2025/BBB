/**
 * 🔍 PRODUCT SCRAPER - Sistema de extração automática de títulos
 * Busca o nome do produto automaticamente para melhorar UX
 *
 * ESTRATÉGIAS:
 * 1. Scraping via CORS proxy (principal)
 * 2. Extração inteligente da URL (fallback)
 * 3. Título genérico (último recurso)
 */

/**
 * Buscar título do produto automaticamente
 * @param {string} url - URL do produto
 * @param {string} platform - amazon | mercadolivre | other
 * @returns {Promise<string>} - Título do produto
 */
export async function fetchProductTitle(url, platform) {
  console.log('🔍 [Product Scraper] Buscando título...', { url: url.substring(0, 50), platform });

  try {
    // Estratégia 1: Scraping via CORS proxy
    const scrapedTitle = await scrapeProductTitle(url, platform);
    if (scrapedTitle && scrapedTitle !== 'Produto') {
      console.log('✅ [Product Scraper] Título encontrado via scraping:', scrapedTitle);
      return scrapedTitle;
    }

    // Estratégia 2: Extrair da URL
    console.log('⚠️ [Product Scraper] Scraping falhou, extraindo da URL...');
    const urlTitle = extractTitleFromUrl(url, platform);
    console.log('✅ [Product Scraper] Título extraído da URL:', urlTitle);
    return urlTitle;

  } catch (error) {
    console.error('❌ [Product Scraper] Erro:', error);

    // Estratégia 3: Fallback genérico
    return extractTitleFromUrl(url, platform);
  }
}

/**
 * Scraping do título via CORS proxy
 */
async function scrapeProductTitle(url, platform) {
  try {
    // Usar API pública AllOrigins (suporta CORS)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    // Timeout com fallback para navegadores antigos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const html = data.contents;

      if (!html) {
        throw new Error('HTML vazio retornado');
      }

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let title = null;

      // Amazon - seletores específicos
      if (platform === 'amazon') {
        title =
          doc.querySelector('#productTitle')?.textContent.trim() ||
          doc.querySelector('.product-title-word-break')?.textContent.trim() ||
          doc.querySelector('h1.a-size-large')?.textContent.trim() ||
          doc.querySelector('title')?.textContent.split('|')[0].trim().split(':')[0].trim();
      }

      // Mercado Livre - seletores específicos
      if (platform === 'mercadolivre') {
        title =
          doc.querySelector('h1.ui-pdp-title')?.textContent.trim() ||
          doc.querySelector('.item-title__primary')?.textContent.trim() ||
          doc.querySelector('h1')?.textContent.trim() ||
          doc.querySelector('title')?.textContent.split('|')[0].trim();
      }

      // Outras plataformas - tentar genérico
      if (!title) {
        title =
          doc.querySelector('h1')?.textContent.trim() ||
          doc.querySelector('title')?.textContent.split('|')[0].trim().split('-')[0].trim();
      }

      // Limpar título
      if (title) {
        title = cleanTitle(title);

        // Validar tamanho (não pode ser muito curto ou muito longo)
        if (title.length < 5 || title.length > 200) {
          throw new Error('Título inválido (tamanho)');
        }

        return title;
      }

      return null;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.warn('⚠️ [Product Scraper] Scraping falhou:', error.message);
    return null;
  }
}

/**
 * Extrair título inteligente da URL (fallback)
 */
function extractTitleFromUrl(url, platform) {
  try {
    // Amazon: /dp/ASIN ou /product-name/dp/ASIN
    if (platform === 'amazon') {
      // Padrão: amazon.com.br/Echo-Dot-5-Alexa/dp/B0FKP5K7VM
      const match = url.match(/\/([^/]+)\/dp\//);
      if (match && match[1]) {
        const title = match[1]
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .trim();

        // Capitalizar primeira letra de cada palavra
        return title.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }

      return 'Produto Amazon';
    }

    // Mercado Livre: /produto-nome-MLB123
    if (platform === 'mercadolivre') {
      // Padrão: mercadolivre.com.br/produto-exemplo-MLB123
      const match = url.match(/\/([^/]+)-MLB/);
      if (match && match[1]) {
        const title = match[1]
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .trim();

        return title.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }

      return 'Produto Mercado Livre';
    }

    // Outras plataformas
    return 'Produto';

  } catch (error) {
    console.error('❌ [Product Scraper] Erro ao extrair da URL:', error);
    return platform === 'amazon' ? 'Produto Amazon' :
           platform === 'mercadolivre' ? 'Produto Mercado Livre' :
           'Produto';
  }
}

/**
 * Limpar e normalizar título
 */
function cleanTitle(title) {
  if (!title) return '';

  return title
    // Remover espaços múltiplos
    .replace(/\s+/g, ' ')
    // Remover caracteres especiais no início/fim
    .replace(/^[^\w]+|[^\w]+$/g, '')
    // Remover quebras de linha
    .replace(/[\r\n]+/g, ' ')
    // Trim
    .trim()
    // Limitar tamanho (máximo 150 caracteres)
    .substring(0, 150);
}

/**
 * Função wrapper simplificada
 */
export async function getProductTitle(url, platform) {
  return await fetchProductTitle(url, platform);
}

// Export default nomeado
const productScraperUtils = {
  fetchProductTitle,
  getProductTitle
};

export default productScraperUtils;
