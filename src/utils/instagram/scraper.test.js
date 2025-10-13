/**
 * 🧪 TESTES DO SCRAPER AVANÇADO
 *
 * Testa extração de dados de produtos de múltiplas plataformas
 *
 * @version 1.0.0
 */

import { scrapeProductData, clearScrapingCache, getScrapingCacheStats } from './scraper';

/**
 * 🧪 TESTE 1: Mercado Livre - Produto Real
 */
export async function testMercadoLivre() {
  console.log('\n🧪 TESTE 1: Mercado Livre - Produto Real');
  console.log('━'.repeat(60));

  const testUrl = 'https://produto.mercadolivre.com.br/MLB-1234567890-notebook-gamer';

  try {
    const data = await scrapeProductData(testUrl);

    console.log('✅ Dados extraídos:');
    console.log('   Título:', data.title.substring(0, 60) + '...');
    console.log('   Preço:', data.price ? `R$ ${data.price.toFixed(2)}` : 'N/A');
    console.log('   Desconto:', data.discount ? `${data.discount}%` : 'N/A');
    console.log('   Imagens:', data.images.length);
    console.log('   Avaliação:', data.rating ? `${data.rating} ⭐` : 'N/A');
    console.log('   Reviews:', data.reviewCount || 0);
    console.log('   Plataforma:', data.platform);

    // Validações
    const validations = {
      'Título existe': data.title && data.title.length > 5,
      'Plataforma correta': data.platform === 'mercadolivre',
      'Data de scraping': !!data.scrapedAt,
      'URL original': data.sourceUrl === testUrl
    };

    console.log('\n📊 Validações:');
    for (const [test, passed] of Object.entries(validations)) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }

    const allPassed = Object.values(validations).every(v => v);
    console.log(`\n${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

    return allPassed;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * 🧪 TESTE 2: Amazon - Produto Real
 */
export async function testAmazon() {
  console.log('\n🧪 TESTE 2: Amazon - Produto Real');
  console.log('━'.repeat(60));

  const testUrl = 'https://www.amazon.com.br/dp/B08N5WRWNW';

  try {
    const data = await scrapeProductData(testUrl);

    console.log('✅ Dados extraídos:');
    console.log('   Título:', data.title.substring(0, 60) + '...');
    console.log('   Preço:', data.price ? `R$ ${data.price.toFixed(2)}` : 'N/A');
    console.log('   Imagens:', data.images.length);
    console.log('   Avaliação:', data.rating ? `${data.rating} ⭐` : 'N/A');
    console.log('   Plataforma:', data.platform);

    // Validações
    const validations = {
      'Título existe': data.title && data.title.length > 5,
      'Plataforma correta': data.platform === 'amazon',
      'Data de scraping': !!data.scrapedAt
    };

    console.log('\n📊 Validações:');
    for (const [test, passed] of Object.entries(validations)) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }

    const allPassed = Object.values(validations).every(v => v);
    console.log(`\n${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

    return allPassed;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * 🧪 TESTE 3: Cache - Verifica se cache funciona
 */
export async function testCache() {
  console.log('\n🧪 TESTE 3: Sistema de Cache');
  console.log('━'.repeat(60));

  clearScrapingCache();

  const testUrl = 'https://produto.mercadolivre.com.br/MLB-9999999-teste-cache';

  try {
    // Primeira chamada (sem cache)
    console.log('📥 Primeira chamada (sem cache)...');
    const start1 = Date.now();
    const data1 = await scrapeProductData(testUrl);
    const time1 = Date.now() - start1;
    console.log(`   ⏱️ Tempo: ${time1}ms`);

    // Segunda chamada (com cache)
    console.log('📥 Segunda chamada (com cache)...');
    const start2 = Date.now();
    const data2 = await scrapeProductData(testUrl);
    const time2 = Date.now() - start2;
    console.log(`   ⏱️ Tempo: ${time2}ms`);

    // Verificar estatísticas do cache
    const stats = getScrapingCacheStats();
    console.log(`📊 Cache: ${stats.size} item(s)`);

    // Validações
    const validations = {
      'Cache mais rápido': time2 < time1,
      'Dados idênticos': data1.title === data2.title,
      'Cache populado': stats.size > 0
    };

    console.log('\n📊 Validações:');
    for (const [test, passed] of Object.entries(validations)) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }

    const allPassed = Object.values(validations).every(v => v);
    console.log(`\n${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

    return allPassed;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * 🧪 TESTE 4: Erro Handling - URL inválida
 */
export async function testErrorHandling() {
  console.log('\n🧪 TESTE 4: Tratamento de Erros');
  console.log('━'.repeat(60));

  const invalidUrls = [
    '',
    'not-a-url',
    'https://invalid-platform.com/product',
    null,
    undefined
  ];

  let testsPassados = 0;
  let testsFalhados = 0;

  for (const url of invalidUrls) {
    try {
      console.log(`\n🔍 Testando URL inválida: ${url || '(vazio)'}`);
      const data = await scrapeProductData(url);

      // Se retornou dados básicos (fallback), é OK
      if (data.title) {
        console.log('   ✅ Fallback funcionou:', data.title);
        testsPassados++;
      } else {
        console.log('   ❌ Falhou sem fallback');
        testsFalhados++;
      }

    } catch (error) {
      // Se lançou erro, também é OK (comportamento esperado)
      console.log('   ✅ Erro capturado corretamente:', error.message);
      testsPassados++;
    }
  }

  console.log(`\n📊 Resultado: ${testsPassados}/${invalidUrls.length} testes passaram`);
  const allPassed = testsFalhados === 0;
  console.log(`${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

  return allPassed;
}

/**
 * 🧪 TESTE 5: Múltiplas plataformas simultaneamente
 */
export async function testMultiplePlatforms() {
  console.log('\n🧪 TESTE 5: Múltiplas Plataformas Simultaneamente');
  console.log('━'.repeat(60));

  const testUrls = [
    { url: 'https://produto.mercadolivre.com.br/MLB-1234', platform: 'mercadolivre' },
    { url: 'https://www.amazon.com.br/dp/B08N5WRWNW', platform: 'amazon' },
    { url: 'https://shopee.com.br/product/123456', platform: 'shopee' },
    { url: 'https://www.magazineluiza.com.br/produto/123', platform: 'magalu' }
  ];

  let testsPassados = 0;

  const promises = testUrls.map(async ({ url, platform }) => {
    try {
      console.log(`\n🔍 Scraping: ${platform}`);
      const data = await scrapeProductData(url);
      console.log(`   ✅ ${platform}: ${data.title.substring(0, 50)}`);

      if (data.platform === platform) {
        testsPassados++;
        return true;
      }
      return false;
    } catch (error) {
      console.log(`   ⚠️ ${platform}: ${error.message}`);
      return false;
    }
  });

  await Promise.all(promises);

  console.log(`\n📊 Resultado: ${testsPassados}/${testUrls.length} plataformas funcionaram`);
  const allPassed = testsPassados >= testUrls.length / 2; // Pelo menos 50%
  console.log(`${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

  return allPassed;
}

/**
 * 🧪 TESTE 6: Performance - Tempo de resposta
 */
export async function testPerformance() {
  console.log('\n🧪 TESTE 6: Performance e Tempo de Resposta');
  console.log('━'.repeat(60));

  clearScrapingCache();

  const testUrl = 'https://produto.mercadolivre.com.br/MLB-123456-teste-performance';

  try {
    const start = Date.now();
    const data = await scrapeProductData(testUrl);
    const duration = Date.now() - start;

    console.log(`⏱️ Tempo de resposta: ${duration}ms`);
    console.log(`📦 Dados extraídos: ${data.title.substring(0, 50)}`);

    // Validações
    const validations = {
      'Tempo < 15s': duration < 15000, // Scraping pode ser lento
      'Dados válidos': !!data.title,
      'Timestamp correto': !!data.scrapedAt
    };

    console.log('\n📊 Validações:');
    for (const [test, passed] of Object.entries(validations)) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }

    const allPassed = Object.values(validations).every(v => v);
    console.log(`\n${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

    return allPassed;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * 🧪 TESTE 7: Dados completos - Validação de estrutura
 */
export async function testDataStructure() {
  console.log('\n🧪 TESTE 7: Estrutura de Dados Completa');
  console.log('━'.repeat(60));

  const testUrl = 'https://produto.mercadolivre.com.br/MLB-123-notebook';

  try {
    const data = await scrapeProductData(testUrl);

    console.log('📦 Estrutura dos dados:');
    console.log(JSON.stringify(data, null, 2));

    // Validar estrutura esperada
    const requiredFields = [
      'title',
      'price',
      'images',
      'platform',
      'sourceUrl',
      'scrapedAt'
    ];

    const validations = {};
    for (const field of requiredFields) {
      validations[`Campo ${field} existe`] = field in data;
    }

    // Validar tipos
    validations['title é string'] = typeof data.title === 'string';
    validations['images é array'] = Array.isArray(data.images);
    validations['platform é string'] = typeof data.platform === 'string';

    console.log('\n📊 Validações:');
    for (const [test, passed] of Object.entries(validations)) {
      console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    }

    const allPassed = Object.values(validations).every(v => v);
    console.log(`\n${allPassed ? '✅ TESTE PASSOU' : '❌ TESTE FALHOU'}`);

    return allPassed;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

/**
 * 🚀 EXECUTAR TODOS OS TESTES
 */
export async function runAllTests() {
  console.log('\n🚀 EXECUTANDO BATERIA COMPLETA DE TESTES DO SCRAPER');
  console.log('═'.repeat(60));

  const tests = [
    { name: 'Mercado Livre', fn: testMercadoLivre },
    { name: 'Amazon', fn: testAmazon },
    { name: 'Cache', fn: testCache },
    { name: 'Erro Handling', fn: testErrorHandling },
    { name: 'Múltiplas Plataformas', fn: testMultiplePlatforms },
    { name: 'Performance', fn: testPerformance },
    { name: 'Estrutura de Dados', fn: testDataStructure }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`❌ Teste "${test.name}" lançou exceção:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }

  // Resumo final
  console.log('\n═'.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
  });

  console.log(`\n🎯 Resultado Final: ${passed}/${total} testes passaram`);
  console.log(`📈 Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%`);

  const allPassed = passed === total;
  console.log(`\n${allPassed ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️ ALGUNS TESTES FALHARAM'}`);
  console.log('═'.repeat(60));

  return allPassed;
}

// Exportar testes individuais
export default {
  testMercadoLivre,
  testAmazon,
  testCache,
  testErrorHandling,
  testMultiplePlatforms,
  testPerformance,
  testDataStructure,
  runAllTests
};
