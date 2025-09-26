/**
 * Configuração Central - BBB Link Enhancer
 * SISTEMA DE REDIRECT INTELIGENTE
 * TAGS REAIS DE AFILIADO - ALEXANDRE
 */

// TAGS DE AFILIADO CONFIRMADAS - ALEXANDRE
export const AFFILIATE_TAGS = {
  AMAZON: 'buscabusca0f-20',       // Tag real Amazon
  MERCADOLIVRE: 'wa20250726131129'  // Tag real Mercado Livre
};

// CONFIGURAÇÃO DA API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://bbbrasil.com/api',
  DOMAIN: process.env.REACT_APP_DOMAIN || 'https://bbbrasil.com',
  API_KEY: 'sk_alex_bbb_2025_secure_key'
};

// CONFIGURAÇÃO DO SISTEMA
export const SYSTEM_CONFIG = {
  // Tempo de cookie (30 dias)
  COOKIE_MAX_AGE: 30 * 24 * 60 * 60,

  // Delay da página intermediária (ms)
  INTERMEDIATE_DELAY: 800,

  // Configurações de persistência
  PERSISTENCE: {
    USE_COOKIES: true,
    USE_LOCALSTORAGE: true,
    USE_SESSIONSTORAGE: true,
    USE_INDEXEDDB: true
  },

  // Features ativas
  FEATURES: {
    ADD_TO_CART: true,      // Amazon add-to-cart automático
    DEEP_LINKS: true,        // Deep links para apps
    ANALYTICS: true,         // Tracking de clicks
    RECONCILIATION: true     // Reconciliação de vendas
  }
};

// FUNÇÃO PARA DETECTAR PLATAFORMA
export function detectPlatform(url) {
  if (url.includes('amazon.com')) return 'amazon';
  if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) return 'mercadolivre';
  if (url.includes('magazineluiza.com') || url.includes('magalu.com')) return 'magalu';
  if (url.includes('americanas.com')) return 'americanas';
  if (url.includes('casasbahia.com')) return 'casasbahia';
  if (url.includes('shopee.com')) return 'shopee';
  if (url.includes('aliexpress.com')) return 'aliexpress';
  return 'other';
}

// FUNÇÃO PARA ADICIONAR TAG DE AFILIADO
export function addAffiliateTag(url, platform) {
  // Remove tags existentes
  let cleanUrl = url.split('?')[0];

  switch(platform) {
    case 'amazon':
      return `${cleanUrl}?tag=${AFFILIATE_TAGS.AMAZON}`;

    case 'mercadolivre':
      return `${cleanUrl}?matt_tool=${AFFILIATE_TAGS.MERCADOLIVRE}&matt_word=DEFAULT`;

    default:
      return url;
  }
}

// FUNÇÃO PARA CRIAR SHORTLINK (API)
export async function createShortlink(destinationUrl) {
  const platform = detectPlatform(destinationUrl);
  const urlWithTag = addAffiliateTag(destinationUrl, platform);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/redirects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dest: urlWithTag,
        platform: platform,
        owner: 'ALEXANDRE',
        add_to_cart: platform === 'amazon',
        deep_link: true,
        active: true
      })
    });

    if (!response.ok) throw new Error('Erro criando shortlink');

    const data = await response.json();
    return {
      success: true,
      shortUrl: data.short_url,
      key: data.key
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// EXPORTAR CONFIGURAÇÕES
export default {
  AFFILIATE_TAGS,
  API_CONFIG,
  SYSTEM_CONFIG,
  detectPlatform,
  addAffiliateTag,
  createShortlink
};