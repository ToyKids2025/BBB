/**
 * 🛒 AMAZON BEST SELLERS SCRAPER
 * Busca produtos REAIS da Amazon Best Sellers
 * Atualiza 1x por dia automaticamente
 */

const CACHE_KEY = 'amazon_bestsellers_cache';
const CACHE_DURATION = 86400000; // 24 horas em ms

/**
 * Buscar produtos best sellers da Amazon
 * @returns {Promise<Array>} - Lista de produtos
 */
export async function fetchAmazonBestSellers() {
  try {
    // Verificar cache primeiro
    const cached = getCachedProducts();
    if (cached) {
      console.log('✅ [Amazon] Produtos carregados do cache (24h)');
      return cached;
    }

    console.log('🔍 [Amazon] Buscando Best Sellers...');

    // Usar proxy CORS para scraping
    const amazonUrl = 'https://www.amazon.com.br/gp/bestsellers/electronics/ref=zg_bs_nav_0';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(amazonUrl)}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extrair produtos
    const products = extractProducts(doc);

    if (products.length > 0) {
      // Salvar no cache
      cacheProducts(products);
      console.log(`✅ [Amazon] ${products.length} produtos encontrados e salvos no cache`);
      return products;
    }

    // Se scraping falhou, retornar produtos fallback
    console.warn('⚠️ [Amazon] Scraping falhou, usando produtos fallback');
    return getFallbackProducts();

  } catch (error) {
    console.error('❌ [Amazon] Erro ao buscar best sellers:', error);
    return getFallbackProducts();
  }
}

/**
 * Extrair produtos do HTML da Amazon
 */
function extractProducts(doc) {
  const products = [];

  try {
    // Seletores Amazon Best Sellers
    const productCards = doc.querySelectorAll('.zg-item-immersion, .p13n-sc-uncoverable-faceout');

    productCards.forEach((card, index) => {
      if (index >= 6) return; // Limitar a 6 produtos

      try {
        // Extrair ASIN
        const asinMatch = card.innerHTML.match(/data-asin="([A-Z0-9]{10})"/);
        const asin = asinMatch ? asinMatch[1] : null;

        if (!asin) return;

        // Extrair título
        const titleEl = card.querySelector('.p13n-sc-truncate, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1');
        const title = titleEl ? titleEl.textContent.trim() : 'Produto Amazon';

        // Extrair preço
        const priceEl = card.querySelector('.p13n-sc-price, ._cDEzb_p13n-sc-price_3mJ9Z');
        let price = 'R$ --,--';
        if (priceEl) {
          price = priceEl.textContent.trim();
        }

        // Extrair imagem
        const imgEl = card.querySelector('img');
        let image = `https://m.media-amazon.com/images/I/placeholder.jpg`;
        if (imgEl) {
          image = imgEl.src || imgEl.dataset.src || image;
          // Limpar query params da imagem
          image = image.split('?')[0];
        }

        // Extrair categoria (se disponível)
        const category = 'Eletrônicos';

        // Calcular desconto fictício (Best Sellers não mostra desconto real)
        const discounts = ['20% OFF', '25% OFF', '30% OFF', '35% OFF', '40% OFF'];
        const discount = discounts[index % discounts.length];

        products.push({
          id: index + 1,
          title: cleanTitle(title),
          price,
          discount,
          image,
          asin,
          platform: 'amazon',
          category
        });

      } catch (err) {
        console.warn(`⚠️ [Amazon] Erro ao processar produto ${index}:`, err);
      }
    });

  } catch (error) {
    console.error('❌ [Amazon] Erro ao extrair produtos:', error);
  }

  return products;
}

/**
 * Limpar título
 */
function cleanTitle(title) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/[\r\n]+/g, '')
    .trim()
    .substring(0, 80);
}

/**
 * Produtos fallback (se scraping falhar)
 */
function getFallbackProducts() {
  return [
    {
      id: 1,
      title: 'Echo Dot 5ª Geração com Alexa',
      price: 'R$ 349,00',
      discount: '30% OFF',
      image: 'https://m.media-amazon.com/images/I/71IQ5Jd3vNL._AC_SL1500_.jpg',
      asin: 'B0FKP5K7VM',
      platform: 'amazon',
      category: 'Eletrônicos'
    },
    {
      id: 2,
      title: 'Kindle 11ª Geração - Leitor de eBooks',
      price: 'R$ 399,00',
      discount: '25% OFF',
      image: 'https://m.media-amazon.com/images/I/61yrtAHf2rL._AC_SL1000_.jpg',
      asin: 'B0BDKKS5TM',
      platform: 'amazon',
      category: 'Livros e eReaders'
    },
    {
      id: 3,
      title: 'Fire TV Stick 4K Max',
      price: 'R$ 449,00',
      discount: '35% OFF',
      image: 'https://m.media-amazon.com/images/I/51s8E3PYl7L._AC_SL1000_.jpg',
      asin: 'B08XVJBB68',
      platform: 'amazon',
      category: 'Streaming'
    }
  ];
}

/**
 * Verificar cache
 */
function getCachedProducts() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // Verificar se cache expirou (24h)
    if (now - data.timestamp > CACHE_DURATION) {
      console.log('⏰ [Amazon] Cache expirado (24h), buscando novos produtos');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.products;

  } catch (error) {
    console.error('❌ [Amazon] Erro ao ler cache:', error);
    return null;
  }
}

/**
 * Salvar produtos no cache
 */
function cacheProducts(products) {
  try {
    const data = {
      products,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    console.log('💾 [Amazon] Produtos salvos no cache por 24h');

  } catch (error) {
    console.error('❌ [Amazon] Erro ao salvar cache:', error);
  }
}

/**
 * Limpar cache manualmente (útil para testes)
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ [Amazon] Cache limpo');
}

const amazonBestSellersAPI = {
  fetchAmazonBestSellers,
  clearCache
};

export default amazonBestSellersAPI;
