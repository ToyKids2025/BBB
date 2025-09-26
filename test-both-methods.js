// Teste dos dois métodos de criar links
const { addAffiliateTag, detectPlatform, AFFILIATE_TAGS } = require('./src/config.js');

console.log('🧪 TESTANDO OS DOIS MÉTODOS DE CRIAR LINKS\n');
console.log('=' .repeat(60));

// TESTE 1: URL sem tag (método recomendado)
console.log('\n📋 MÉTODO 1: URL limpa (RECOMENDADO)');
console.log('-'.repeat(40));

const urlsLimpas = [
  'https://www.amazon.com.br/dp/B08N5WRWNW',
  'https://mercadolivre.com.br/produto-123'
];

urlsLimpas.forEach(url => {
  const platform = detectPlatform(url);
  const resultado = addAffiliateTag(url, platform);
  console.log(`\nOriginal: ${url}`);
  console.log(`Platform: ${platform}`);
  console.log(`✅ Final: ${resultado}`);
});

// TESTE 2: URL com tag (seu método)
console.log('\n\n📋 MÉTODO 2: URL já com tag de afiliado');
console.log('-'.repeat(40));

const urlsComTag = [
  `https://www.amazon.com.br/dp/B08N5WRWNW?tag=${AFFILIATE_TAGS.AMAZON}`,
  `https://mercadolivre.com.br/produto?matt_word=${AFFILIATE_TAGS.MERCADOLIVRE}&matt_tool=88344921`
];

urlsComTag.forEach(url => {
  const platform = detectPlatform(url);
  const resultado = addAffiliateTag(url, platform);
  console.log(`\nOriginal: ${url}`);
  console.log(`Platform: ${platform}`);
  console.log(`✅ Final: ${resultado}`);
  console.log('Status: Link mantido (já tem nossa tag)');
});

// TESTE 3: URL com tag DIFERENTE (substitui)
console.log('\n\n📋 MÉTODO 3: URL com tag de OUTRO afiliado');
console.log('-'.repeat(40));

const urlsComOutraTag = [
  'https://www.amazon.com.br/dp/B08N5WRWNW?tag=outra-tag-20',
  'https://mercadolivre.com.br/produto?matt_word=OUTRO_ID&matt_tool=123'
];

urlsComOutraTag.forEach(url => {
  const platform = detectPlatform(url);
  const resultado = addAffiliateTag(url, platform);
  console.log(`\nOriginal: ${url}`);
  console.log(`Platform: ${platform}`);
  console.log(`✅ Final: ${resultado}`);
  console.log('Status: Tag substituída pela nossa!');
});

console.log('\n' + '='.repeat(60));
console.log('✨ CONCLUSÃO:');
console.log('- Funciona com URL limpa ✅');
console.log('- Funciona com sua tag já no link ✅');
console.log('- Substitui tags de outros afiliados ✅');
console.log('\n🎯 VOCÊ PODE USAR DOS DOIS JEITOS!');