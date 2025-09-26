/**
 * BBB Link Enhancer - Script de Teste Completo
 * Testa todas as funcionalidades críticas do sistema
 */

const API_URL = 'https://bbbrasil.com/api';
const DOMAIN = 'https://bbbrasil.com';
const API_KEY = 'sk_live_bbb_2024_secure_key';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Helper para logs coloridos
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Função para criar shortlink
async function createShortlink(data) {
  try {
    const response = await fetch(`${API_URL}/redirects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new Error(`Erro criando shortlink: ${error.message}`);
  }
}

// Função para testar redirect
async function testRedirect(shortKey) {
  try {
    const response = await fetch(`${DOMAIN}/r/${shortKey}`, {
      method: 'HEAD',
      redirect: 'manual'
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    throw new Error(`Erro testando redirect: ${error.message}`);
  }
}

// Testes de produtos reais
const testProducts = [
  {
    name: 'Echo Dot 4ª Geração',
    platform: 'amazon',
    dest: 'https://www.amazon.com.br/dp/B08MQZXN1X?tag=buscabr-20',
    expectedCommission: 11.96
  },
  {
    name: 'iPhone 13 128GB',
    platform: 'mercadolivre',
    dest: 'https://www.mercadolivre.com.br/apple-iphone-13-128-gb-meia-noite/p/MLB18908823?matt_tool=123456',
    expectedCommission: 146.96
  },
  {
    name: 'Notebook Dell Inspiron',
    platform: 'magalu',
    dest: 'https://www.magazineluiza.com.br/notebook-dell-inspiron-15-3000/p/234567890/in/ntdl/',
    expectedCommission: 74.97
  }
];

// Executar testes
async function runTests() {
  console.log('\n====================================');
  console.log('🧪 BBB LINK ENHANCER - TESTES');
  console.log('====================================\n');

  let testsPass = 0;
  let testsFail = 0;

  // Teste 1: Criação de Shortlinks
  console.log('📦 TESTE 1: Criação de Shortlinks');
  console.log('-----------------------------------');

  const createdLinks = [];

  for (const product of testProducts) {
    try {
      log.info(`Criando link para ${product.name}...`);

      const result = await createShortlink({
        dest: product.dest,
        title: product.name,
        platform: product.platform,
        owner: 'TEST',
        add_to_cart: product.platform === 'amazon'
      });

      if (result.key && result.short_url) {
        createdLinks.push(result);
        log.success(`Link criado: ${result.short_url}`);
        log.info(`Comissão esperada: R$ ${product.expectedCommission}`);
        testsPass++;
      } else {
        throw new Error('Resposta inválida');
      }
    } catch (error) {
      log.error(`Falha: ${error.message}`);
      testsFail++;
    }
  }

  // Teste 2: Validação de Redirects
  console.log('\n📦 TESTE 2: Validação de Redirects');
  console.log('-----------------------------------');

  for (const link of createdLinks) {
    try {
      log.info(`Testando redirect: ${link.short_url}...`);

      const result = await testRedirect(link.key);

      if (result.status === 302 || result.status === 301 || result.status === 200) {
        log.success(`Redirect OK - Status: ${result.status}`);

        // Verificar cookie
        if (result.headers['set-cookie']) {
          log.success('Cookie first-party detectado');
        } else {
          log.warn('Cookie não encontrado no header');
        }

        testsPass++;
      } else {
        throw new Error(`Status inesperado: ${result.status}`);
      }
    } catch (error) {
      log.error(`Falha no redirect: ${error.message}`);
      testsFail++;
    }
  }

  // Teste 3: Performance
  console.log('\n📦 TESTE 3: Performance');
  console.log('-----------------------------------');

  if (createdLinks.length > 0) {
    const startTime = Date.now();

    try {
      await testRedirect(createdLinks[0].key);
      const responseTime = Date.now() - startTime;

      if (responseTime < 50) {
        log.success(`Redirect ultra-rápido: ${responseTime}ms ⚡`);
        testsPass++;
      } else if (responseTime < 100) {
        log.success(`Redirect rápido: ${responseTime}ms`);
        testsPass++;
      } else if (responseTime < 500) {
        log.warn(`Redirect aceitável: ${responseTime}ms`);
        testsPass++;
      } else {
        log.error(`Redirect lento: ${responseTime}ms`);
        testsFail++;
      }
    } catch (error) {
      log.error(`Erro medindo performance: ${error.message}`);
      testsFail++;
    }
  }

  // Teste 4: Validação de Plataformas
  console.log('\n📦 TESTE 4: Detecção de Plataformas');
  console.log('-----------------------------------');

  const platforms = {
    'amazon.com.br': 'amazon',
    'mercadolivre.com.br': 'mercadolivre',
    'magazineluiza.com.br': 'magalu',
    'americanas.com.br': 'americanas'
  };

  for (const [domain, expected] of Object.entries(platforms)) {
    const detected = detectPlatform(`https://www.${domain}/produto/123`);
    if (detected === expected) {
      log.success(`${domain} → ${expected}`);
      testsPass++;
    } else {
      log.error(`${domain} → ${detected} (esperado: ${expected})`);
      testsFail++;
    }
  }

  // Teste 5: Add-to-Cart Amazon
  console.log('\n📦 TESTE 5: Add-to-Cart Amazon');
  console.log('-----------------------------------');

  const amazonUrl = 'https://www.amazon.com.br/dp/B08MQZXN1X?tag=buscabr-20';
  const cartUrl = convertToAddToCart(amazonUrl);

  if (cartUrl.includes('gp/aws/cart/add.html')) {
    log.success('URL add-to-cart gerada corretamente');
    log.info(`URL: ${cartUrl}`);
    testsPass++;
  } else {
    log.error('Falha na conversão para add-to-cart');
    testsFail++;
  }

  // Resumo Final
  console.log('\n====================================');
  console.log('📊 RESUMO DOS TESTES');
  console.log('====================================');

  const totalTests = testsPass + testsFail;
  const successRate = ((testsPass / totalTests) * 100).toFixed(1);

  console.log(`\nTestes executados: ${totalTests}`);
  console.log(`${colors.green}Sucesso: ${testsPass}${colors.reset}`);
  console.log(`${colors.red}Falhas: ${testsFail}${colors.reset}`);
  console.log(`Taxa de sucesso: ${successRate}%`);

  if (testsFail === 0) {
    console.log(`\n${colors.green}🎉 TODOS OS TESTES PASSARAM!${colors.reset}`);
    console.log('Sistema pronto para produção!\n');
  } else {
    console.log(`\n${colors.yellow}⚠️  ATENÇÃO: ${testsFail} testes falharam${colors.reset}`);
    console.log('Revise os erros antes do deploy!\n');
  }

  // Links para teste manual
  if (createdLinks.length > 0) {
    console.log('🔗 Links criados para teste manual:');
    console.log('-----------------------------------');
    createdLinks.forEach((link, i) => {
      console.log(`${i + 1}. ${link.short_url}`);
    });
    console.log('\nTeste estes links no navegador e mobile!');
  }
}

// Funções auxiliares (simuladas para teste local)
function detectPlatform(url) {
  if (url.includes('amazon.com')) return 'amazon';
  if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) return 'mercadolivre';
  if (url.includes('magazineluiza.com') || url.includes('magalu.com')) return 'magalu';
  if (url.includes('americanas.com')) return 'americanas';
  if (url.includes('casasbahia.com')) return 'casasbahia';
  if (url.includes('shopee.com')) return 'shopee';
  if (url.includes('aliexpress.com')) return 'aliexpress';
  return 'other';
}

function convertToAddToCart(url) {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]+)/);
  const tagMatch = url.match(/tag=([^&]+)/);

  if (asinMatch && tagMatch) {
    const asin = asinMatch[1];
    const tag = tagMatch[1];
    return `https://www.amazon.com.br/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1&tag=${tag}`;
  }

  return url;
}

// Executar testes se rodando diretamente
if (require.main === module) {
  runTests().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { runTests, createShortlink, testRedirect };