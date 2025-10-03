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
    // Estratégia 1: Scraping via CORS proxy (MÚLTIPLAS TENTATIVAS)
    const scrapedTitle = await scrapeProductTitle(url, platform);
    if (scrapedTitle && scrapedTitle !== 'Produto' && scrapedTitle.length > 5) {
      console.log('✅ [Product Scraper] Título encontrado via scraping:', scrapedTitle);
      return scrapedTitle;
    }

    // Estratégia 2: Extrair da URL
    console.warn('⚠️ [Product Scraper] Scraping retornou vazio ou inválido, extraindo da URL...');
    const urlTitle = extractTitleFromUrl(url, platform);
    console.log('✅ [Product Scraper] Título extraído da URL:', urlTitle);
    return urlTitle;

  } catch (error) {
    console.error('❌ [Product Scraper] Erro crítico:', error);

    // Estratégia 3: Fallback genérico
    return extractTitleFromUrl(url, platform);
  }
}

/**
 * Scraping do título via CORS proxy
 * Tenta múltiplas APIs de proxy em cascata
 */
async function scrapeProductTitle(url, platform) {
  // ⚡ SOLUÇÃO SIMPLIFICADA: Usar apenas extração da URL
  // Proxies CORS públicos são instáveis, lentos e causam problemas
  console.log('⚡ [Scraper] Modo rápido: extraindo título da URL diretamente');
  return null; // Retorna null para forçar uso do fallback (extractTitleFromUrl)
}

/**
 * Extrair título inteligente da URL (fallback)
 * Última linha de defesa quando scraping falha
 */
function extractTitleFromUrl(url, platform) {
  try {
    console.log('🔍 [Fallback] Extraindo título da URL:', url.substring(0, 80));

    // Amazon: /dp/ASIN ou /product-name/dp/ASIN
    if (platform === 'amazon') {
      // Padrão completo: amazon.com.br/Echo-Dot-5-Alexa/dp/B0FKP5K7VM
      const dpMatch = url.match(/\/([^/]+)\/dp\/([A-Z0-9]{10})/);
      if (dpMatch && dpMatch[1] && dpMatch[1] !== 'dp') {
        const rawTitle = dpMatch[1];
        const asin = dpMatch[2];

        // Limpar e formatar
        let title = rawTitle
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .replace(/\+/g, ' ')
          .trim();

        // Remover palavras de stopwords comuns
        title = title.replace(/\b(com|de|da|do|para|amazon|br)\b/gi, '').trim();

        // Capitalizar primeira letra de cada palavra
        title = title.split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        console.log(`✅ [Fallback] Título Amazon extraído: "${title}" (ASIN: ${asin})`);
        return title || 'Produto Amazon';
      }

      // Se não encontrou padrão /dp/, tentar extrair do path
      const pathMatch = url.match(/amazon\.com\.br\/([^/?]+)/);
      if (pathMatch && pathMatch[1] && pathMatch[1] !== 's' && pathMatch[1] !== 'dp') {
        const title = pathMatch[1]
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        console.log(`✅ [Fallback] Título Amazon do path: "${title}"`);
        return title || 'Produto Amazon';
      }

      console.warn('⚠️ [Fallback] Não conseguiu extrair título da URL Amazon');
      return 'Produto Amazon';
    }

    // Mercado Livre: /produto-nome-MLB123 ou /produto-nome/p/
    if (platform === 'mercadolivre') {
      // Padrão 1: /produto-exemplo-MLB123456789
      const mlbMatch = url.match(/\/([^/]+)-MLB\d+/);
      if (mlbMatch && mlbMatch[1]) {
        const rawTitle = mlbMatch[1];

        let title = rawTitle
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .trim();

        // Remover stopwords
        title = title.replace(/\b(com|de|da|do|para|ml|mercado|livre)\b/gi, '').trim();

        // Capitalizar
        title = title.split(' ')
          .filter(word => word.length > 0)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        console.log(`✅ [Fallback] Título ML extraído: "${title}"`);
        return title || 'Produto Mercado Livre';
      }

      // Padrão 2: /produto/p/ ou /produto-nome/p/
      const pMatch = url.match(/\/([^/]+)\/p\//);
      if (pMatch && pMatch[1]) {
        const title = pMatch[1]
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        console.log(`✅ [Fallback] Título ML do path: "${title}"`);
        return title || 'Produto Mercado Livre';
      }

      console.warn('⚠️ [Fallback] Não conseguiu extrair título da URL ML');
      return 'Produto Mercado Livre';
    }

    // Outras plataformas - tentar genérico
    console.warn('⚠️ [Fallback] Plataforma desconhecida, retornando genérico');
    return 'Produto';

  } catch (error) {
    console.error('❌ [Fallback] Erro ao extrair da URL:', error);
    return platform === 'amazon' ? 'Produto Amazon' :
           platform === 'mercadolivre' ? 'Produto Mercado Livre' :
           'Produto';
  }
}

/**
 * Limpar e normalizar título
 * DESABILITADO: Função não usada (scraper simplificado)
 */
// eslint-disable-next-line no-unused-vars
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
