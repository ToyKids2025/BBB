/**
 * 🧪 TESTE DO LINK ENHANCER
 * Script para testar o sistema de upgrade de links
 */

// Simular ambiente do link-enhancer
class LinkEnhancerTest {
  constructor() {
    this.AFFILIATE_TAGS = {
      AMAZON: 'buscabusca0f-20',
      ML_WORD: 'wa20250726131129',
      ML_TOOL: '88344921'
    };
    this.cache = new Map();
    this.testsPassed = 0;
    this.testsFailed = 0;
  }

  // ===== MÉTODOS DO LINK ENHANCER (SIMPLIFICADOS) =====

  detectPlatform(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) {
      return 'amazon';
    }
    if (urlLower.includes('mercadolivre.com') || urlLower.includes('/sec/') || urlLower.includes('/social/')) {
      return 'mercadolivre';
    }
    return 'other';
  }

  extractAmazonASIN(url) {
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  extractMLBId(url) {
    const patterns = [
      /MLB-?(\d{10,12})/i,
      /\/p\/MLB-?(\d{10,12})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  buildModernAmazonUrl(asin) {
    const baseUrl = `https://www.amazon.com.br/dp/${asin}`;
    const ascsubtag = `bbb_${Date.now()}_web`;

    return `${baseUrl}?tag=${this.AFFILIATE_TAGS.AMAZON}&ascsubtag=${ascsubtag}&ref_=bbb_link&psc=1&th=1`;
  }

  buildModernMLUrl(mlbId) {
    return `https://www.mercadolivre.com.br/MLB-${mlbId}?matt_word=${this.AFFILIATE_TAGS.ML_WORD.toLowerCase()}&matt_tool=${this.AFFILIATE_TAGS.ML_TOOL}`;
  }

  // ===== TESTES =====

  assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      this.testsPassed++;
      return true;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      this.testsFailed++;
      return false;
    }
  }

  runTests() {
    console.log('\n🧪 ===== INICIANDO TESTES DO LINK ENHANCER =====\n');

    // ===== TESTE 1: DETECÇÃO DE PLATAFORMA =====
    console.log('📋 Teste 1: Detecção de Plataforma');
    console.log('─────────────────────────────────');

    this.assert(
      this.detectPlatform('https://amzn.to/3XYZ') === 'amazon',
      'Detectar amzn.to como Amazon'
    );

    this.assert(
      this.detectPlatform('https://www.amazon.com.br/dp/B0ABC123XY') === 'amazon',
      'Detectar amazon.com.br como Amazon'
    );

    this.assert(
      this.detectPlatform('https://mercadolivre.com.br/sec/ABC') === 'mercadolivre',
      'Detectar /sec/ como Mercado Livre'
    );

    this.assert(
      this.detectPlatform('https://www.mercadolivre.com.br/MLB-1234567890') === 'mercadolivre',
      'Detectar mercadolivre.com.br como Mercado Livre'
    );

    // ===== TESTE 2: EXTRAÇÃO DE ASIN =====
    console.log('\n📋 Teste 2: Extração de ASIN (Amazon)');
    console.log('─────────────────────────────────');

    const asin1 = this.extractAmazonASIN('https://www.amazon.com.br/dp/B0ABC123XY');
    this.assert(
      asin1 === 'B0ABC123XY',
      `Extrair ASIN de /dp/ (resultado: ${asin1})`
    );

    const asin2 = this.extractAmazonASIN('https://www.amazon.com.br/gp/product/B0DEF456GH');
    this.assert(
      asin2 === 'B0DEF456GH',
      `Extrair ASIN de /gp/product/ (resultado: ${asin2})`
    );

    const asin3 = this.extractAmazonASIN('https://www.amazon.com.br/product/B0GHI789JK');
    this.assert(
      asin3 === 'B0GHI789JK',
      `Extrair ASIN de /product/ (resultado: ${asin3})`
    );

    // ===== TESTE 3: EXTRAÇÃO DE MLB ID =====
    console.log('\n📋 Teste 3: Extração de MLB ID (Mercado Livre)');
    console.log('─────────────────────────────────');

    const mlb1 = this.extractMLBId('https://www.mercadolivre.com.br/MLB-1234567890');
    this.assert(
      mlb1 === '1234567890',
      `Extrair MLB ID com hífen (resultado: ${mlb1})`
    );

    const mlb2 = this.extractMLBId('https://www.mercadolivre.com.br/p/MLB1234567890');
    this.assert(
      mlb2 === '1234567890',
      `Extrair MLB ID sem hífen (resultado: ${mlb2})`
    );

    // ===== TESTE 4: CONSTRUÇÃO DE URL AMAZON =====
    console.log('\n📋 Teste 4: Construção de URL Amazon Moderna');
    console.log('─────────────────────────────────');

    const amazonUrl = this.buildModernAmazonUrl('B0ABC123XY');
    console.log(`URL gerada: ${amazonUrl.substring(0, 100)}...`);

    this.assert(
      amazonUrl.includes('tag=buscabusca0f-20'),
      'URL contém tag de afiliado'
    );

    this.assert(
      amazonUrl.includes('ascsubtag=bbb_'),
      'URL contém ascsubtag (OneLink)'
    );

    this.assert(
      amazonUrl.includes('ref_=bbb_link'),
      'URL contém ref_'
    );

    this.assert(
      amazonUrl.includes('psc=1'),
      'URL contém psc=1'
    );

    this.assert(
      amazonUrl.includes('th=1'),
      'URL contém th=1'
    );

    // ===== TESTE 5: CONSTRUÇÃO DE URL ML =====
    console.log('\n📋 Teste 5: Construção de URL Mercado Livre Moderna');
    console.log('─────────────────────────────────');

    const mlUrl = this.buildModernMLUrl('1234567890');
    console.log(`URL gerada: ${mlUrl}`);

    this.assert(
      mlUrl.includes('matt_word=wa20250726131129'),
      'URL contém matt_word (minúsculo)'
    );

    this.assert(
      mlUrl.includes('matt_tool=88344921'),
      'URL contém matt_tool'
    );

    this.assert(
      mlUrl.includes('MLB-1234567890'),
      'URL contém MLB ID formatado'
    );

    // ===== TESTE 6: TAGS CORRETAS =====
    console.log('\n📋 Teste 6: Verificação de Tags');
    console.log('─────────────────────────────────');

    this.assert(
      this.AFFILIATE_TAGS.AMAZON === 'buscabusca0f-20',
      `Tag Amazon correta (${this.AFFILIATE_TAGS.AMAZON})`
    );

    this.assert(
      this.AFFILIATE_TAGS.ML_WORD === 'wa20250726131129',
      `Tag ML Word correta (${this.AFFILIATE_TAGS.ML_WORD})`
    );

    this.assert(
      this.AFFILIATE_TAGS.ML_TOOL === '88344921',
      `Tag ML Tool correta (${this.AFFILIATE_TAGS.ML_TOOL})`
    );

    // ===== TESTE 7: CASOS ESPECIAIS =====
    console.log('\n📋 Teste 7: Casos Especiais');
    console.log('─────────────────────────────────');

    // Teste URL com parâmetros existentes
    const urlWithParams = 'https://www.amazon.com.br/dp/B0ABC123XY?other=param';
    const asinFromParams = this.extractAmazonASIN(urlWithParams);
    this.assert(
      asinFromParams === 'B0ABC123XY',
      'Extrair ASIN de URL com parâmetros existentes'
    );

    // Teste URL ML com quantidade
    const mlbWithQuantity = this.extractMLBId('https://www.mercadolivre.com.br/MLB-1234567890?quantity=2');
    this.assert(
      mlbWithQuantity === '1234567890',
      'Extrair MLB ID de URL com parâmetros'
    );

    // ===== RESULTADO FINAL =====
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESULTADO DOS TESTES');
    console.log('='.repeat(50));
    console.log(`✅ Testes Passados: ${this.testsPassed}`);
    console.log(`❌ Testes Falhos:   ${this.testsFailed}`);
    console.log(`📊 Total:           ${this.testsPassed + this.testsFailed}`);
    console.log(`📈 Taxa de Sucesso: ${((this.testsPassed / (this.testsPassed + this.testsFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    if (this.testsFailed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.\n');
      return true;
    } else {
      console.log(`\n⚠️  ${this.testsFailed} teste(s) falharam. Revisar implementação.\n`);
      return false;
    }
  }
}

// ===== EXECUTAR TESTES =====
const tester = new LinkEnhancerTest();
const allTestsPassed = tester.runTests();

// Exit code para CI/CD
process.exit(allTestsPassed ? 0 : 1);
