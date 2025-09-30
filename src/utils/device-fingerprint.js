/**
 * Device Fingerprinting Avançado
 * Identifica usuários únicos mesmo sem cookies
 */

// import { sha256 } from './crypto-utils'; // Não utilizado

class DeviceFingerprint {
  constructor() {
    this.fingerprint = null;
    this.components = {};
  }

  /**
   * Gerar fingerprint completo do dispositivo
   */
  async generate() {
    const components = await this.collectComponents();
    this.components = components;

    // Criar hash único combinando todos os componentes
    const fingerprintString = JSON.stringify(components);
    this.fingerprint = await this.hash(fingerprintString);

    // Salvar no localStorage como backup
    this.saveFingerprint();

    return {
      id: this.fingerprint,
      components: components,
      confidence: this.calculateConfidence(components)
    };
  }

  /**
   * Coletar todos os componentes do dispositivo
   */
  async collectComponents() {
    const components = {};

    // 1. User Agent e plataforma
    components.userAgent = navigator.userAgent;
    components.platform = navigator.platform;
    components.vendor = navigator.vendor;

    // 2. Resolução e características da tela
    components.screen = {
      width: window.screen.width,
      height: window.screen.height,
      depth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      orientation: window.screen.orientation?.type
    };

    // 3. Timezone e linguagem
    components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    components.timezoneOffset = new Date().getTimezoneOffset();
    components.language = navigator.language;
    components.languages = navigator.languages;

    // 4. Hardware
    components.hardware = {
      cpuCores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints
    };

    // 5. Canvas Fingerprinting
    components.canvas = await this.getCanvasFingerprint();

    // 6. WebGL Fingerprinting
    components.webgl = this.getWebGLFingerprint();

    // 7. Audio Fingerprinting
    components.audio = await this.getAudioFingerprint();

    // 8. Fontes instaladas (usando técnica de detecção)
    components.fonts = this.detectFonts();

    // 9. Plugins do navegador
    components.plugins = this.getPlugins();

    // 10. Características do navegador
    components.browser = {
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      online: navigator.onLine,
      sessionStorage: this.testStorage('sessionStorage'),
      localStorage: this.testStorage('localStorage'),
      indexedDB: !!window.indexedDB,
      webRTC: this.hasWebRTC(),
      webSockets: 'WebSocket' in window,
      webWorkers: 'Worker' in window
    };

    // 11. Media devices
    components.mediaDevices = await this.getMediaDevices();

    // 12. Battery API (se disponível)
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        components.battery = {
          charging: battery.charging,
          level: battery.level,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      } catch (e) {}
    }

    // 13. Connection info
    if ('connection' in navigator) {
      components.connection = {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink,
        saveData: navigator.connection.saveData
      };
    }

    // 14. Permissions API
    components.permissions = await this.checkPermissions();

    // 15. Sensor APIs
    components.sensors = {
      accelerometer: 'Accelerometer' in window,
      gyroscope: 'Gyroscope' in window,
      magnetometer: 'Magnetometer' in window,
      proximity: 'onuserproximity' in window
    };

