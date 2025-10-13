/**
 * 📦 SCRAPER AVANÇADO DE PRODUTOS - INSTAGRAM AUTOMATION
 *
 * Extrai dados completos de produtos para criar posts no Instagram
 * Suporta: Mercado Livre, Amazon, Shopee, Magalu
 *
 * @version 1.0.0
 * @author BuscaBusca Brasil
 */

import axios from 'axios';
import { detectPlatform } from '../../config';

// ⚡ Cache de scraping (5 minutos)
const SCRAPING_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Limpa cache expirado
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of SCRAPING_CACHE.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      SCRAPING_CACHE.delete(key);
    }
  }
}

/**
 * 🎯 FUNÇÃO PRINCIPAL - Extrai dados completos do produto
 *
 * @param {string} url - URL do produto
 * @returns {Promise<Object>} Dados do produto
 *
 * @example
 * const data = await scrapeProductData('https://produto.mercadolivre.com.br/MLB-...');
 * console.log(data.title, data.price, data.images);
 */
export async function scrapeProductData(url) {
  console.log('🔍 [Scraper] Iniciando scraping:', url);

  // Validação
  if (!url || typeof url !== 'string') {
    throw new Error('URL inválida');
  }

  // Limpar cache expirado
  cleanExpiredCache();

  // Verificar cache
  const cached = SCRAPING_CACHE.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ [Scraper] Retornando do cache');
    return cached.data;
  }

  // Detectar plataforma
  const platform = detectPlatform(url);
  console.log('🏷️ [Scraper] Plataforma detectada:', platform);

  let productData;

  try {
    switch (platform) {
      case 'mercadolivre':
        productData = await scrapeMercadoLivre(url);
        break;
      case 'amazon':
        productData = await scrapeAmazon(url);
        break;
      case 'shopee':
        productData = await scrapeShopee(url);
        break;
      case 'magalu':
        productData = await scrapeMagalu(url);
        break;
      default:
        productData = await scrapeGeneric(url);
    }

    // Validar dados extraídos
    if (!productData.title || productData.title.length < 5) {
      throw new Error('Título não encontrado ou muito curto');
    }

    // Adicionar metadados
    productData.platform = platform;
    productData.scrapedAt = new Date().toISOString();
    productData.sourceUrl = url;

    // Salvar no cache
    SCRAPING_CACHE.set(url, {
      data: productData,
      timestamp: Date.now()
    });

    console.log('✅ [Scraper] Dados extraídos com sucesso:', productData.title);
    return productData;

  } catch (error) {
    console.error('❌ [Scraper] Erro ao extrair dados:', error.message);

    // Fallback: Retornar dados básicos
    return {
      title: extractTitleFromUrl(url),
      price: null,
      originalPrice: null,
      discount: null,
      images: [],
      rating: null,
      reviewCount: null,
      platform: platform,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * 🛒 MERCADO LIVRE - Scraper via API oficial
 */
async function scrapeMercadoLivre(url) {
  console.log('🔵 [ML] Extraindo dados do Mercado Livre');

  // Extrair MLB ID
  const mlbMatch = url.match(/MLB-?(\d+)/i);
  if (!mlbMatch) {
    throw new Error('MLB ID não encontrado na URL');
  }

  const mlbId = `MLB${mlbMatch[1]}`;
  console.log('🔵 [ML] MLB ID:', mlbId);

  try {
    // ✅ Usar API oficial do Mercado Livre (pública, sem auth)
    const apiUrl = `https://api.mercadolibre.com/items/${mlbId}`;
    console.log('🔵 [ML] Chamando API:', apiUrl);

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = response.data;

    // Extrair dados
    const title = data.title || 'Produto sem título';
    const price = data.price || null;
    const originalPrice = data.original_price || null;
    const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

    // Extrair todas as imagens
    const images = data.pictures ? data.pictures.map(pic => pic.secure_url || pic.url) : [];

    // Pegar thumbnail como fallback
    if (images.length === 0 && data.thumbnail) {
      images.push(data.thumbnail.replace('-I.jpg', '-O.jpg')); // Versão maior
    }

    // Dados de avaliação
    const rating = data.reviews?.rating_average || null;
    const reviewCount = data.reviews?.total || 0;

    // Categoria
    const category = data.category_id || null;

    // Condição (novo/usado)
    const condition = data.condition === 'new' ? 'Novo' : 'Usado';

    // Vendas
    const soldQuantity = data.sold_quantity || 0;

    console.log('✅ [ML] Dados extraídos:', {
      title: title.substring(0, 50) + '...',
      price,
      images: images.length,
      rating
    });

    return {
      title,
      price,
      originalPrice,
      discount,
      images,
      rating,
      reviewCount,
      category,
      condition,
      soldQuantity,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [ML] Erro na API:', error.message);

    // Fallback: Tentar scraping HTML (menos confiável)
    return await scrapeMercadoLivreHTML(url);
  }
}

/**
 * 🔵 MERCADO LIVRE - Fallback via HTML scraping
 */
async function scrapeMercadoLivreHTML(url) {
  console.log('🔵 [ML] Tentando scraping HTML como fallback');

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Extrair dados usando regex (menos confiável, mas funciona)
    const titleMatch = html.match(/<h1[^>]*class="[^"]*ui-pdp-title[^"]*"[^>]*>([^<]+)<\/h1>/i);
    const priceMatch = html.match(/<span[^>]*class="[^"]*andes-money-amount__fraction[^"]*"[^>]*>([^<]+)<\/span>/i);
    const imageMatch = html.match(/<img[^>]*class="[^"]*ui-pdp-image[^"]*"[^>]*src="([^"]+)"/i);

    const title = titleMatch ? titleMatch[1].trim() : extractTitleFromUrl(url);
    const priceStr = priceMatch ? priceMatch[1].replace(/\./g, '') : null;
    const price = priceStr ? parseFloat(priceStr) : null;
    const images = imageMatch ? [imageMatch[1]] : [];

    console.log('✅ [ML] HTML scraping concluído:', { title: title.substring(0, 50), price });

    return {
      title,
      price,
      originalPrice: null,
      discount: null,
      images,
      rating: null,
      reviewCount: null,
      category: null,
      condition: null,
      soldQuantity: null,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [ML] Erro no scraping HTML:', error.message);
    throw error;
  }
}

/**
 * 📦 AMAZON - Scraper
 */
async function scrapeAmazon(url) {
  console.log('🟠 [Amazon] Extraindo dados da Amazon');

  // Extrair ASIN
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);

  if (!asinMatch) {
    throw new Error('ASIN não encontrado na URL');
  }

  const asin = asinMatch[1];
  console.log('🟠 [Amazon] ASIN:', asin);

  try {
    // Amazon não tem API pública, fazer scraping HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = response.data;

    // Extrair título
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i);
    const title = titleMatch ? titleMatch[1].trim() : extractTitleFromUrl(url);

    // Extrair preço (vários formatos possíveis)
    let price = null;
    const priceMatches = [
      html.match(/<span class="a-price-whole">([^<]+)<\/span>/i),
      html.match(/<span class="a-offscreen">R\$\s*([0-9.,]+)<\/span>/i)
    ];

    for (const match of priceMatches) {
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.');
        price = parseFloat(priceStr);
        if (!isNaN(price)) break;
      }
    }

    // Extrair imagem principal
    const images = [];
    const imageMatch = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i);
    if (imageMatch) {
      images.push(imageMatch[1]);
    }

    // Extrair avaliação
    let rating = null;
    const ratingMatch = html.match(/<span[^>]*class="[^"]*a-icon-alt[^"]*">([0-9,]+) de 5 estrelas<\/span>/i);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1].replace(',', '.'));
    }

    // Extrair número de avaliações
    let reviewCount = null;
    const reviewMatch = html.match(/<span id="acrCustomerReviewText">([0-9.,]+)\s*avaliações/i);
    if (reviewMatch) {
      reviewCount = parseInt(reviewMatch[1].replace(/\./g, ''));
    }

    console.log('✅ [Amazon] Dados extraídos:', {
      title: title.substring(0, 50) + '...',
      price,
      images: images.length,
      rating
    });

    return {
      title,
      price,
      originalPrice: null,
      discount: null,
      images,
      rating,
      reviewCount,
      category: null,
      condition: 'Novo',
      soldQuantity: null,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [Amazon] Erro no scraping:', error.message);
    throw error;
  }
}

