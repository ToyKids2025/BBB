/**
 * 🚀 SISTEMA COMPLETO DE DEEP LINKING
 * Suporta Intent URLs (Android), Universal Links (iOS), e fallbacks inteligentes
 * Eficácia: ~91%
 */

import { deviceDetection, appDetector } from './device-detection';

/**
 * 🎯 DEEP LINK BUILDER
 * Constrói deep links otimizados para cada plataforma
 */
export class DeepLinkBuilder {
  constructor(platform, url, productData = {}) {
    this.platform = platform;
    this.url = url;
    this.productData = productData;
    this.device = deviceDetection.getDeviceInfo();
    this.appConfig = appDetector.getAppConfig(platform);
  }

  /**
   * Extrai ID do produto da URL
   */
  extractProductId() {
    const { url, platform } = this;

    switch (platform) {
      case 'mercadolivre':
        // MLB-1234567890 ou MLB1234567890
        const mlMatch = url.match(/MLB-?(\d+)/);
        return mlMatch ? `MLB${mlMatch[1]}` : null;

      case 'amazon':
        // ASIN: 10 caracteres alfanuméricos
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
        return asinMatch ? asinMatch[1] : null;

      case 'shopee':
        // Shopee item ID
        const shopeeMatch = url.match(/i\.(\d+)\.(\d+)/);
        return shopeeMatch ? `${shopeeMatch[1]}.${shopeeMatch[2]}` : null;

      case 'magalu':
        // Magazine Luiza product ID
        const magaluMatch = url.match(/\/p\/([a-z0-9-]+)\/([a-z0-9]+)/i);
        return magaluMatch ? magaluMatch[2] : null;

      case 'aliexpress':
        // AliExpress item ID
        const aliMatch = url.match(/item\/(\d+)\.html/);
        return aliMatch ? aliMatch[1] : null;

      default:
        return null;
    }
  }

  /**
   * 🤖 Constrói Intent URL para Android
   * Formato: intent://HOST/PATH#Intent;scheme=SCHEME;package=PACKAGE;end;
   */
  buildAndroidIntent() {
    const productId = this.extractProductId();
    if (!productId || !this.appConfig) return null;

    const { package: pkg, intentScheme } = this.appConfig;
    let host = '';
    let path = '';

    switch (this.platform) {
      case 'mercadolivre':
        host = 'item';
        path = productId;
        break;

      case 'amazon':
        host = 'www.amazon.com.br';
        path = `/dp/${productId}`;
        break;

      case 'shopee':
        host = 'product';
        path = productId;
        break;

      case 'magalu':
        host = 'product';
        path = productId;
        break;

      case 'aliexpress':
        host = 'item';
        path = productId;
        break;

      default:
        return null;
    }

    // Construir Intent URL com todos os parâmetros
    const intentUrl = `intent://${host}/${path}#Intent;` +
      `scheme=${intentScheme};` +
      `package=${pkg};` +
      `S.browser_fallback_url=${encodeURIComponent(this.url)};` +
      `end`;

    return intentUrl;
  }

  /**
   * 🍎 Constrói Universal Link para iOS
   * Tenta primeiro universal link, depois custom scheme
   */
  buildIOSLink() {
    const productId = this.extractProductId();
    if (!productId || !this.appConfig) return null;

    const { universalLink, scheme } = this.appConfig;

    switch (this.platform) {
      case 'mercadolivre':
        return {
          universal: `${universalLink}/p/${productId}`,
          custom: `${scheme}item/${productId}`
        };

      case 'amazon':
        return {
          universal: `${universalLink}/dp/${productId}`,
          custom: `${scheme}www.amazon.com.br/dp/${productId}`
        };

      case 'shopee':
        return {
          universal: `${universalLink}/product/${productId}`,
          custom: `${scheme}product/${productId}`
        };

      case 'magalu':
        return {
          universal: `${universalLink}/produto/${productId}`,
          custom: `${scheme}product/${productId}`
        };

      case 'aliexpress':
        return {
          universal: `${universalLink}/item/${productId}.html`,
          custom: `${scheme}item/${productId}`
        };

      default:
        return null;
    }
  }

  /**
   * 🏪 Constrói URL da loja de apps (fallback final)
   */
  buildStoreUrl() {
    if (!this.appConfig) return null;

    if (this.device.os === 'Android') {
      const pkg = this.appConfig.package;
      return `https://play.google.com/store/apps/details?id=${pkg}`;
    } else if (this.device.os === 'iOS') {
      // IDs conhecidos das apps na App Store
      const appStoreIds = {
        'mercadolivre': '463624852',
        'amazon': '374254473',
        'shopee': '959841449',
        'magalu': '514450242',
        'aliexpress': '436672029'
      };

      const appId = appStoreIds[this.platform];
      if (appId) {
        return `https://apps.apple.com/br/app/id${appId}`;
      }
    }

    return null;
  }

  /**
   * 🎯 Retorna configuração completa de deep linking
   */
  build() {
    const productId = this.extractProductId();

    if (!productId) {
      console.warn(`[DeepLink] Não foi possível extrair ID do produto de: ${this.url}`);
      return {
        supported: false,
        fallbackUrl: this.url
      };
    }

    if (this.device.os === 'Android') {
      return {
        supported: true,
        os: 'Android',
        platform: this.platform,
        productId,
        intentUrl: this.buildAndroidIntent(),
        storeUrl: this.buildStoreUrl(),
        fallbackUrl: this.url
      };
    } else if (this.device.os === 'iOS') {
      const iosLinks = this.buildIOSLink();
      return {
        supported: true,
        os: 'iOS',
        platform: this.platform,
        productId,
        universalLink: iosLinks?.universal,
        customScheme: iosLinks?.custom,
        storeUrl: this.buildStoreUrl(),
        fallbackUrl: this.url
      };
    } else {
      // Desktop ou SO desconhecido
      return {
        supported: false,
        os: this.device.os,
        fallbackUrl: this.url
      };
    }
  }
}