    return components;
  }

  /**
   * Canvas Fingerprinting - Único para cada dispositivo
   */
  async getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 280;
    canvas.height = 60;

    // Desenhar texto com várias fontes e estilos
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.font = '11pt Arial';
    ctx.fillText('Canvas fingerprint', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('BuscaBuscaBrasil', 4, 45);

    // Adicionar emoji para mais entropia
    ctx.font = '20pt Arial';
    ctx.fillText('🔒💰🎯', 200, 45);

    // Converter para base64
    return canvas.toDataURL();
  }

  /**
   * WebGL Fingerprinting
   */
  getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      vendorUnmasked: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
      rendererUnmasked: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      version: gl.getParameter(gl.VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      redBits: gl.getParameter(gl.RED_BITS),
      greenBits: gl.getParameter(gl.GREEN_BITS),
      blueBits: gl.getParameter(gl.BLUE_BITS),
      alphaBits: gl.getParameter(gl.ALPHA_BITS),
      depthBits: gl.getParameter(gl.DEPTH_BITS),
      stencilBits: gl.getParameter(gl.STENCIL_BITS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      extensions: gl.getSupportedExtensions()
    };
  }

  /**
   * Audio Fingerprinting
   */
  async getAudioFingerprint() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;

      // Usar OfflineAudioContext em vez de AudioContext para evitar warnings
      const context = new OfflineAudioContext(1, 5000, 44100);
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const compressor = context.createDynamicsCompressor();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;

      // Configurar compressor para fingerprinting
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      const renderedBuffer = await context.startRendering();
      const samples = renderedBuffer.getChannelData(0);

      let sum = 0;
      for (let i = 4500; i < samples.length; i++) {
        sum += Math.abs(samples[i]);
      }

      return sum.toString();
    } catch (e) {
      return null;
    }
  }

  /**
   * Detectar fontes instaladas
   */
  detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New',
      'Georgia', 'Palatino', 'Garamond', 'Bookman',
      'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'mmmmmmmmmmlli';
    const textSize = '72px';

    const detectedFonts = [];

    baseFonts.forEach(baseFont => {
      ctx.font = `${textSize} ${baseFont}`;
      const baseWidth = ctx.measureText(text).width;

      testFonts.forEach(testFont => {
        ctx.font = `${textSize} ${testFont}, ${baseFont}`;
        const width = ctx.measureText(text).width;

        if (width !== baseWidth) {
          detectedFonts.push(testFont);
        }
      });
    });

    return [...new Set(detectedFonts)];
  }

  /**
   * Obter plugins do navegador
   */
  getPlugins() {
    const plugins = [];

    if (navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        plugins.push({
          name: plugin.name,
          description: plugin.description,
          filename: plugin.filename,
          version: plugin.version
        });
      }
    }

    return plugins;
  }

  /**
   * Testar disponibilidade de storage
   */
  testStorage(type) {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Verificar WebRTC
   */
  hasWebRTC() {
    return !!(
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    );
  }

  /**
   * Obter dispositivos de mídia
   */
  async getMediaDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return null;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      return {
        audioinput: devices.filter(d => d.kind === 'audioinput').length,
        audiooutput: devices.filter(d => d.kind === 'audiooutput').length,
        videoinput: devices.filter(d => d.kind === 'videoinput').length
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Verificar permissões
   */
  async checkPermissions() {
    const permissions = {};
    const permissionsToCheck = [
      'geolocation',
      'notifications',
      'camera',
      'microphone'
    ];

    for (const permission of permissionsToCheck) {
      try {
        const result = await navigator.permissions.query({ name: permission });
        permissions[permission] = result.state;
      } catch (e) {
        permissions[permission] = 'error';
      }
    }

    return permissions;
  }

  /**
   * Calcular hash SHA-256
   */
  async hash(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calcular nível de confiança do fingerprint
   */
  calculateConfidence(components) {
    let score = 0;
    let maxScore = 0;

    // Pontuação baseada na disponibilidade de componentes
    const weights = {
      canvas: 20,
      webgl: 15,
      audio: 15,
      fonts: 10,
      screen: 10,
      hardware: 10,
      mediaDevices: 5,
      battery: 5,
      connection: 5,
      permissions: 5
    };

    for (const [key, weight] of Object.entries(weights)) {
      maxScore += weight;
      if (components[key] && components[key] !== null) {
        score += weight;
      }
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Salvar fingerprint no localStorage
   */
  saveFingerprint() {
    try {
      localStorage.setItem('device_fingerprint', JSON.stringify({
        id: this.fingerprint,
        timestamp: Date.now(),
        components: this.components
      }));
    } catch (e) {
      console.error('Erro ao salvar fingerprint:', e);
    }
  }

  /**
   * Carregar fingerprint salvo
   */
  loadFingerprint() {
    try {
      const saved = localStorage.getItem('device_fingerprint');
      if (saved) {
        const data = JSON.parse(saved);
        // Verificar se não está muito antigo (30 dias)
        if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) {
          this.fingerprint = data.id;
          this.components = data.components;
          return data;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar fingerprint:', e);
    }
    return null;
  }

  /**
   * Obter ou criar fingerprint
   */
  async get() {
    // Tentar carregar fingerprint existente
    const saved = this.loadFingerprint();
    if (saved) {
      return saved;
    }

    // Gerar novo fingerprint
    return await this.generate();
  }
}

// Exportar instância única
export const deviceFingerprint = new DeviceFingerprint();

// Helper para usar em componentes React
export async function getDeviceId() {
  const fp = await deviceFingerprint.get();
  return fp.id;
}

// Função para rastrear dispositivo
export async function trackDevice(eventType, data = {}) {
  const fp = await deviceFingerprint.get();

  const trackingData = {
    deviceId: fp.id,
    confidence: fp.confidence,
    eventType,
    timestamp: Date.now(),
    ...data
  };

  // Salvar no localStorage para análise
  try {
    const history = JSON.parse(localStorage.getItem('device_tracking') || '[]');
    history.push(trackingData);

    // Manter apenas últimos 100 eventos
    if (history.length > 100) {
      history.shift();
    }

    localStorage.setItem('device_tracking', JSON.stringify(history));
  } catch (e) {}

  return trackingData;
}