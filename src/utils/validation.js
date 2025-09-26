/**
 * Utilidades de Validação
 * Sistema de validação de URLs e dados
 */

// Validar URL
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Validar URL de produto suportado
export function isSupportedProductUrl(url) {
  if (!isValidUrl(url)) return false;

  const supportedDomains = [
    'amazon.com',
    'amazon.com.br',
    'mercadolivre.com',
    'mercadolivre.com.br',
    'mercadolibre.com',
    'magazineluiza.com',
    'magalu.com',
    'americanas.com',
    'casasbahia.com',
    'shopee.com',
    'aliexpress.com'
  ];

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return supportedDomains.some(domain =>
      hostname.includes(domain)
    );
  } catch (_) {
    return false;
  }
}

// Sanitizar URL (remover parâmetros de tracking desnecessários)
export function sanitizeUrl(url) {
  if (!isValidUrl(url)) return url;

  try {
    const urlObj = new URL(url);

    // Parâmetros de tracking comuns para remover
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'dclid', 'msclkid',
      '_ga', '_gid', '_gat',
      'mc_cid', 'mc_eid'
    ];

    // Remover parâmetros de tracking
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch (_) {
    return url;
  }
}

// Extrair ID do produto Amazon
export function extractAmazonProductId(url) {
  if (!url.includes('amazon.com')) return null;

  // Padrões comuns de URLs da Amazon
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Validar email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar força da senha
export function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

// Rate limiting helper
const rateLimitStore = new Map();

export function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { requests: [], blocked: false };

  // Limpar requests antigos
  record.requests = record.requests.filter(time => now - time < windowMs);

  // Verificar se está bloqueado
  if (record.blocked && now - record.blockedAt < windowMs) {
    return {
      allowed: false,
      remainingTime: windowMs - (now - record.blockedAt)
    };
  }

  // Verificar limite
  if (record.requests.length >= maxRequests) {
    record.blocked = true;
    record.blockedAt = now;
    rateLimitStore.set(key, record);
    return {
      allowed: false,
      remainingTime: windowMs
    };
  }

  // Adicionar request
  record.requests.push(now);
  record.blocked = false;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remainingRequests: maxRequests - record.requests.length
  };
}

// Limpar rate limit store periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.requests.every(time => now - time > 300000)) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

const validation = {
  isValidUrl,
  isSupportedProductUrl,
  sanitizeUrl,
  extractAmazonProductId,
  isValidEmail,
  getPasswordStrength,
  checkRateLimit
};

export default validation;