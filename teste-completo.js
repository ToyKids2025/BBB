/**
 * 🧪 TESTE COMPLETO DO SISTEMA
 * Execute no Console do navegador (F12)
 */

console.log('🧪 ========================================');
console.log('   TESTE COMPLETO - BUSCABUSCABRASIL');
console.log('========================================\n');

// Importar funções (cole no console depois de abrir o site)
const { detectPlatform, addAffiliateTag, createDeepLink, isMobile } = window;

// URLs de teste
const testUrls = {
  amazon: 'https://www.amazon.com.br/Notebook-Gamer-Dell-G15-5520/dp/B0C123ABC',
  amazonComTag: 'https://www.amazon.com.br/produto/dp/B0C123ABC?tag=outra-tag-20',
  mercadolivre: 'https://www.mercadolivre.com.br/notebook-gamer/p/MLB123456789',
  mercadolivreComTag: 'https://www.mercadolivre.com.br/produto/MLB123456789?matt_word=outra_tag&matt_tool=12345'
};

console.log('📋 TESTE 1: DETECÇÃO DE PLATAFORMA\n');
Object.entries(testUrls).forEach(([key, url]) => {
  const platform = detectPlatform ? detectPlatform(url) : 'função não encontrada';
  console.log(`${key}: ${platform}`);
});

console.log('\n📋 TESTE 2: APLICAÇÃO DE TAGS\n');

// Teste Amazon
console.log('🔸 AMAZON:');
console.log('Original:', testUrls.amazon);
const amazonTagged = addAffiliateTag ? addAffiliateTag(testUrls.amazon, 'amazon') : 'função não encontrada';
console.log('Com Tag:', amazonTagged);
console.log('✅ Tag correta?', amazonTagged.includes('tag=buscabusca0f-20') ? 'SIM ✅' : 'NÃO ❌');

console.log('\n🔸 AMAZON (já com outra tag):');
console.log('Original:', testUrls.amazonComTag);
const amazonReplaced = addAffiliateTag ? addAffiliateTag(testUrls.amazonComTag, 'amazon') : 'função não encontrada';
console.log('Substituída:', amazonReplaced);
console.log('✅ Tag substituída?', amazonReplaced.includes('tag=buscabusca0f-20') && !amazonReplaced.includes('outra-tag-20') ? 'SIM ✅' : 'NÃO ❌');

console.log('\n🔸 MERCADO LIVRE:');
console.log('Original:', testUrls.mercadolivre);
const mlTagged = addAffiliateTag ? addAffiliateTag(testUrls.mercadolivre, 'mercadolivre') : 'função não encontrada';
console.log('Com Tag:', mlTagged);
console.log('✅ matt_word correta?', mlTagged.includes('matt_word=WA20250726131129') ? 'SIM ✅' : 'NÃO ❌');
console.log('✅ matt_tool correta?', mlTagged.includes('matt_tool=WA20250726131129') ? 'SIM ✅' : 'NÃO ❌');

console.log('\n📋 TESTE 3: DEEP LINKS MOBILE\n');
console.log('Dispositivo é mobile?', isMobile ? isMobile() : navigator.userAgent.includes('Mobile'));

if (createDeepLink) {
  const mlDeepLink = createDeepLink(testUrls.mercadolivre, 'mercadolivre', 'WA20250726131129');
  const amzDeepLink = createDeepLink(testUrls.amazon, 'amazon', 'buscabusca0f-20');

  console.log('ML Deep Link:', mlDeepLink || 'Não gerado');
  console.log('Amazon Deep Link:', amzDeepLink || 'Não gerado');
} else {
  console.log('⚠️ Função createDeepLink não encontrada');
}

console.log('\n📋 TESTE 4: PERSISTÊNCIA\n');

// Verificar LocalStorage
const lsKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('bb_') || key.includes('device') || key.includes('fingerprint')) {
    lsKeys.push(key);
  }
}
console.log('LocalStorage keys (tracking):', lsKeys.length);
lsKeys.forEach(key => console.log(`  - ${key}`));

// Verificar Cookies
const cookies = document.cookie.split(';').filter(c =>
  c.includes('bb_') || c.includes('device') || c.includes('fingerprint') || c.includes('aff')
);
console.log('\nCookies (tracking):', cookies.length);
cookies.forEach(c => console.log(`  - ${c.trim()}`));

// Verificar Service Worker
console.log('\nService Worker:', navigator.serviceWorker ?
  (navigator.serviceWorker.controller ? '✅ ATIVO' : '⚠️ Registrado mas não ativo') :
  '❌ Não suportado');

console.log('\n📋 TESTE 5: CAMADAS DE PERSISTÊNCIA\n');

// Verificar se Eternal Tracking está ativo
console.log('Eternal Tracking:', window.EternalTrackingSystem ? '✅ Disponível' : '⚠️ Não encontrado');
console.log('Ultimate Cookie Sync:', window.ultimateCookieSync ? '✅ Disponível' : '⚠️ Não encontrado');
console.log('Safari Persistence:', window.persistence ? '✅ Disponível' : '⚠️ Não encontrado');

console.log('\n========================================');
console.log('   ✅ TESTE COMPLETO FINALIZADO');
console.log('========================================\n');

console.log('📊 RESUMO:');
console.log('1. Detecção de plataforma: ' + (detectPlatform ? '✅' : '❌'));
console.log('2. Aplicação de tags: ' + (addAffiliateTag ? '✅' : '❌'));
console.log('3. Deep links: ' + (createDeepLink ? '✅' : '❌'));
console.log('4. LocalStorage: ' + (lsKeys.length > 0 ? `✅ (${lsKeys.length} keys)` : '❌'));
console.log('5. Cookies: ' + (cookies.length > 0 ? `✅ (${cookies.length} cookies)` : '❌'));
console.log('6. Service Worker: ' + (navigator.serviceWorker?.controller ? '✅' : '⚠️'));

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Criar um link real no painel');
console.log('2. Abrir o link em modo anônimo');
console.log('3. Verificar se a tag aparece na URL final');
console.log('4. Testar no celular para ver deep links');