/**
 * 🟣 SHOPEE - Scraper
 */
async function scrapeShopee(url) {
  console.log('🟣 [Shopee] Extraindo dados da Shopee');

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Shopee usa renderização client-side, tentar extrair do JSON embarcado
    const jsonMatch = html.match(/<script>window\.__INITIAL_STATE__=({.+?})<\/script>/);

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const item = data.item?.item;

      if (item) {
        const title = item.name || extractTitleFromUrl(url);
        const price = item.price ? item.price / 100000 : null; // Shopee usa centavos * 1000
        const images = item.images ? item.images.map(img => `https://cf.shopee.com.br/file/${img}`) : [];
        const rating = item.item_rating?.rating_star || null;
        const reviewCount = item.item_rating?.rating_count?.[0] || null;

        console.log('✅ [Shopee] Dados extraídos do JSON:', { title: title.substring(0, 50), price });

        return {
          title,
          price,
          originalPrice: null,
          discount: null,
          images,
          rating,
          reviewCount,
          category: null,
          condition: 'Novo',
          soldQuantity: item.sold || null,
          currency: 'BRL'
        };
      }
    }

    // Fallback: Scraping HTML
    const titleMatch = html.match(/<title>([^<|]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : extractTitleFromUrl(url);

    console.log('✅ [Shopee] Fallback HTML:', { title: title.substring(0, 50) });

    return {
      title,
      price: null,
      originalPrice: null,
      discount: null,
      images: [],
      rating: null,
      reviewCount: null,
      category: null,
      condition: null,
      soldQuantity: null,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [Shopee] Erro no scraping:', error.message);
    throw error;
  }
}

/**
 * 🔵 MAGALU - Scraper
 */
async function scrapeMagalu(url) {
  console.log('🔵 [Magalu] Extraindo dados do Magazine Luiza');

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Tentar extrair JSON-LD (estrutura de dados)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">({.+?})<\/script>/s);

    if (jsonLdMatch) {
      const data = JSON.parse(jsonLdMatch[1]);

      if (data['@type'] === 'Product') {
        const title = data.name || extractTitleFromUrl(url);
        const price = data.offers?.price || null;
        const images = data.image ? (Array.isArray(data.image) ? data.image : [data.image]) : [];
        const rating = data.aggregateRating?.ratingValue || null;
        const reviewCount = data.aggregateRating?.reviewCount || null;

        console.log('✅ [Magalu] Dados extraídos do JSON-LD:', { title: title.substring(0, 50), price });

        return {
          title,
          price: price ? parseFloat(price) : null,
          originalPrice: null,
          discount: null,
          images,
          rating: rating ? parseFloat(rating) : null,
          reviewCount: reviewCount ? parseInt(reviewCount) : null,
          category: null,
          condition: 'Novo',
          soldQuantity: null,
          currency: 'BRL'
        };
      }
    }

    // Fallback: HTML scraping
    const titleMatch = html.match(/<h1[^>]*data-testid="heading-product-title"[^>]*>([^<]+)<\/h1>/i);
    const priceMatch = html.match(/<p[^>]*data-testid="price-value"[^>]*>([^<]+)<\/p>/i);

    const title = titleMatch ? titleMatch[1].trim() : extractTitleFromUrl(url);
    const priceStr = priceMatch ? priceMatch[1].replace(/[^0-9,]/g, '') : null;
    const price = priceStr ? parseFloat(priceStr.replace(',', '.')) : null;

    console.log('✅ [Magalu] Fallback HTML:', { title: title.substring(0, 50), price });

    return {
      title,
      price,
      originalPrice: null,
      discount: null,
      images: [],
      rating: null,
      reviewCount: null,
      category: null,
      condition: null,
      soldQuantity: null,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [Magalu] Erro no scraping:', error.message);
    throw error;
  }
}

/**
 * 🌐 GENÉRICO - Scraper para outras plataformas
 */
async function scrapeGeneric(url) {
  console.log('⚪ [Generic] Extraindo dados genéricos');

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Tentar extrair Open Graph (meta tags)
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i);
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i);
    const ogPrice = html.match(/<meta property="product:price:amount" content="([^"]+)"/i);

    const title = ogTitle ? ogTitle[1] : extractTitleFromUrl(url);
    const images = ogImage ? [ogImage[1]] : [];
    const price = ogPrice ? parseFloat(ogPrice[1]) : null;

    console.log('✅ [Generic] Dados extraídos:', { title: title.substring(0, 50), price });

    return {
      title,
      price,
      originalPrice: null,
      discount: null,
      images,
      rating: null,
      reviewCount: null,
      category: null,
      condition: null,
      soldQuantity: null,
      currency: 'BRL'
    };

  } catch (error) {
    console.error('❌ [Generic] Erro no scraping:', error.message);
    throw error;
  }
}

