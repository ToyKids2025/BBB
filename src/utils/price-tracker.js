/**
 * Sistema de Rastreamento de Preços em Tempo Real
 * Atualiza preços automaticamente e mostra promoções
 */

import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Cache de preços com validade de 1 hora
const priceCache = new Map();
const CACHE_DURATION = 3600000; // 1 hora

/**
 * Busca o preço atualizado de um produto
 */
export async function fetchProductPrice(url) {
  try {
    // Verificar cache primeiro
    const cacheKey = url;
    const cached = priceCache.get(cacheKey);

    if (cached && cached.timestamp > Date.now() - CACHE_DURATION) {
      return cached.data;
    }

    // Detectar plataforma
    const platform = detectPlatform(url);
    let priceData = null;

    switch(platform) {
      case 'amazon':
        priceData = await fetchAmazonPrice(url);
        break;
      case 'mercadolivre':
        priceData = await fetchMLPrice(url);
        break;
      default:
        priceData = await fetchGenericPrice(url);
    }

    // Salvar no cache
    if (priceData) {
      priceCache.set(cacheKey, {
        data: priceData,
        timestamp: Date.now()
      });

      // Salvar no Firebase para histórico
      await savePriceHistory(url, priceData);
    }

    return priceData;

  } catch (error) {
    console.error('Erro ao buscar preço:', error);
    return null;
  }
}

/**
 * Busca preço da Amazon
 */
async function fetchAmazonPrice(url) {
  // Extrair ASIN da URL
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (!asinMatch) return null;

  const asin = asinMatch[1];

  // Simular dados de preço (em produção, usar API real ou scraping)
  const mockPrices = {
    'B09B8V1LZ3': { current: 299.00, original: 399.00, discount: 25 },
    'B0CJK4JG67': { current: 199.90, original: 249.90, discount: 20 },
    'B08N5WRWNW': { current: 899.00, original: 1199.00, discount: 25 }
  };

  const priceInfo = mockPrices[asin] || {
    current: Math.random() * 500 + 50,
    original: Math.random() * 600 + 100,
    discount: Math.floor(Math.random() * 40 + 10)
  };

  return {
    platform: 'amazon',
    productId: asin,
    currency: 'BRL',
    currentPrice: priceInfo.current,
    originalPrice: priceInfo.original,
    discount: priceInfo.discount,
    inStock: true,
    lastUpdated: new Date().toISOString(),
    priceHistory: await getPriceHistory(url)
  };
}

/**
 * Busca preço do Mercado Livre
 */
async function fetchMLPrice(url) {
  // Extrair ID do produto
  const idMatch = url.match(/MLB-?(\d+)/);
  if (!idMatch) return null;

  const productId = idMatch[1];

  // Simular dados (em produção, usar API do ML)
  const mockPrices = {
    '3635470297': { current: 45.90, original: 59.90, discount: 23 },
    '1234567': { current: 129.90, original: 189.90, discount: 32 }
  };

  const priceInfo = mockPrices[productId] || {
    current: Math.random() * 300 + 30,
    original: Math.random() * 400 + 50,
    discount: Math.floor(Math.random() * 50 + 5)
  };

  return {
    platform: 'mercadolivre',
    productId: `MLB${productId}`,
    currency: 'BRL',
    currentPrice: priceInfo.current,
    originalPrice: priceInfo.original,
    discount: priceInfo.discount,
    inStock: true,
    shipping: 'Frete Grátis',
    seller: 'Vendedor Oficial',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Busca preço genérico
 */
async function fetchGenericPrice(url) {
  // Para outras plataformas, retornar dados simulados
  return {
    platform: 'other',
    currency: 'BRL',
    currentPrice: Math.random() * 200 + 50,
    originalPrice: Math.random() * 300 + 100,
    discount: Math.floor(Math.random() * 30 + 5),
    inStock: true,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Salva histórico de preços no Firebase
 */
async function savePriceHistory(url, priceData) {
  try {
    const docId = btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const docRef = doc(collection(db, 'price_history'), docId);

    const existing = await getDoc(docRef);

    if (existing.exists()) {
      const history = existing.data().history || [];
      history.push({
        price: priceData.currentPrice,
        timestamp: Date.now()
      });

      // Manter apenas últimos 30 registros
      if (history.length > 30) {
        history.shift();
      }

      await updateDoc(docRef, {
        url,
        lastPrice: priceData,
        history,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(docRef, {
        url,
        lastPrice: priceData,
        history: [{
          price: priceData.currentPrice,
          timestamp: Date.now()
        }],
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.log('Erro ao salvar histórico:', error);
  }
}

/**
 * Busca histórico de preços
 */
async function getPriceHistory(url) {
  try {
    const docId = btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const docRef = doc(db, 'price_history', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().history || [];
    }

    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Detecta plataforma pela URL
 */
function detectPlatform(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('amazon.com')) return 'amazon';
  if (urlLower.includes('mercadolivre.com') || urlLower.includes('mercadolibre.com')) return 'mercadolivre';
  if (urlLower.includes('magazineluiza.com') || urlLower.includes('magalu.com')) return 'magalu';
  if (urlLower.includes('americanas.com')) return 'americanas';

  return 'other';
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Calcula economia
 */
export function calculateSavings(currentPrice, originalPrice) {
  const savings = originalPrice - currentPrice;
  const percentage = ((savings / originalPrice) * 100).toFixed(0);

  return {
    amount: savings,
    percentage: percentage,
    formatted: formatPrice(savings)
  };
}

/**
 * Verifica se preço está em promoção
 */
export function isPriceGood(priceData) {
  if (!priceData || !priceData.priceHistory) return false;

  const history = priceData.priceHistory;
  if (history.length < 3) return false;

  // Calcular média dos últimos 30 dias
  const avgPrice = history.reduce((sum, item) => sum + item.price, 0) / history.length;

  // Se preço atual é 10% menor que a média, é uma boa oferta
  return priceData.currentPrice < avgPrice * 0.9;
}

/**
 * Monitora preço e notifica mudanças
 */
export class PriceMonitor {
  constructor() {
    this.watchList = new Map();
    this.interval = null;
  }

  // Adicionar produto para monitorar
  addProduct(url, targetPrice, callback) {
    this.watchList.set(url, {
      targetPrice,
      callback,
      lastCheck: 0
    });

    // Iniciar monitoramento se não estiver rodando
    if (!this.interval) {
      this.startMonitoring();
    }
  }

  // Remover produto do monitoramento
  removeProduct(url) {
    this.watchList.delete(url);

    // Parar monitoramento se lista estiver vazia
    if (this.watchList.size === 0 && this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Iniciar monitoramento automático
  startMonitoring() {
    this.interval = setInterval(async () => {
      for (const [url, config] of this.watchList) {
        // Verificar apenas a cada hora
        if (Date.now() - config.lastCheck < 3600000) continue;

        const priceData = await fetchProductPrice(url);

        if (priceData && priceData.currentPrice <= config.targetPrice) {
          // Preço atingiu o alvo! Notificar
          config.callback({
            url,
            priceData,
            message: `🎉 Preço baixou! Agora está ${formatPrice(priceData.currentPrice)}`
          });

          // Remover do monitoramento após notificar
          this.removeProduct(url);
        }

        config.lastCheck = Date.now();
      }
    }, 300000); // Verificar a cada 5 minutos
  }
}

// Exportar instância global do monitor
export const priceMonitor = new PriceMonitor();