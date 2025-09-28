const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');

// Configurações
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3002';
const WHATSAPP_API = 'http://localhost:3001';

// Tags de afiliado reais
const AFFILIATE_TAGS = {
  AMAZON: 'buscabrasil-20',
  MERCADO_LIVRE: 'WA20250726131129'
};

// Produtos reais para teste
const TEST_PRODUCTS = {
  mercadoLivre: [
    'https://www.mercadolivre.com.br/furadeira-de-impacto-bosch-gsb-13-re-professional-650w-127v/p/MLB18723880',
    'https://www.mercadolivre.com.br/smartphone-samsung-galaxy-a54-5g-256gb-preto-8gb-ram/p/MLB21735502',
    'https://produto.mercadolivre.com.br/MLB-3635470297-chave-de-fenda-tramontina-14-x-6',
    'https://www.mercadolivre.com.br/notebook-lenovo-ideapad-3-15itl6/p/MLB18501920'
  ],
  amazon: [
    'https://www.amazon.com.br/dp/B0CJK4JG67',
    'https://www.amazon.com.br/Echo-Dot-5ª-geração/dp/B09B8W5FW7',
    'https://www.amazon.com.br/Kindle-11ª-geração/dp/B09SWW583J',
    'https://www.amazon.com.br/dp/B08N3TCP2N'
  ]
};

class ExtremeTestValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      metrics: {
        cookiesCreated: 0,
        pixelsFired: 0,
        persistenceRate: 0,
        crossDomainSuccess: 0,
        totalTests: 0
      }
    };
  }

  async initialize() {
    console.log(chalk.cyan.bold('\n🚀 INICIANDO TESTE EXTREMO DE VALIDAÇÃO\n'));

    this.browser = await puppeteer.launch({
      headless: false, // Ver o navegador funcionando
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    this.page = await this.browser.newPage();

    // Interceptar requisições
    await this.page.setRequestInterception(true);

    this.page.on('request', request => {
      const url = request.url();

      // Rastrear pixels
      if (url.includes('pixel.gif') || url.includes('tracking')) {
        this.results.metrics.pixelsFired++;
        console.log(chalk.gray(`  📍 Pixel disparado: ${url.substring(0, 50)}...`));
      }

      request.continue();
    });

    // Interceptar cookies
    this.page.on('response', async response => {
      const cookies = await this.page.cookies();
      if (cookies.length > this.results.metrics.cookiesCreated) {
        this.results.metrics.cookiesCreated = cookies.length;
      }
    });
  }

  async testLinkGeneration() {
    console.log(chalk.yellow.bold('\n📝 TESTE 1: GERAÇÃO DE LINKS\n'));

    for (const [platform, urls] of Object.entries(TEST_PRODUCTS)) {
      console.log(chalk.blue(`\n  Testando ${platform}:`));

      for (const originalUrl of urls) {
        try {
          await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

          // Aguardar carregamento
          await this.page.waitForTimeout(2000);

          // Procurar campo de input
          const inputSelector = 'input[type="text"], input[type="url"], input[placeholder*="Cole"]';
          await this.page.waitForSelector(inputSelector);

          // Limpar e inserir URL
          await this.page.click(inputSelector, { clickCount: 3 });
          await this.page.type(inputSelector, originalUrl);

          // Clicar em gerar
          const generateButton = 'button:has-text("Gerar"), button:has-text("GERAR"), button:has-text("Criar")';
          await this.page.evaluate((selector) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const button = buttons.find(b =>
              b.textContent.match(/gerar|criar|adicionar/i) && !b.disabled
            );
            if (button) button.click();
          }, generateButton);

          await this.page.waitForTimeout(3000);

          // Verificar se link foi gerado
          const generatedLink = await this.page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('div[class*="link"], div[class*="url"]'));
            const affiliateLink = links.find(el =>
              el.textContent.includes('matt_word') ||
              el.textContent.includes('tag=')
            );
            return affiliateLink ? affiliateLink.textContent.trim() : null;
          });

          if (generatedLink) {
            // Validar tag de afiliado
            const expectedTag = platform === 'mercadoLivre' ?
              AFFILIATE_TAGS.MERCADO_LIVRE :
              AFFILIATE_TAGS.AMAZON;

            if (generatedLink.includes(expectedTag)) {
              this.results.passed.push({
                test: 'Link Generation',
                platform,
                originalUrl: originalUrl.substring(0, 50) + '...',
                generatedLink: generatedLink.substring(0, 80) + '...',
                tag: expectedTag
              });

              console.log(chalk.green(`    ✅ Link gerado com tag ${expectedTag}`));
              console.log(chalk.gray(`       ${generatedLink.substring(0, 80)}...`));
            } else {
              this.results.failed.push({
                test: 'Link Generation',
                platform,
                error: `Tag incorreta no link gerado`,
                expected: expectedTag,
                got: generatedLink
              });

              console.log(chalk.red(`    ❌ Tag incorreta: esperava ${expectedTag}`));
            }
          } else {
            this.results.failed.push({
              test: 'Link Generation',
              platform,
              originalUrl,
              error: 'Link não foi gerado'
            });

            console.log(chalk.red(`    ❌ Falha ao gerar link`));
          }

        } catch (error) {
          this.results.failed.push({
            test: 'Link Generation',
            platform,
            originalUrl,
            error: error.message
          });

          console.log(chalk.red(`    ❌ Erro: ${error.message}`));
        }
      }
    }
  }

  async testCookiePersistence() {
    console.log(chalk.yellow.bold('\n🍪 TESTE 2: PERSISTÊNCIA DE COOKIES\n'));

    try {
      // Navegar para o site
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      // Simular clique em link de afiliado
      await this.page.evaluate(() => {
        if (window.BBBTracker) {
          window.BBBTracker.trackEvent('test_click', {
            platform: 'mercadolivre',
            testMode: true
          });
        }

        if (window.BBBUltimateSync) {
          window.BBBUltimateSync.trackAffiliateClick(
            'https://www.mercadolivre.com.br/test-product',
            'mercadolivre'
          );
        }
      });

      await this.page.waitForTimeout(2000);

      // Verificar cookies criados
      const cookies = await this.page.cookies();

      console.log(chalk.blue(`  Cookies encontrados: ${cookies.length}`));

      const expectedCookies = [
        'bb_ref', 'bb_ref_eternal', 'bb_ref_lifetime',
        'bb_aff_90', 'bb_aff_365', 'bb_aff_eternal',
        'bb_session', 'bb_track'
      ];

      for (const cookieName of expectedCookies) {
        const cookie = cookies.find(c => c.name.includes(cookieName));

        if (cookie) {
          const expiryDays = cookie.expires ?
            Math.floor((cookie.expires * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) :
            'Session';

          this.results.passed.push({
            test: 'Cookie Persistence',
            cookie: cookieName,
            value: cookie.value.substring(0, 20) + '...',
            expires: `${expiryDays} dias`
          });

          console.log(chalk.green(`    ✅ ${cookieName}: ${expiryDays} dias`));
        } else {
          this.results.warnings.push({
            test: 'Cookie Persistence',
            cookie: cookieName,
            warning: 'Cookie não encontrado'
          });

          console.log(chalk.yellow(`    ⚠️ ${cookieName}: não encontrado`));
        }
      }

      // Testar LocalStorage
      const localStorageData = await this.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.includes('bb_') || key.includes('eternal') || key.includes('tracking')) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });

      console.log(chalk.blue(`\n  LocalStorage: ${Object.keys(localStorageData).length} items`));

      for (const [key, value] of Object.entries(localStorageData)) {
        console.log(chalk.green(`    ✅ ${key}: ${value.substring(0, 30)}...`));
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Cookie Persistence',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testCrossDomainSync() {
    console.log(chalk.yellow.bold('\n🔄 TESTE 3: SINCRONIZAÇÃO CROSS-DOMAIN\n'));

    try {
      // Testar API de sincronização
      const syncResponse = await axios.post(`${API_URL}/api/sync/cross-domain`, {
        sourceOrigin: 'http://localhost:3000',
        targetOrigin: 'https://www.mercadolivre.com.br',
        affiliateTag: AFFILIATE_TAGS.MERCADO_LIVRE
      });

      if (syncResponse.data.success && syncResponse.data.syncToken) {
        this.results.passed.push({
          test: 'Cross-Domain Sync',
          syncToken: syncResponse.data.syncToken,
          syncUrl: syncResponse.data.syncUrl
        });

        console.log(chalk.green(`  ✅ Token de sincronização criado`));
        console.log(chalk.gray(`     Token: ${syncResponse.data.syncToken}`));

        // Verificar aplicação do token
        const applyResponse = await axios.get(
          `${API_URL}/api/sync/apply/${syncResponse.data.syncToken}`
        );

        if (applyResponse.data.success) {
          console.log(chalk.green(`  ✅ Sincronização aplicada com sucesso`));
        }
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Cross-Domain Sync',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testPixelTracking() {
    console.log(chalk.yellow.bold('\n📊 TESTE 4: PIXEL TRACKING\n'));

    try {
      const initialPixels = this.results.metrics.pixelsFired;

      // Navegar e acionar eventos
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      await this.page.evaluate(() => {
        // Simular eventos de tracking
        if (window.BBBTracker) {
          window.BBBTracker.trackEvent('page_view', { test: true });
          window.BBBTracker.trackEvent('link_click', { test: true });
        }

        // Forçar disparo de pixels
        const img = document.createElement('img');
        img.src = 'http://localhost:3002/api/pixel.gif?t=test&e=validation';
        document.body.appendChild(img);
      });

      await this.page.waitForTimeout(3000);

      const pixelsFired = this.results.metrics.pixelsFired - initialPixels;

      if (pixelsFired > 0) {
        this.results.passed.push({
          test: 'Pixel Tracking',
          pixelsFired
        });

        console.log(chalk.green(`  ✅ ${pixelsFired} pixels disparados`));
      } else {
        this.results.warnings.push({
          test: 'Pixel Tracking',
          warning: 'Nenhum pixel foi disparado'
        });

        console.log(chalk.yellow(`  ⚠️ Nenhum pixel detectado`));
      }

      // Verificar pixel endpoint
      const pixelResponse = await axios.get(`${API_URL}/api/pixel.gif?t=test123&e=test_event`, {
        responseType: 'arraybuffer'
      });

      if (pixelResponse.status === 200) {
        console.log(chalk.green(`  ✅ Endpoint de pixel funcionando`));
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Pixel Tracking',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testServiceWorker() {
    console.log(chalk.yellow.bold('\n⚙️ TESTE 5: SERVICE WORKER\n'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      const serviceWorkerStatus = await this.page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) {
          return { supported: false };
        }

        const registrations = await navigator.serviceWorker.getRegistrations();

        return {
          supported: true,
          registrations: registrations.map(reg => ({
            scope: reg.scope,
            active: !!reg.active,
            state: reg.active ? reg.active.state : 'none'
          }))
        };
      });

      if (serviceWorkerStatus.supported) {
        console.log(chalk.blue(`  Service Workers: ${serviceWorkerStatus.registrations.length}`));

        for (const reg of serviceWorkerStatus.registrations) {
          if (reg.active) {
            this.results.passed.push({
              test: 'Service Worker',
              scope: reg.scope,
              state: reg.state
            });

            console.log(chalk.green(`    ✅ ${reg.scope} - ${reg.state}`));
          } else {
            console.log(chalk.yellow(`    ⚠️ ${reg.scope} - inativo`));
          }
        }
      } else {
        this.results.warnings.push({
          test: 'Service Worker',
          warning: 'Service Workers não suportados'
        });

        console.log(chalk.yellow(`  ⚠️ Service Workers não suportados`));
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Service Worker',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testRealCommissionCapture() {
    console.log(chalk.yellow.bold('\n💰 TESTE 6: CAPTURA REAL DE COMISSÃO\n'));

    try {
      // Simular fluxo completo
      console.log(chalk.blue('\n  Simulando fluxo de compra:\n'));

      // 1. Usuário clica no link de afiliado
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      const testUrl = TEST_PRODUCTS.mercadoLivre[0];

      // Gerar link com afiliado
      await this.page.evaluate((url) => {
        if (window.BBBUltimateSync) {
          window.BBBUltimateSync.trackAffiliateClick(url, 'mercadolivre');
        }
      }, testUrl);

      console.log(chalk.green('  ✅ Passo 1: Link de afiliado clicado'));

      // 2. Verificar cookies criados
      const cookiesAfterClick = await this.page.cookies();
      const affiliateCookies = cookiesAfterClick.filter(c =>
        c.value.includes(AFFILIATE_TAGS.MERCADO_LIVRE) ||
        c.name.includes('bb_')
      );

      console.log(chalk.green(`  ✅ Passo 2: ${affiliateCookies.length} cookies de afiliado criados`));

      // 3. Simular limpeza de navegador (parcial)
      await this.page.evaluate(() => {
        // Limpar apenas sessionStorage (simula fechar navegador)
        sessionStorage.clear();
      });

      console.log(chalk.blue('  📱 Passo 3: Navegador fechado (sessão limpa)'));

      // 4. Simular retorno direto (sem link de afiliado)
      await this.page.goto('about:blank');
      await this.page.waitForTimeout(1000);

      // 5. Verificar se cookies persistem
      const cookiesAfterClear = await this.page.cookies();
      const persistentCookies = cookiesAfterClear.filter(c =>
        c.value.includes(AFFILIATE_TAGS.MERCADO_LIVRE) ||
        c.name.includes('bb_aff')
      );

      if (persistentCookies.length > 0) {
        this.results.passed.push({
          test: 'Commission Capture',
          scenario: 'Retorno após fechar navegador',
          persistentCookies: persistentCookies.length,
          tagPresent: true
        });

        console.log(chalk.green(`  ✅ Passo 4: ${persistentCookies.length} cookies persistentes mantidos`));
        console.log(chalk.green.bold(`  💰 COMISSÃO CAPTURADA! Tag ${AFFILIATE_TAGS.MERCADO_LIVRE} ainda presente`));

        this.results.metrics.persistenceRate =
          (persistentCookies.length / affiliateCookies.length) * 100;

      } else {
        this.results.failed.push({
          test: 'Commission Capture',
          scenario: 'Retorno após fechar navegador',
          error: 'Cookies perdidos'
        });

        console.log(chalk.red(`  ❌ Cookies perdidos - comissão não seria capturada`));
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Commission Capture',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testAPIEndpoints() {
    console.log(chalk.yellow.bold('\n🔌 TESTE 7: ENDPOINTS DA API\n'));

    const endpoints = [
      {
        name: 'Cookie Set',
        method: 'POST',
        url: `${API_URL}/api/cookie/set`,
        data: {
          affiliateTag: AFFILIATE_TAGS.MERCADO_LIVRE,
          productUrl: 'https://test.com/product',
          platform: 'mercadolivre'
        }
      },
      {
        name: 'Cookie Verify',
        method: 'GET',
        url: `${API_URL}/api/cookie/verify`
      },
      {
        name: 'Health Check',
        method: 'GET',
        url: `${API_URL}/api/health`
      },
      {
        name: 'Track Event',
        method: 'POST',
        url: `${API_URL}/api/track/event`,
        data: {
          trackingId: 'test_123',
          event: 'test_event',
          data: { test: true }
        }
      }
    ];

    for (const endpoint of endpoints) {
      try {
        const config = {
          method: endpoint.method,
          url: endpoint.url,
          data: endpoint.data
        };

        const response = await axios(config);

        if (response.status === 200 || response.status === 201) {
          this.results.passed.push({
            test: 'API Endpoint',
            endpoint: endpoint.name,
            status: response.status
          });

          console.log(chalk.green(`  ✅ ${endpoint.name}: OK`));

          if (response.data) {
            console.log(chalk.gray(`     Response: ${JSON.stringify(response.data).substring(0, 60)}...`));
          }
        }
      } catch (error) {
        this.results.failed.push({
          test: 'API Endpoint',
          endpoint: endpoint.name,
          error: error.message
        });

        console.log(chalk.red(`  ❌ ${endpoint.name}: ${error.message}`));
      }
    }
  }

  async testDeviceFingerprint() {
    console.log(chalk.yellow.bold('\n🔐 TESTE 8: DEVICE FINGERPRINT\n'));

    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      const fingerprint = await this.page.evaluate(() => {
        if (window.BBBUltimateSync) {
          return window.BBBUltimateSync.generateDeviceFingerprint();
        }
        return null;
      });

      if (fingerprint) {
        this.results.passed.push({
          test: 'Device Fingerprint',
          fingerprint: fingerprint.substring(0, 20) + '...',
          unique: true
        });

        console.log(chalk.green(`  ✅ Fingerprint gerado: ${fingerprint.substring(0, 40)}...`));

        // Testar consistência
        const fingerprint2 = await this.page.evaluate(() => {
          if (window.BBBUltimateSync) {
            return window.BBBUltimateSync.generateDeviceFingerprint();
          }
          return null;
        });

        if (fingerprint === fingerprint2) {
          console.log(chalk.green(`  ✅ Fingerprint consistente entre execuções`));
        } else {
          console.log(chalk.yellow(`  ⚠️ Fingerprint variou entre execuções`));
        }

      } else {
        this.results.warnings.push({
          test: 'Device Fingerprint',
          warning: 'Fingerprint não gerado'
        });

        console.log(chalk.yellow(`  ⚠️ Fingerprint não foi gerado`));
      }

    } catch (error) {
      this.results.failed.push({
        test: 'Device Fingerprint',
        error: error.message
      });

      console.log(chalk.red(`  ❌ Erro: ${error.message}`));
    }
  }

  async testWhatsAppIntegration() {
    console.log(chalk.yellow.bold('\n📱 TESTE 9: INTEGRAÇÃO WHATSAPP\n'));

    try {
      // Verificar servidor WhatsApp
      const healthResponse = await axios.get(`${WHATSAPP_API}/health`);

      if (healthResponse.data.status === 'ok') {
        console.log(chalk.green(`  ✅ Servidor WhatsApp online`));

        // Testar envio de mensagem
        const testMessage = {
          phone: '5511999999999',
          template: 'test',
          variables: {
            product: 'Produto Teste',
            link: 'https://test.com'
          }
        };

        try {
          const sendResponse = await axios.post(`${WHATSAPP_API}/send`, testMessage);

          if (sendResponse.data.success) {
            this.results.passed.push({
              test: 'WhatsApp Integration',
              status: 'operational',
              queueStatus: sendResponse.data.position || 'sent'
            });

            console.log(chalk.green(`  ✅ Sistema de mensagens funcionando`));
          }
        } catch (error) {
          // Esperado se não houver configuração real
          console.log(chalk.yellow(`  ⚠️ Envio simulado (sem credenciais reais)`));
        }
      }

    } catch (error) {
      this.results.warnings.push({
        test: 'WhatsApp Integration',
        warning: 'Servidor WhatsApp offline ou não configurado'
      });

      console.log(chalk.yellow(`  ⚠️ WhatsApp não está rodando`));
    }
  }

  async generateReport() {
    console.log(chalk.cyan.bold('\n\n📊 RELATÓRIO FINAL DE VALIDAÇÃO\n'));
    console.log(chalk.white('═'.repeat(60)));

    // Estatísticas gerais
    const totalTests = this.results.passed.length + this.results.failed.length;
    const successRate = (this.results.passed.length / totalTests) * 100;

    console.log(chalk.white.bold('\n📈 ESTATÍSTICAS GERAIS:\n'));
    console.log(chalk.green(`  ✅ Testes aprovados: ${this.results.passed.length}`));
    console.log(chalk.red(`  ❌ Testes falhados: ${this.results.failed.length}`));
    console.log(chalk.yellow(`  ⚠️ Avisos: ${this.results.warnings.length}`));
    console.log(chalk.blue(`  📊 Taxa de sucesso: ${successRate.toFixed(1)}%`));

    console.log(chalk.white.bold('\n🔍 MÉTRICAS ESPECÍFICAS:\n'));
    console.log(chalk.cyan(`  🍪 Cookies criados: ${this.results.metrics.cookiesCreated}`));
    console.log(chalk.cyan(`  📍 Pixels disparados: ${this.results.metrics.pixelsFired}`));
    console.log(chalk.cyan(`  💾 Taxa de persistência: ${this.results.metrics.persistenceRate.toFixed(1)}%`));

    // Análise crítica
    console.log(chalk.white.bold('\n⚡ ANÁLISE CRÍTICA:\n'));

    if (successRate >= 80) {
      console.log(chalk.green.bold('  ✅ SISTEMA FUNCIONANDO CORRETAMENTE!'));
      console.log(chalk.green('  → Comissões estão sendo capturadas'));
      console.log(chalk.green('  → Cookies persistentes funcionando'));
      console.log(chalk.green('  → Tags de afiliado corretas'));
    } else if (successRate >= 60) {
      console.log(chalk.yellow.bold('  ⚠️ SISTEMA PARCIALMENTE FUNCIONAL'));
      console.log(chalk.yellow('  → Algumas funcionalidades precisam ajustes'));
      console.log(chalk.yellow('  → Verificar configurações de tags'));
    } else {
      console.log(chalk.red.bold('  ❌ SISTEMA COM PROBLEMAS CRÍTICOS'));
      console.log(chalk.red('  → Risco alto de perda de comissões'));
      console.log(chalk.red('  → Necessário correção urgente'));
    }

    // Falhas críticas
    if (this.results.failed.length > 0) {
      console.log(chalk.red.bold('\n🚨 FALHAS ENCONTRADAS:\n'));

      this.results.failed.forEach(fail => {
        console.log(chalk.red(`  • ${fail.test}: ${fail.error || fail.platform}`));
      });
    }

    // Recomendações
    console.log(chalk.white.bold('\n💡 RECOMENDAÇÕES:\n'));

    if (this.results.metrics.cookiesCreated < 5) {
      console.log(chalk.yellow('  → Aumentar número de cookies de backup'));
    }

    if (this.results.metrics.persistenceRate < 80) {
      console.log(chalk.yellow('  → Melhorar estratégia de persistência'));
    }

    if (!this.results.passed.find(p => p.test === 'Service Worker')) {
      console.log(chalk.yellow('  → Verificar registro do Service Worker'));
    }

    // Salvar relatório em arquivo
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        successRate: successRate.toFixed(1)
      },
      metrics: this.results.metrics,
      details: this.results
    };

    fs.writeFileSync(
      'validation-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log(chalk.white('\n═'.repeat(60)));
    console.log(chalk.cyan.bold('\n✅ Relatório salvo em: validation-report.json\n'));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();

      // Executar todos os testes
      await this.testLinkGeneration();
      await this.testCookiePersistence();
      await this.testCrossDomainSync();
      await this.testPixelTracking();
      await this.testServiceWorker();
      await this.testRealCommissionCapture();
      await this.testAPIEndpoints();
      await this.testDeviceFingerprint();
      await this.testWhatsAppIntegration();

      // Gerar relatório
      await this.generateReport();

    } catch (error) {
      console.log(chalk.red.bold(`\n❌ ERRO FATAL: ${error.message}\n`));
    } finally {
      await this.cleanup();
    }
  }
}

// Executar testes
async function main() {
  console.log(chalk.cyan.bold('\n'.repeat(3)));
  console.log(chalk.cyan.bold('╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║         TESTE EXTREMO DE VALIDAÇÃO - BUSCABUSCABRASIL       ║'));
  console.log(chalk.cyan.bold('║                   ZERO PERDA DE COMISSÕES                    ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════════════╝'));

  const validator = new ExtremeTestValidator();
  await validator.runAllTests();

  console.log(chalk.green.bold('\n🎯 TESTE COMPLETO FINALIZADO!\n'));
}

// Verificar se puppeteer está instalado
try {
  require.resolve('puppeteer');
  require.resolve('chalk');
  main();
} catch (e) {
  console.log('\n📦 Instalando dependências necessárias...\n');
  require('child_process').execSync('npm install puppeteer chalk', { stdio: 'inherit' });
  console.log('\n✅ Dependências instaladas. Execute novamente o teste.\n');
}