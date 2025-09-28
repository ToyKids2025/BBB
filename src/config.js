/**
 * Configuração Central - BBB Link Enhancer
 * SISTEMA DE REDIRECT INTELIGENTE
 * TAGS REAIS DE AFILIADO - ALEXANDRE
 */

// TAGS DE AFILIADO CONFIRMADAS - ALEXANDRE
export const AFFILIATE_TAGS = {
  AMAZON: process.env.REACT_APP_AMAZON_TAG || 'buscabusca0f-20',       // Tag real Amazon com fallback
  MERCADOLIVRE: process.env.REACT_APP_ML_AFFILIATE_ID || 'WA20250726131129'  // Tag real Mercado Livre com fallback
};

// SISTEMA DE ROTAÇÃO DE TAGS (Anti-detecção)
export const TAG_ROTATION = {
  amazon: ['buscabusca0f-20', 'buscabr-20', 'busca01-20'],
  mercadolivre: ['WA20250726131129', 'WA20250726131130', 'WA20250726131131']
};

// Função para selecionar tag com rotação inteligente
export function getRotatingTag(platform) {
  const tags = TAG_ROTATION[platform];
  if (!tags) return AFFILIATE_TAGS[platform.toUpperCase()];

  // Rotacionar baseado no dia (uma tag por dia)
  const dayIndex = Math.floor(Date.now() / 86400000) % tags.length;
  return tags[dayIndex];
}

// CONFIGURAÇÃO DA API (Reservado para futuro uso)
export const API_CONFIG = {
  BASE_URL: 'https://bbbrasil.com/api',
  DOMAIN: 'https://bbbrasil.com',
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

// FUNÇÃO PARA ADICIONAR TAG DE AFILIADO COM ROTAÇÃO
export function addAffiliateTag(url, platform, useRotation = true) {
  // Usar rotação inteligente ou tag fixa
  const tag = useRotation ? getRotatingTag(platform) : AFFILIATE_TAGS[platform.toUpperCase()];

  switch(platform) {
    case 'amazon':
      // Verificar se já tem tag de afiliado
      if (url.includes('tag=')) {
        // Extrair a tag existente
        const existingTag = url.match(/tag=([^&]+)/)?.[1];

        // Se for uma de nossas tags, manter
        if (TAG_ROTATION.amazon.includes(existingTag)) {
          return url;
        }

        // Se for outra tag, substituir pela nossa com rotação
        return url.replace(/tag=[^&]+/, `tag=${tag}`);
      }

      // Se não tem tag, adicionar
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?tag=${tag}`;

    case 'mercadolivre':
      // Verificar se já tem parâmetros de afiliado
      if (url.includes('matt_word=') || url.includes('matt_tool=')) {
        // Verificar se é uma de nossas tags
        const hasOurTag = TAG_ROTATION.mercadolivre.some(t => url.includes(`matt_word=${t}`));
        if (hasOurTag) {
          return url; // Já tem nossa tag
        }

        // Substituir por nossa tag com rotação
        let newUrl = url;
        newUrl = newUrl.replace(/matt_word=[^&]+/, `matt_word=${tag}`);

        // Se não tem matt_tool, adicionar
        if (!newUrl.includes('matt_tool=')) {
          newUrl += '&matt_tool=88344921';
        }

        return newUrl;
      }

      // Se não tem parâmetros de afiliado, adicionar
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}matt_word=${tag}&matt_tool=88344921`;

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
const config = {
  AFFILIATE_TAGS,
  API_CONFIG,
  SYSTEM_CONFIG,
  detectPlatform,
  addAffiliateTag,
  createShortlink
};

export default config;