/**
 * 🔧 UTILIDADE - Extrair título aproximado da URL
 */
function extractTitleFromUrl(url) {
  try {
    // Tentar extrair do path
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Pegar último segmento que não seja numérico
    const segments = path.split('/').filter(s => s.length > 5 && !/^\d+$/.test(s));

    if (segments.length > 0) {
      const title = segments[segments.length - 1]
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      return title;
    }

    return 'Produto sem título';
  } catch (e) {
    return 'Produto sem título';
  }
}

/**
 * 🧪 TESTE - Verifica se scraper está funcionando
 */
export async function testScraper() {
  console.log('🧪 [Scraper] Iniciando testes...');

  const testUrls = [
    'https://produto.mercadolivre.com.br/MLB-1234567890-teste',
    'https://www.amazon.com.br/dp/B08N5WRWNW'
  ];

  for (const url of testUrls) {
    try {
      console.log(`\n🧪 Testando: ${url}`);
      const data = await scrapeProductData(url);
      console.log('✅ Resultado:', data);
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }

  console.log('\n🧪 [Scraper] Testes concluídos!');
}

/**
 * 🧹 UTILIDADE - Limpar cache manualmente
 */
export function clearScrapingCache() {
  const size = SCRAPING_CACHE.size;
  SCRAPING_CACHE.clear();
  console.log(`🧹 [Scraper] Cache limpo (${size} itens removidos)`);
}

/**
 * 📊 UTILIDADE - Estatísticas do cache
 */
export function getScrapingCacheStats() {
  return {
    size: SCRAPING_CACHE.size,
    entries: Array.from(SCRAPING_CACHE.keys())
  };
}

// Exportar funções principais
export default {
  scrapeProductData,
  testScraper,
  clearScrapingCache,
  getScrapingCacheStats
};
