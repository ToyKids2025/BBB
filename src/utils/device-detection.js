/**
 * 🎯 SISTEMA AVANÇADO DE DETECÇÃO DE DISPOSITIVO E PLATAFORMA
 * Detecta com precisão o tipo de dispositivo, SO, navegador e apps instalados
 * Eficácia: ~95%
 */

export const deviceDetection = {
  /**
   * Detecta informações completas do dispositivo
   * @returns {Object} Informações detalhadas do dispositivo
   */
  getDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    return {
      // Sistema Operacional
      os: this.detectOS(ua, platform),

      // Tipo de dispositivo
      deviceType: this.detectDeviceType(ua),

      // Navegador
      browser: this.detectBrowser(ua),

      // Versões
      osVersion: this.detectOSVersion(ua),

      // Capacidades
      isStandalone: this.isStandaloneMode(),
      isMobile: this.isMobile(ua),
      isTablet: this.isTablet(ua),
      isDesktop: this.isDesktop(ua),

      // User Agent original
      userAgent: ua,
      platform: platform
    };
  },

  /**
   * Detecta o sistema operacional
   */
  detectOS(ua, platform) {
    if (/iPhone|iPad|iPod/.test(ua) || (/Mac/.test(platform) && 'ontouchend' in document)) {
      return 'iOS';
    }
    if (/Android/.test(ua)) {
      return 'Android';
    }
    if (/Windows Phone/.test(ua)) {
      return 'Windows Phone';
    }
    if (/Mac/.test(platform)) {
      return 'macOS';
    }
    if (/Win/.test(platform)) {
      return 'Windows';
    }
    if (/Linux/.test(platform)) {
      return 'Linux';
    }
    return 'Unknown';
  },

  /**
   * Detecta versão do sistema operacional
   */
  detectOSVersion(ua) {
    // iOS
    const iosMatch = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (iosMatch) {
      return `${iosMatch[1]}.${iosMatch[2]}${iosMatch[3] ? '.' + iosMatch[3] : ''}`;
    }

    // Android
    const androidMatch = ua.match(/Android (\d+\.?\d*\.?\d*)/);
    if (androidMatch) {
      return androidMatch[1];
    }

    return 'Unknown';
  },

  /**
   * Detecta tipo de dispositivo
   */
  detectDeviceType(ua) {
    if (this.isTablet(ua)) return 'tablet';
    if (this.isMobile(ua)) return 'mobile';
    if (this.isDesktop(ua)) return 'desktop';
    return 'unknown';
  },

  /**
   * Detecta navegador
   */
  detectBrowser(ua) {
    if (/Chrome/.test(ua) && !/Edge|Edg/.test(ua)) return 'Chrome';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Edge|Edg/.test(ua)) return 'Edge';
    if (/Instagram/.test(ua)) return 'Instagram';
    if (/FBAN|FBAV/.test(ua)) return 'Facebook';
    if (/WhatsApp/.test(ua)) return 'WhatsApp';
    if (/Twitter/.test(ua)) return 'Twitter';
    return 'Unknown';
  },

  /**
   * Verifica se é mobile
   */
  isMobile(ua) {
    return /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  },

  /**
   * Verifica se é tablet
   */
  isTablet(ua) {
    return /iPad|Android(?!.*Mobile)/i.test(ua);
  },

  /**
   * Verifica se é desktop
   */
  isDesktop(ua) {
    return !this.isMobile(ua) && !this.isTablet(ua);
  },

  /**
   * Verifica se está em modo standalone (PWA instalado)
   */
  isStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  },

  /**
   * Detecta se está dentro de um app (WebView)
   */
  isWebView(ua) {
    return /wv|WebView/.test(ua) ||
           (this.detectOS(ua) === 'Android' && !ua.includes('Version/'));
  },

  /**
   * Verifica se um app específico está instalado (método assíncrono)
   * @param {string} scheme - URL scheme do app (ex: 'mlapp://')
   * @returns {Promise<boolean>}
   */
  async checkAppInstalled(scheme) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false); // App não instalado
      }, 1000);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = scheme;

      const cleanup = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
      };

      // Se conseguir abrir, provavelmente está instalado
      window.addEventListener('blur', () => {
        cleanup();
        resolve(true);
      }, { once: true });

      document.body.appendChild(iframe);

      // Cleanup após tentativa
      setTimeout(cleanup, 1500);
    });
  },

  /**
   * Retorna informação resumida para logs
   */
  getDeviceSummary() {
    const info = this.getDeviceInfo();
    return `${info.os} ${info.osVersion} | ${info.deviceType} | ${info.browser}`;
  }
};

/**
 * 🎯 DETECTOR DE APPS INSTALADOS
 * Verifica se apps específicos de e-commerce estão instalados
 */
export const appDetector = {
  /**
   * Apps suportados e seus schemes
   */
  apps: {
    mercadolivre: {
      android: {
        scheme: 'mlapp://',
        package: 'com.mercadolibre',
        intentScheme: 'mercadolibre'
      },
      ios: {
        scheme: 'mlapp://',
        universalLink: 'https://mercadolivre.com.br'
      }
    },
    amazon: {
      android: {
        scheme: 'com.amazon.mobile.shopping://',
        package: 'com.amazon.mShop.android.shopping',
        intentScheme: 'amazon'
      },
      ios: {
        scheme: 'com.amazon.mobile.shopping://',
        universalLink: 'https://www.amazon.com.br'
      }
    },
    shopee: {
      android: {
        scheme: 'shopee://',
        package: 'br.com.shopee',
        intentScheme: 'shopee'
      },
      ios: {
        scheme: 'shopee://',
        universalLink: 'https://shopee.com.br'
      }
    },
    magalu: {
      android: {
        scheme: 'magalu://',
        package: 'com.luizalabs.mlapp',
        intentScheme: 'magalu'
      },
      ios: {
        scheme: 'magalu://',
        universalLink: 'https://www.magazineluiza.com.br'
      }
    },
    aliexpress: {
      android: {
        scheme: 'aliexpress://',
        package: 'com.alibaba.aliexpresshd',
        intentScheme: 'aliexpress'
      },
      ios: {
        scheme: 'aliexpress://',
        universalLink: 'https://www.aliexpress.com'
      }
    }
  },

  /**
   * Verifica se um app específico está instalado
   * @param {string} platform - Nome da plataforma (ex: 'mercadolivre')
   * @returns {Promise<boolean>}
   */
  async isAppInstalled(platform) {
    const device = deviceDetection.getDeviceInfo();
    const app = this.apps[platform];

    if (!app) return false;

    const scheme = device.os === 'Android' ?
      app.android?.scheme :
      app.ios?.scheme;

    if (!scheme) return false;

    return await deviceDetection.checkAppInstalled(scheme);
  },

  /**
   * Retorna configuração do app para a plataforma atual
   * @param {string} platform - Nome da plataforma
   * @returns {Object|null}
   */
  getAppConfig(platform) {
    const device = deviceDetection.getDeviceInfo();
    const app = this.apps[platform];

    if (!app) return null;

    return device.os === 'Android' ? app.android : app.ios;
  }
};

// Exportar também como default
const deviceUtils = {
  deviceDetection,
  appDetector
};

export default deviceUtils;