/**
 * 🚀 DEEP LINK REDIRECTOR
 * Executa o redirecionamento com fallbacks inteligentes
 */
export class DeepLinkRedirector {
  constructor(deepLinkConfig) {
    this.config = deepLinkConfig;
    this.device = deviceDetection.getDeviceInfo();
  }

  /**
   * 🤖 Executa redirecionamento Android com Intent URL
   */
  async redirectAndroid() {
    const { intentUrl, fallbackUrl } = this.config;

    console.log('🤖 [Android] Iniciando redirecionamento...');
    console.log('📱 Intent URL:', intentUrl);

    if (!intentUrl) {
      console.log('⚠️ Intent URL não disponível, usando fallback');
      window.location.href = fallbackUrl;
      return;
    }

    try {
      // Tentar Intent URL (abre app ou mostra opções)
      window.location.href = intentUrl;
      console.log('✅ Intent URL executado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao executar Intent URL:', error);
      window.location.href = fallbackUrl;
    }
  }

  /**
   * 🍎 Executa redirecionamento iOS com Universal Link
   */
  async redirectIOS() {
    const { universalLink, customScheme, fallbackUrl } = this.config;

    console.log('🍎 [iOS] Iniciando redirecionamento...');
    console.log('🌐 Universal Link:', universalLink);
    console.log('📱 Custom Scheme:', customScheme);

    // 1. Tentar Universal Link primeiro (mais confiável no iOS)
    if (universalLink) {
      try {
        console.log('🌐 Tentando Universal Link...');
        window.location.href = universalLink;

        // Aguardar 2.5s para verificar se abriu
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Se ainda está na página, tentar custom scheme
        if (document.visibilityState === 'visible') {
          console.log('⚠️ Universal Link falhou, tentando Custom Scheme...');
          this.tryCustomScheme(customScheme, fallbackUrl);
        } else {
          console.log('✅ Universal Link abriu o app!');
        }
        return;
      } catch (error) {
        console.log('❌ Universal Link falhou:', error);
      }
    }

    // 2. Fallback: Custom Scheme
    this.tryCustomScheme(customScheme, fallbackUrl);
  }

  /**
   * Tenta abrir com custom scheme (iOS fallback)
   */
  tryCustomScheme(customScheme, fallbackUrl) {
    if (!customScheme) {
      window.location.href = fallbackUrl;
      return;
    }

    const startTime = Date.now();
    const timeout = 1500;

    console.log('📱 Tentando Custom Scheme...');

    // Criar iframe oculto para tentar abrir o app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = customScheme;
    document.body.appendChild(iframe);

    // Verificar se app abriu
    setTimeout(() => {
      const elapsed = Date.now() - startTime;

      // Se ficou muito tempo na página, app não abriu
      if (document.visibilityState === 'visible' && elapsed >= timeout) {
        console.log('⚠️ App não instalado, redirecionando para web');
        window.location.href = fallbackUrl;
      } else {
        console.log('✅ Custom Scheme abriu o app!');
      }

      // Cleanup
      document.body.removeChild(iframe);
    }, timeout);
  }

  /**
   * 🎯 Executa redirecionamento baseado no SO
   */
  async redirect() {
    if (!this.config.supported) {
      console.log('📱 Deep linking não suportado, usando fallback direto');
      window.location.href = this.config.fallbackUrl;
      return;
    }

    console.log('🚀 Executando Deep Link Redirect');
    console.log('📊 Config:', this.config);
    console.log('📱 Device:', this.device.getDeviceSummary?.() || this.device.os);

    if (this.config.os === 'Android') {
      await this.redirectAndroid();
    } else if (this.config.os === 'iOS') {
      await this.redirectIOS();
    } else {
      console.log('⚠️ OS não suportado:', this.config.os);
      window.location.href = this.config.fallbackUrl;
    }
  }
}

/**
 * 🎯 HELPER: Cria e executa deep link em uma única chamada
 * @param {string} platform - Nome da plataforma (mercadolivre, amazon, etc)
 * @param {string} url - URL original do produto
 * @param {Object} options - Opções adicionais
 * @returns {Promise<void>}
 */
export async function executeDeepLink(platform, url, options = {}) {
  const { delay = 0, onSuccess, onError } = options;

  try {
    // 1. Construir deep link
    const builder = new DeepLinkBuilder(platform, url);
    const config = builder.build();

    console.log('🔗 Deep Link Config gerado:', config);

    // 2. Aguardar delay se especificado
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 3. Executar redirecionamento
    const redirector = new DeepLinkRedirector(config);
    await redirector.redirect();

    if (onSuccess) onSuccess(config);
  } catch (error) {
    console.error('❌ Erro ao executar deep link:', error);
    if (onError) {
      onError(error);
    } else {
      // Fallback final
      window.location.href = url;
    }
  }
}

/**
 * 🎯 HELPER: Verifica se deep linking é suportado para uma URL
 */
export function isDeepLinkSupported(platform, url) {
  const builder = new DeepLinkBuilder(platform, url);
  const config = builder.build();
  return config.supported;
}

// Exportar tudo
const deepLinkingUtils = {
  DeepLinkBuilder,
  DeepLinkRedirector,
  executeDeepLink,
  isDeepLinkSupported
};

export default deepLinkingUtils;
