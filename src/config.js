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
  const urlLower = url.toLowerCase();

  if (urlLower.includes('amazon.com')) return 'amazon';
  if (urlLower.includes('mercadolivre.com') ||
      urlLower.includes('mercadolibre.com') ||
      urlLower.includes('mercadolivre.com.br') ||
      urlLower.includes('/sec/')) return 'mercadolivre';
  if (urlLower.includes('magazineluiza.com') || urlLower.includes('magalu.com')) return 'magalu';
  if (urlLower.includes('americanas.com')) return 'americanas';
  if (urlLower.includes('casasbahia.com')) return 'casasbahia';
  if (urlLower.includes('shopee.com')) return 'shopee';
  if (urlLower.includes('aliexpress.com')) return 'aliexpress';
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

// FUNÇÃO PARA CRIAR LINK COM TAG DE AFILIADO
export async function createShortlink(destinationUrl) {
  const platform = detectPlatform(destinationUrl);
  const urlWithTag = addAffiliateTag(destinationUrl, platform);

  try {
    // Gerar ID único para o link
    const linkId = Math.random().toString(36).substring(2, 8);

    // RETORNAR O LINK DIRETO COM A TAG DE AFILIADO
    // Não criar shortlink interno, usar o link direto com a tag

    // Salvar no localStorage para histórico
    const links = JSON.parse(localStorage.getItem('bbb_links') || '[]');
    links.push({
      key: linkId,
      short_url: urlWithTag, // Link direto com tag de afiliado
      dest: urlWithTag,
      original_url: destinationUrl, // URL original sem tag
      platform: platform,
      created: new Date().toISOString(),
      clicks: 0
    });
    localStorage.setItem('bbb_links', JSON.stringify(links));

    return {
      success: true,
      shortUrl: urlWithTag, // Retornar o link direto com a tag
      key: linkId
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