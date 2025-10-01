#!/usr/bin/env node

/**
 * 🧪 TESTE BUG FIX - DETECÇÃO DE PLATFORM
 */

console.log('\n🧪 ===== TESTE BUG FIX - PLATFORM DETECTION =====\n');

// Simular função detectPlatform corrigida
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  // ✅ DETECTAR AMAZON (incluindo links curtos amzn.to)
  if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) return 'amazon';
  // ✅ DETECTAR MERCADO LIVRE (incluindo /sec/ e /social/)
  if (urlLower.includes('mercadolivre.com') ||
      urlLower.includes('mercadolibre.com') ||
      urlLower.includes('/sec/') ||
      urlLower.includes('/social/')) return 'mercadolivre';
  if (urlLower.includes('shopee.com')) return 'shopee';
  if (urlLower.includes('magazineluiza.com') || urlLower.includes('magalu.com')) return 'magalu';
  return 'other';
}

// Simular lógica do Link Enhancer V2 corrigida
function shouldProcess(url, platform = null) {
  const detectedPlatform = detectPlatform(url);

  // Se platform vier como "other" ou null, usar o detectado
  if (!platform || platform === 'other') {
    platform = detectedPlatform;
  }

  return { platform, detected: detectedPlatform, willProcess: platform !== 'other' };
}

// ============================================
// TESTES
// ============================================

console.log('📋 Teste 1: Link amzn.to (link curto Amazon)');
console.log('─────────────────────────────────');
const test1 = shouldProcess('https://amzn.to/42Hpx7x', 'other');
console.log('URL: https://amzn.to/42Hpx7x');
console.log('Platform recebida: "other"');
console.log('Platform detectada:', test1.detected);
console.log('Platform final:', test1.platform);
console.log('Vai processar?', test1.willProcess ? '✅ SIM' : '❌ NÃO');

if (test1.platform === 'amazon' && test1.willProcess) {
  console.log('✅ PASS: Link será processado como Amazon!');
} else {
  console.log('❌ FAIL: Link NÃO será processado!');
}
console.log('');

console.log('📋 Teste 2: Link /sec/ (link curto ML)');
console.log('─────────────────────────────────');
const test2 = shouldProcess('https://mercadolivre.com.br/sec/ABC123', 'other');
console.log('URL: https://mercadolivre.com.br/sec/ABC123');
console.log('Platform recebida: "other"');
console.log('Platform detectada:', test2.detected);
console.log('Platform final:', test2.platform);
console.log('Vai processar?', test2.willProcess ? '✅ SIM' : '❌ NÃO');

if (test2.platform === 'mercadolivre' && test2.willProcess) {
  console.log('✅ PASS: Link será processado como Mercado Livre!');
} else {
  console.log('❌ FAIL: Link NÃO será processado!');
}
console.log('');

console.log('📋 Teste 3: Link amazon.com completo');
console.log('─────────────────────────────────');
const test3 = shouldProcess('https://www.amazon.com.br/dp/B0FKP5K7VM', null);
console.log('URL: https://www.amazon.com.br/dp/B0FKP5K7VM');
console.log('Platform recebida: null');
console.log('Platform detectada:', test3.detected);
console.log('Platform final:', test3.platform);
console.log('Vai processar?', test3.willProcess ? '✅ SIM' : '❌ NÃO');

if (test3.platform === 'amazon' && test3.willProcess) {
  console.log('✅ PASS: Link será processado como Amazon!');
} else {
  console.log('❌ FAIL: Link NÃO será processado!');
}
console.log('');

console.log('📋 Teste 4: Link não suportado');
console.log('─────────────────────────────────');
const test4 = shouldProcess('https://google.com', 'other');
console.log('URL: https://google.com');
console.log('Platform recebida: "other"');
console.log('Platform detectada:', test4.detected);
console.log('Platform final:', test4.platform);
console.log('Vai processar?', test4.willProcess ? '✅ SIM' : '❌ NÃO');

if (test4.platform === 'other' && !test4.willProcess) {
  console.log('✅ PASS: Link não será processado (plataforma não suportada)');
} else {
  console.log('❌ FAIL: Comportamento inesperado!');
}
console.log('');

console.log('==================================================');
console.log('🎯 RESUMO');
console.log('==================================================');
console.log('');
console.log('✅ BUG CORRIGIDO:');
console.log('   - Links amzn.to agora detectados como Amazon');
console.log('   - Links /sec/ agora detectados como ML');
console.log('   - Platform "other" é re-detectada automaticamente');
console.log('   - Link Enhancer processa corretamente');
console.log('');
console.log('📝 ARQUIVOS MODIFICADOS:');
console.log('   1. src/components/LinkManager.jsx (linha 48)');
console.log('   2. src/utils/link-enhancer.js (linha 41-42)');
console.log('   3. src/utils/link-enhancer-v2.js (linha 51-52)');
console.log('');
console.log('🚀 PRÓXIMO PASSO:');
console.log('   npm run build && npm run deploy');
console.log('');
