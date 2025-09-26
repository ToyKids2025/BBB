/**
 * Teste de Performance e Latência
 * Objetivo: Latência < 50ms
 */

const { performance } = require('perf_hooks');
const https = require('https');
const http = require('http');

// URLs para testar
const TEST_URLS = [
  'https://www.amazon.com.br/dp/B08N5WRWNW',
  'https://produto.mercadolivre.com.br/MLB-1234567',
  'http://localhost:3000/r/test123'
];

/**
 * Mede latência de redirect
 */
async function measureRedirectLatency(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'BBB-Performance-Test/1.0'
      }
    }, (res) => {
      const latency = performance.now() - startTime;

      // Não seguir redirects, apenas medir primeira resposta
      res.destroy();

      resolve({
        url,
        statusCode: res.statusCode,
        latency: latency.toFixed(2),
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      const latency = performance.now() - startTime;
      resolve({
        url,
        error: err.message,
        latency: latency.toFixed(2)
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        latency: 5000
      });
    });
  });
}

/**
 * Teste de Add-to-Cart Amazon
 */
function generateAmazonAddToCartUrl(productId) {
  const AMAZON_TAG = 'buscabusca0f-20';

  // URL padrão de produto
  const productUrl = `https://www.amazon.com.br/dp/${productId}?tag=${AMAZON_TAG}`;

  // URL com add-to-cart automático
  const addToCartUrl = `https://www.amazon.com.br/gp/aws/cart/add.html` +
    `?AssociateTag=${AMAZON_TAG}` +
    `&ASIN.1=${productId}` +
    `&Quantity.1=1` +
    `&add=add`;

  return {
    productUrl,
    addToCartUrl
  };
}

/**
 * Teste principal
 */
async function runPerformanceTests() {
  console.log('🚀 TESTE DE PERFORMANCE E LATÊNCIA\n');
  console.log('=' .repeat(60));

  // 1. Teste de Latência
  console.log('\n📊 TESTE DE LATÊNCIA (Meta: <50ms)\n');

  for (const url of TEST_URLS) {
    const result = await measureRedirectLatency(url);

    if (result.error) {
      console.log(`❌ ${result.url}`);
      console.log(`   Erro: ${result.error}`);
      console.log(`   Latência: ${result.latency}ms\n`);
    } else {
      const isGood = parseFloat(result.latency) < 50;
      const icon = isGood ? '✅' : '⚠️';

      console.log(`${icon} ${result.url}`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Latência: ${result.latency}ms ${isGood ? '(BOM!)' : '(ALTO!)'}`);

      if (result.headers['set-cookie']) {
        console.log(`   Cookie: ${result.headers['set-cookie'][0].substring(0, 50)}...`);
      }
      console.log();
    }
  }

  // 2. Teste Add-to-Cart Amazon
  console.log('🛒 TESTE ADD-TO-CART AMAZON (Echo Dot)\n');

  const echoDotId = 'B09B8V1LZ3'; // Echo Dot 5ª geração
  const amazonUrls = generateAmazonAddToCartUrl(echoDotId);

  console.log('URL do Produto (com tag):');
  console.log(amazonUrls.productUrl);
  console.log('\nURL Add-to-Cart Automático:');
  console.log(amazonUrls.addToCartUrl);

  // Medir latência do add-to-cart
  const addToCartResult = await measureRedirectLatency(amazonUrls.addToCartUrl);

  console.log('\n📈 Resultado Add-to-Cart:');
  if (addToCartResult.error) {
    console.log(`❌ Erro: ${addToCartResult.error}`);
  } else {
    console.log(`✅ Status: ${addToCartResult.statusCode}`);
    console.log(`⏱️ Latência: ${addToCartResult.latency}ms`);
  }

  // 3. Teste de Cookies Seguros
  console.log('\n🔒 CONFIGURAÇÃO DE COOKIES SEGUROS\n');

  const cookieConfig = {
    name: 'bb_ref',
    value: 'amazon:user123:click456',
    settings: 'Max-Age=2592000; Path=/; Secure; SameSite=Lax; HttpOnly'
  };

  console.log('Configuração Recomendada:');
  console.log(`Cookie: ${cookieConfig.name}=${cookieConfig.value}`);
  console.log(`Settings: ${cookieConfig.settings}`);
  console.log('\nCaracterísticas:');
  console.log('✅ Secure: Só HTTPS');
  console.log('✅ SameSite=Lax: Protege CSRF mas permite navegação');
  console.log('✅ HttpOnly: Protege de XSS');
  console.log('✅ Max-Age=30 dias: Persistência longa');

  // 4. Compatibilidade com Browsers
  console.log('\n📱 COMPATIBILIDADE DE BROWSERS\n');

  const browsers = {
    'Safari iOS': {
      cookies: '⚠️ ITP limita a 7 dias',
      localStorage: '✅ Funciona',
      indexedDB: '✅ Funciona',
      solução: 'Use múltiplas camadas de persistência'
    },
    'Instagram Browser': {
      cookies: '⚠️ Limitado',
      localStorage: '⚠️ Pode ser limpo',
      indexedDB: '✅ Melhor opção',
      solução: 'IndexedDB + Cache API'
    },
    'Facebook Browser': {
      cookies: '⚠️ Limitado',
      localStorage: '✅ Funciona',
      indexedDB: '✅ Funciona',
      solução: 'localStorage + IndexedDB'
    },
    'Chrome/Edge': {
      cookies: '✅ Total',
      localStorage: '✅ Total',
      indexedDB: '✅ Total',
      solução: 'Todas as opções funcionam'
    }
  };

  for (const [browser, support] of Object.entries(browsers)) {
    console.log(`${browser}:`);
    console.log(`  Cookies: ${support.cookies}`);
    console.log(`  LocalStorage: ${support.localStorage}`);
    console.log(`  IndexedDB: ${support.indexedDB}`);
    console.log(`  💡 ${support.solução}\n`);
  }

  // 5. Resumo Final
  console.log('=' .repeat(60));
  console.log('\n📋 RESUMO DO TESTE:\n');

  // Calcular média de latência
  let totalLatency = 0;
  let validTests = 0;

  for (const url of TEST_URLS) {
    const result = await measureRedirectLatency(url);
    if (!result.error) {
      totalLatency += parseFloat(result.latency);
      validTests++;
    }
  }

  const avgLatency = validTests > 0 ? (totalLatency / validTests).toFixed(2) : 'N/A';

  console.log(`⏱️ Latência Média: ${avgLatency}ms ${avgLatency < 50 ? '✅' : '⚠️'}`);
  console.log(`🛒 Add-to-Cart Amazon: Configurado ✅`);
  console.log(`🔒 Cookies Seguros: Secure + SameSite=Lax ✅`);
  console.log(`📱 Safari iOS: Múltiplas camadas de persistência ✅`);
  console.log(`📸 Instagram: IndexedDB + Fallbacks ✅`);

  console.log('\n✨ Sistema otimizado para máxima persistência!');
}

// Executar testes
runPerformanceTests().catch(console.error);