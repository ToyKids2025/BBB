/**
 * 🔥 ETERNAL TRACKING SYSTEM - PERSISTÊNCIA 90+ DIAS
 * Sistema de tracking mais avançado já criado
 * Nunca perde atribuição, mesmo após meses
 */

import { sha256 } from './crypto-utils';

// Configurações de persistência
const PERSISTENCE_CONFIG = {
  cookieDurations: [
    { name: 'bb_ref', days: 90 },
    { name: 'bb_ref_backup', days: 180 },
    { name: 'bb_ref_eternal', days: 365 },
    { name: 'bb_ref_lifetime', days: 3650 }, // 10 anos
    { name: '_bbb', days: 120 },
    { name: 'bref', days: 150 },
    { name: 'src_ref', days: 200 },
    { name: 'uid_bb', days: 365 }
  ],
  storageKeys: [
    'bb_ref', '_bbb', 'utm_ref', 'user_ref', 'click_data',
    'attribution', 'fingerprint', 'device_id', 'session_ref'
  ]
};

/**
 * 1. COOKIE CHAIN - Múltiplos cookies com durações diferentes
 */
export class CookieChain {
  constructor(clickData) {
    this.clickData = clickData;
    this.clickId = this.generateClickId();
  }

  generateClickId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setMultiLayerCookies() {
    const data = JSON.stringify({
      ...this.clickData,
      clickId: this.clickId,
      timestamp: Date.now()
    });

    // Criar múltiplos cookies com durações diferentes
    PERSISTENCE_CONFIG.cookieDurations.forEach(config => {
      this.setCookie(config.name, data, config.days);

      // Versão encoded
      this.setCookie(`${config.name}_enc`, btoa(data), config.days);

      // Versão com hash
      this.setCookie(`${config.name}_h`, this.hashData(data), config.days);
    });

    // Cookies com nomes aleatórios (dificulta bloqueio)
    const randomNames = this.generateRandomCookieNames(10);
    randomNames.forEach(name => {
      this.setCookie(name, this.clickId, 180);
    });

    // Super cookie com todos os dados
    this.createSuperCookie(data);
  }

  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    const cookieOptions = [
      `${name}=${encodeURIComponent(value)}`,
      `expires=${date.toUTCString()}`,
      'path=/',
      'Secure',
      'SameSite=Lax'
    ];

    document.cookie = cookieOptions.join('; ');

    // Backup com diferentes configurações
    document.cookie = `${name}_backup=${value}; max-age=${days * 24 * 60 * 60}; path=/`;
  }

  createSuperCookie(data) {
    // Cookie que se regenera automaticamente
    const superCookieScript = `
      (function() {
        const data = '${data}';
        const check = setInterval(() => {
          if (!document.cookie.includes('bb_super')) {
            document.cookie = 'bb_super=' + data + '; max-age=31536000; path=/';
          }
        }, 60000); // Verifica a cada minuto
      })();
    `;

    const script = document.createElement('script');
    script.textContent = superCookieScript;
    document.head.appendChild(script);
  }

  generateRandomCookieNames(count) {
    const prefixes = ['_', 's_', 'u_', 'ref_', 'id_', 'tk_', 'data_'];
    const suffixes = ['bb', 'ref', 'id', 'uid', 'sid', 'tid', 'cid'];
    const names = [];

    for (let i = 0; i < count; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      names.push(`${prefix}${suffix}${i}`);
    }

    return names;
  }

  hashData(data) {
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }
}

/**
 * 2. FINGERPRINTING ETERNO - Identificação única do dispositivo
 */
export class EternalFingerprint {
  constructor() {
    this.fingerprint = null;
  }

  async generate() {
    const fp = {
      // Informações básicas do dispositivo
      screen: this.getScreenFingerprint(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages.join(','),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      cores: navigator.hardwareConcurrency || 0,
      memory: navigator.deviceMemory || 0,

      // Canvas fingerprint (único por dispositivo)
      canvas: await this.getCanvasFingerprint(),

      // WebGL fingerprint
      webgl: this.getWebGLFingerprint(),

      // Audio fingerprint
      audio: await this.getAudioFingerprint(),

      // Font detection
      fonts: this.detectInstalledFonts(),

      // Plugins
      plugins: this.getPlugins(),

      // Media devices
      mediaDevices: await this.getMediaDevices(),

      // Battery info (se disponível)
      battery: await this.getBatteryInfo(),

      // Connection info
      connection: this.getConnectionInfo(),

      // Criar timestamp e ID único
      timestamp: Date.now(),
      uniqueId: this.generateUniqueId()
    };

    this.fingerprint = fp;
    await this.saveEverywhere(fp);

    return this.hashFingerprint(fp);
  }

  getScreenFingerprint() {
    const screen = window.screen;
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: screen.orientation?.type || 'unknown'
    };
  }

  async getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 50;

    // Texto com múltiplas fontes e estilos
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.font = '11pt no-real-font-123';
    ctx.fillText('BBB Tracking 🔥💰', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('BuscaBuscaBrasil', 4, 45);

    // Formas geométricas
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Gradiente
    const gradient = ctx.createLinearGradient(0, 0, 200, 50);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 50);

    // Converter para base64
    return canvas.toDataURL();
  }

  getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      vendor: gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR),
      renderer: gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
    };
  }

  async getAudioFingerprint() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();

      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mudo
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const fingerprint = event.inputBuffer.getChannelData(0)
            .slice(0, 100)
            .reduce((acc, val) => acc + Math.abs(val), 0);

          oscillator.disconnect();
          analyser.disconnect();
          scriptProcessor.disconnect();
          gainNode.disconnect();
          context.close();

          resolve(fingerprint.toString());
        };
      });
    } catch (error) {
      return 'audio-not-available';
    }
  }

  detectInstalledFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.getElementsByTagName('body')[0];

    const s = document.createElement('span');
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    const defaultWidths = {};

    for (const baseFont of baseFonts) {
      s.style.fontFamily = baseFont;
      h.appendChild(s);
      defaultWidths[baseFont] = s.offsetWidth;
      h.removeChild(s);
    }

    const fontsToDetect = [
      'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New',
      'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond',
      'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Impact'
    ];

    const detectedFonts = [];

    for (const font of fontsToDetect) {
      for (const baseFont of baseFonts) {
        s.style.fontFamily = `'${font}',${baseFont}`;
        h.appendChild(s);
        const width = s.offsetWidth;
        h.removeChild(s);

        if (width !== defaultWidths[baseFont]) {
          detectedFonts.push(font);
          break;
        }
      }
    }

    return detectedFonts.join(',');
  }

  getPlugins() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins.join(',');
  }

  async getMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map(d => ({
        kind: d.kind,
        label: d.label ? 'available' : 'not-available',
        deviceId: d.deviceId ? 'present' : 'not-present'
      }));
    } catch (error) {
      return 'media-devices-not-available';
    }
  }

  async getBatteryInfo() {
    try {
      const battery = await navigator.getBattery();
      return {
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        level: battery.level
      };
    } catch (error) {
      return 'battery-not-available';
    }
  }

  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'connection-not-available';

    return {
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      downlink: connection.downlink,
      saveData: connection.saveData
    };
  }

  generateUniqueId() {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  async saveEverywhere(data) {
    const jsonData = JSON.stringify(data);
    const dataKey = 'bb_fingerprint';

    // 1. LocalStorage (múltiplas chaves)
    PERSISTENCE_CONFIG.storageKeys.forEach(key => {
      try {
        localStorage.setItem(key, jsonData);
        localStorage.setItem(`${key}_backup`, btoa(jsonData));
      } catch (e) {}
    });

    // 2. SessionStorage (backup)
    try {
      sessionStorage.setItem(dataKey, jsonData);
    } catch (e) {}

    // 3. IndexedDB (mais persistente)
    await this.saveToIndexedDB('BBBTracking', 'fingerprints', data);
    await this.saveToIndexedDB('UserData', 'preferences', data); // Nome inocente

    // 4. Cache API (service worker)
    if ('caches' in window) {
      try {
        const cache = await caches.open('bbb-eternal-cache');
        await cache.put('/fingerprint', new Response(jsonData));
      } catch (e) {}
    }

    // 5. Window.name (persiste entre domínios!)
    window.name = btoa(jsonData.substr(0, 1000)); // Limitar tamanho

    // 6. History state
    history.replaceState(data, '', location.href);

    // 7. Criar Web Worker para persistência
    this.createPersistenceWorker(jsonData);
  }

  async saveToIndexedDB(dbName, storeName, data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put({ id: 'fingerprint', data: data, timestamp: Date.now() });
        transaction.oncomplete = () => resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  createPersistenceWorker(data) {
    const workerCode = `
      const data = '${data}';

      // Re-salvar dados a cada 5 minutos
      setInterval(() => {
        self.postMessage({ action: 'persist', data: data });
      }, 5 * 60 * 1000);

      // Responder a requests
      self.addEventListener('message', (event) => {
        if (event.data.action === 'get') {
          self.postMessage({ action: 'data', data: data });
        }
      });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.addEventListener('message', (event) => {
      if (event.data.action === 'persist') {
        // Re-salvar em localStorage quando worker enviar
        localStorage.setItem('bb_worker_data', event.data.data);
      }
    });
  }

  hashFingerprint(fp) {
    const str = JSON.stringify(fp);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * 3. PIXEL TRACKING PERPÉTUO
 */
export class EternalPixelTracker {
  constructor(clickId, baseUrl = 'https://buscabuscabrasil.com.br') {
    this.clickId = clickId;
    this.baseUrl = baseUrl;
    this.pixels = [];
  }

  createEternalPixel() {
    // Pixel principal que se auto-recarrega
    const pixel = document.createElement('img');
    pixel.src = `${this.baseUrl}/p.gif?id=${this.clickId}&t=${Date.now()}`;
    pixel.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;';
    pixel.loading = 'eager';
    pixel.decoding = 'async';

    // Auto-recarregar a cada 30 segundos
    const reloadPixel = () => {
      pixel.src = `${this.baseUrl}/p.gif?id=${this.clickId}&t=${Date.now()}&r=${Math.random()}`;
    };

    pixel.onerror = pixel.onload = () => {
      setTimeout(reloadPixel, 30000);
    };

    document.body.appendChild(pixel);
    this.pixels.push(pixel);

    // Criar múltiplos pixels backup
    this.createBackupPixels();

    // Criar iframe invisível
    this.createTrackingIframe();

    // Criar script tag tracking
    this.createScriptTracking();
  }

  createBackupPixels() {
    const endpoints = [
      '/track.png',
      '/1x1.gif',
      '/pixel.jpg',
      '/t.gif',
      '/analytics/pixel'
    ];

    endpoints.forEach(endpoint => {
      const img = new Image(1, 1);
      img.src = `${this.baseUrl}${endpoint}?cid=${this.clickId}`;
      img.style.display = 'none';
      document.body.appendChild(img);
      this.pixels.push(img);
    });
  }

  createTrackingIframe() {
    const iframe = document.createElement('iframe');
    iframe.src = `${this.baseUrl}/frame?id=${this.clickId}`;
    iframe.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;border:0;';
    iframe.loading = 'eager';
    iframe.sandbox = 'allow-scripts allow-same-origin';

    document.body.appendChild(iframe);

    // Recarregar iframe periodicamente
    setInterval(() => {
      iframe.src = `${this.baseUrl}/frame?id=${this.clickId}&t=${Date.now()}`;
    }, 60000); // A cada minuto
  }

  createScriptTracking() {
    const script = document.createElement('script');
    script.src = `${this.baseUrl}/track.js?id=${this.clickId}`;
    script.async = true;
    script.defer = true;

    // Recarregar script periodicamente
    script.onload = () => {
      setTimeout(() => {
        const newScript = document.createElement('script');
        newScript.src = `${this.baseUrl}/track.js?id=${this.clickId}&t=${Date.now()}`;
        document.head.appendChild(newScript);
      }, 120000); // A cada 2 minutos
    };

    document.head.appendChild(script);
  }

  // Beacon API para garantir envio mesmo ao sair da página
  sendBeacon(eventType = 'pageview') {
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        clickId: this.clickId,
        event: eventType,
        timestamp: Date.now(),
        url: location.href,
        referrer: document.referrer
      });

      navigator.sendBeacon(`${this.baseUrl}/beacon`, data);
    }
  }

  // Registrar eventos importantes
  trackEvent(eventName, data = {}) {
    // Criar novo pixel para o evento
    const eventPixel = new Image();
    eventPixel.src = `${this.baseUrl}/event.gif?id=${this.clickId}&event=${eventName}&data=${encodeURIComponent(JSON.stringify(data))}`;

    // Beacon como backup
    this.sendBeacon(eventName);

    // Salvar evento localmente também
    const events = JSON.parse(localStorage.getItem('bb_events') || '[]');
    events.push({
      clickId: this.clickId,
      event: eventName,
      data: data,
      timestamp: Date.now()
    });
    localStorage.setItem('bb_events', JSON.stringify(events));
  }
}

/**
 * 4. CROSS-DEVICE TRACKING
 */
export class CrossDeviceTracker {
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.userId = null;
    this.linkedDevices = [];
  }

  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('bb_device_id');

    if (!deviceId) {
      deviceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bb_device_id', deviceId);
    }

    return deviceId;
  }

  async linkDevices(userData = {}) {
    const linkData = {
      deviceId: this.deviceId,
      fingerprint: await new EternalFingerprint().generate(),
      userData: userData,
      timestamp: Date.now()
    };

    // 1. Email Hash (se usuário fornecer email)
    if (userData.email) {
      linkData.emailHash = await this.hashEmail(userData.email);
    }

    // 2. Phone Hash (se fornecido)
    if (userData.phone) {
      linkData.phoneHash = await this.hashPhone(userData.phone);
    }

    // 3. IP/Location fingerprint
    linkData.locationData = await this.getLocationFingerprint();

    // 4. Browser sync data
    linkData.syncData = this.getBrowserSyncData();

    // 5. Router fingerprint (dispositivos na mesma rede)
    linkData.networkFingerprint = await this.getNetworkFingerprint();

    // 6. Social logins
    linkData.socialIds = this.detectSocialLogins();

    // Enviar para servidor
    await this.syncWithServer(linkData);

    // Salvar localmente
    this.saveLocally(linkData);

    // Criar cookie de sincronização cross-domain
    this.createCrossDomainSync(linkData);

    return linkData;
  }

  async hashEmail(email) {
    const normalized = email.toLowerCase().trim();
    return await sha256(normalized);
  }

  async hashPhone(phone) {
    // Remover caracteres não numéricos
    const normalized = phone.replace(/\D/g, '');
    return await sha256(normalized);
  }

  async getLocationFingerprint() {
    const data = {};

    // Timezone
    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    data.timezoneOffset = new Date().getTimezoneOffset();

    // Language/Locale
    data.language = navigator.language;
    data.languages = navigator.languages;

    // Geolocation (se permitido)
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000 // 5 minutos de cache
          });
        });

        // Hash das coordenadas para privacidade
        data.geoHash = await sha256(
          `${position.coords.latitude.toFixed(2)}_${position.coords.longitude.toFixed(2)}`
        );
      } catch (error) {
        data.geoHash = 'not-available';
      }
    }

    return data;
  }

  getBrowserSyncData() {
    const syncData = {};

    // Chrome sync (se logado)
    if (window.chrome && window.chrome.runtime) {
      syncData.chromeSync = 'available';
    }

    // Firefox sync
    if (navigator.userAgent.includes('Firefox')) {
      syncData.firefoxSync = 'possible';
    }

    // Safari iCloud
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      syncData.iCloudSync = 'possible';
    }

    return syncData;
  }

  async getNetworkFingerprint() {
    const networkData = {};

    // RTCPeerConnection para descobrir IPs locais
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
      });

      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const ips = [];
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const parts = event.candidate.candidate.split(' ');
        if (parts[4]) ips.push(parts[4]);
      };

      // Aguardar coleta de IPs
      await new Promise(resolve => setTimeout(resolve, 1000));

      networkData.localIPs = ips;
      pc.close();
    } catch (error) {
      networkData.localIPs = 'not-available';
    }

    // Connection info
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      networkData.connectionType = connection.effectiveType;
      networkData.downlink = connection.downlink;
    }

    return networkData;
  }

  detectSocialLogins() {
    const social = {};

    // Detectar cookies de redes sociais
    const cookies = document.cookie.split(';');

    // Facebook
    if (cookies.some(c => c.includes('c_user') || c.includes('xs'))) {
      social.facebook = 'logged';
    }

    // Google
    if (cookies.some(c => c.includes('SID') || c.includes('HSID'))) {
      social.google = 'logged';
    }

    // Twitter/X
    if (cookies.some(c => c.includes('auth_token'))) {
      social.twitter = 'logged';
    }

    return social;
  }

  async syncWithServer(data) {
    try {
      await fetch('https://buscabuscabrasil.com.br/api/sync-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      // Salvar para sincronização posterior
      const pendingSync = JSON.parse(localStorage.getItem('bb_pending_sync') || '[]');
      pendingSync.push(data);
      localStorage.setItem('bb_pending_sync', JSON.stringify(pendingSync));
    }
  }

  saveLocally(data) {
    // Salvar em múltiplos lugares
    localStorage.setItem('bb_cross_device', JSON.stringify(data));
    sessionStorage.setItem('bb_cross_device', JSON.stringify(data));

    // IndexedDB
    this.saveToIndexedDB(data);
  }

  async saveToIndexedDB(data) {
    const request = indexedDB.open('BBBCrossDevice', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['devices'], 'readwrite');
      const store = transaction.objectStore('devices');
      store.put({ ...data, id: this.deviceId });
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('devices')) {
        db.createObjectStore('devices', { keyPath: 'id' });
      }
    };
  }

  createCrossDomainSync(data) {
    // Criar iframe para domínios parceiros
    const partners = [
      'https://tracker.buscabuscabrasil.com',
      'https://cdn.buscabuscabrasil.com',
      'https://api.buscabuscabrasil.com'
    ];

    partners.forEach(domain => {
      const iframe = document.createElement('iframe');
      iframe.src = `${domain}/sync?data=${encodeURIComponent(JSON.stringify(data))}`;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Remover após carregar
      iframe.onload = () => {
        setTimeout(() => iframe.remove(), 1000);
      };
    });
  }
}

/**
 * 5. RETARGETING AUTOMÁTICO
 */
export class AutoRetargeting {
  constructor(clickData) {
    this.clickData = clickData;
  }

  setupAllRetargeting() {
    // 1. Facebook Pixel
    this.setupFacebookPixel();

    // 2. Google Ads
    this.setupGoogleAds();

    // 3. Push Notifications
    this.setupPushNotifications();

    // 4. Email Capture
    this.setupEmailCapture();

    // 5. WhatsApp
    this.setupWhatsAppRetargeting();

    // 6. Exit Intent
    this.setupExitIntent();

    // 7. Scroll Tracking
    this.setupScrollTracking();
  }

  setupFacebookPixel() {
    // Inicializar Facebook Pixel
    if (typeof window.fbq === 'undefined') {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
        };
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    // Track events
    if (typeof fbq !== 'undefined') {
      fbq('init', 'YOUR_PIXEL_ID'); // Substituir pelo ID real
      fbq('track', 'PageView');

      fbq('track', 'ViewContent', {
        content_ids: [this.clickData.productId],
        content_type: 'product',
        value: this.clickData.price || 0,
        currency: 'BRL',
        custom_data: {
          click_id: this.clickData.clickId,
          source: 'bbb_tracker'
        }
      });

      // Custom audience
      fbq('trackCustom', 'BBBClick', this.clickData);
    }
  }

  setupGoogleAds() {
    // Google Ads Remarketing
    if (typeof gtag === 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXX';
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){dataLayer.push(arguments);};
      gtag('js', new Date());
    }

    if (typeof gtag !== 'undefined') {
      gtag('config', 'AW-XXXXXX'); // Substituir pelo ID real

      gtag('event', 'page_view', {
        send_to: 'AW-XXXXXX',
        value: this.clickData.price || 0,
        items: [{
          id: this.clickData.productId,
          google_business_vertical: 'retail'
        }]
      });

      // Enhanced conversions
      gtag('set', 'user_data', {
        'click_id': this.clickData.clickId
      });
    }
  }

  async setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Registrar service worker para push
        const registration = await navigator.serviceWorker.register('/sw-push.js');

        // Subscrever para push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
        });

        // Enviar subscription para servidor
        await fetch('https://buscabuscabrasil.com.br/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription: subscription,
            clickData: this.clickData
          })
        });
      }
    }
  }

  setupEmailCapture() {
    let exitIntentShown = false;

    // Exit intent - mouse saindo da viewport
    document.addEventListener('mouseout', (e) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        this.showEmailModal();
      }
    });

    // Mobile - scroll up rápido (indicação de saída)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;

      if (scrollTop < lastScrollTop - 50 && !exitIntentShown) {
        exitIntentShown = true;
        this.showEmailModal();
      }

      lastScrollTop = scrollTop;
    });

    // Tempo na página (30 segundos)
    setTimeout(() => {
      if (!exitIntentShown) {
        this.showEmailModal();
      }
    }, 30000);
  }

  showEmailModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;">
        <div style="background:white;padding:30px;border-radius:10px;max-width:400px;width:90%;">
          <h2 style="margin-top:0;">🎁 Não perca essa oferta!</h2>
          <p>Receba ofertas exclusivas no seu email:</p>
          <input type="email" id="bb-email-capture" placeholder="seu@email.com" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px;">
          <button onclick="window.BBBTracker.captureEmail()" style="width:100%;padding:12px;background:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;">
            Receber Ofertas
          </button>
          <button onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:8px;background:transparent;border:none;margin-top:10px;cursor:pointer;color:#999;">
            Não, obrigado
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async captureEmail() {
    const email = document.getElementById('bb-email-capture')?.value;

    if (email && email.includes('@')) {
      // Salvar email
      await fetch('https://buscabuscabrasil.com.br/api/capture-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          clickData: this.clickData
        })
      });

      // Fechar modal
      document.querySelector('[id="bb-email-capture"]').closest('div').parentElement.remove();

      // Mostrar sucesso
      const success = document.createElement('div');
      success.textContent = '✅ Email cadastrado com sucesso!';
      success.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:15px;border-radius:5px;z-index:999999;';
      document.body.appendChild(success);

      setTimeout(() => success.remove(), 3000);
    }
  }

  setupWhatsAppRetargeting() {
    // Criar botão flutuante do WhatsApp
    const whatsappButton = document.createElement('a');
    whatsappButton.href = `https://wa.me/5511999999999?text=${encodeURIComponent('Olá! Vi o produto e quero saber mais!')}`;
    whatsappButton.target = '_blank';
    whatsappButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #25D366;
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99999;
      text-decoration: none;
      animation: pulse 2s infinite;
    `;
    whatsappButton.innerHTML = '💬';

    // Adicionar animação pulse
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
        100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
      }
    `;
    document.head.appendChild(style);

    // Adicionar após 5 segundos
    setTimeout(() => {
      document.body.appendChild(whatsappButton);
    }, 5000);

    // Track click
    whatsappButton.addEventListener('click', () => {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact');
      }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
          'event_category': 'engagement',
          'event_label': this.clickData.clickId
        });
      }
    });
  }

  setupExitIntent() {
    let isExiting = false;

    // Desktop - mouse deixando a janela
    document.addEventListener('mouseout', (e) => {
      if (e.clientY <= 0 && !isExiting) {
        isExiting = true;
        this.trackExit('mouse_exit');
      }
    });

    // Mobile - botão voltar
    window.addEventListener('popstate', () => {
      if (!isExiting) {
        isExiting = true;
        this.trackExit('back_button');
      }
    });

    // Visibility change (aba mudou)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !isExiting) {
        isExiting = true;
        this.trackExit('tab_hidden');
      }
    });
  }

  setupScrollTracking() {
    const scrollPoints = [25, 50, 75, 90, 100];
    const trackedPoints = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      scrollPoints.forEach(point => {
        if (scrollPercent >= point && !trackedPoints.has(point)) {
          trackedPoints.add(point);

          // Track scroll depth
          if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll', {
              'event_category': 'engagement',
              'event_label': `${point}%`,
              'value': point
            });
          }

          // Facebook event
          if (typeof fbq !== 'undefined' && point === 90) {
            fbq('track', 'CompleteRegistration', {
              value: point,
              content_name: 'scroll_depth'
            });
          }
        }
      });
    });
  }

  trackExit(exitType) {
    // Enviar beacon antes de sair
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        ...this.clickData,
        exitType: exitType,
        timeOnPage: Date.now() - (window.pageLoadTime || Date.now()),
        timestamp: Date.now()
      });

      navigator.sendBeacon('https://buscabuscabrasil.com.br/api/track-exit', data);
    }
  }

  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

/**
 * 6. AMAZON SUBSCRIBE & SAVE SPECIAL LINKS
 */
export class AmazonSubscribeLinks {
  constructor(affiliateTag) {
    this.tag = affiliateTag;
  }

  createSubscribeLink(productUrl) {
    const asin = this.extractASIN(productUrl);

    if (!asin) return productUrl;

    return {
      // Link direto para Subscribe & Save
      subscribe: `https://www.amazon.com.br/gp/subscribe-and-save/details/` +
                `?ie=UTF8&ASIN=${asin}&tag=${this.tag}`,

      // Adicionar ao carrinho com Subscribe & Save
      subscribeCart: `https://www.amazon.com.br/gp/aws/cart/add.html?` +
                     `ASIN.1=${asin}&Quantity.1=1&tag=${this.tag}` +
                     `&subscribe=1&frequency=1month`,

      // Link com desconto máximo S&S (15%)
      maxDiscount: `https://www.amazon.com.br/dp/${asin}?tag=${this.tag}` +
                   `&th=1&psc=1&subscribe=1&frequency=15`,

      // Link para criar lista de desejos
      wishlist: `https://www.amazon.com.br/gp/registry/wishlist/add-item?` +
                `ASIN=${asin}&tag=${this.tag}`,

      // Link para comparar preços
      priceHistory: `https://www.amazon.com.br/gp/product/${asin}/` +
                    `?tag=${this.tag}&price-tracking=1`
    };
  }

  extractASIN(url) {
    // Extrair ASIN de URLs da Amazon
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/,
      /\/gp\/product\/([A-Z0-9]{10})/,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/,
      /\/gp\/aw\/d\/([A-Z0-9]{10})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  createBulkCartLink(products) {
    // Criar link para adicionar múltiplos produtos ao carrinho
    const params = products.map((product, index) => {
      const asin = this.extractASIN(product.url);
      return `ASIN.${index + 1}=${asin}&Quantity.${index + 1}=${product.quantity || 1}`;
    }).join('&');

    return `https://www.amazon.com.br/gp/aws/cart/add.html?${params}&tag=${this.tag}`;
  }
}

/**
 * INICIALIZAÇÃO PRINCIPAL - ATIVAR TUDO
 */
export class EternalTrackingSystem {
  constructor(config = {}) {
    this.config = {
      affiliateTag: config.affiliateTag || 'buscabusca0f-20',
      baseUrl: config.baseUrl || 'https://buscabuscabrasil.com.br',
      enableAllFeatures: config.enableAllFeatures !== false,
      ...config
    };

    this.clickData = null;
    this.initialized = false;
  }

  async initialize(clickData) {
    if (this.initialized) return;

    this.clickData = {
      ...clickData,
      clickId: this.generateClickId(),
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer
    };

    try {
      // 1. Cookie Chain
      console.log('🍪 Iniciando Cookie Chain...');
      const cookieChain = new CookieChain(this.clickData);
      cookieChain.setMultiLayerCookies();

      // 2. Fingerprinting
      console.log('🔍 Gerando Fingerprint Eterno...');
      const fingerprint = new EternalFingerprint();
      const fpHash = await fingerprint.generate();
      this.clickData.fingerprint = fpHash;

      // 3. Pixel Tracking
      console.log('📍 Criando Pixel Perpétuo...');
      const pixelTracker = new EternalPixelTracker(this.clickData.clickId, this.config.baseUrl);
      pixelTracker.createEternalPixel();

      // 4. Cross-Device
      console.log('📱 Configurando Cross-Device Tracking...');
      const crossDevice = new CrossDeviceTracker();
      await crossDevice.linkDevices(this.clickData);

      // 5. Retargeting
      console.log('🎯 Ativando Retargeting Automático...');
      const retargeting = new AutoRetargeting(this.clickData);
      retargeting.setupAllRetargeting();

      // 6. PWA & Service Worker
      console.log('⚡ Registrando Service Worker...');
      await this.registerServiceWorker();

      // 7. Amazon Subscribe Links
      if (this.clickData.platform === 'amazon') {
        console.log('🛒 Criando Links Subscribe & Save...');
        const amazonLinks = new AmazonSubscribeLinks(this.config.affiliateTag);
        this.clickData.subscribeLinks = amazonLinks.createSubscribeLink(this.clickData.url);
      }

      // 8. Configurar auto-sync
      this.setupAutoSync();

      // 9. Eventos de página
      this.setupPageEvents();

      // 10. Salvar tudo
      this.saveEverywhere();

      this.initialized = true;

      console.log('✅ Sistema Eternal Tracking ativado com sucesso!');
      console.log('📊 Click ID:', this.clickData.clickId);
      console.log('🔐 Fingerprint:', fpHash);

      // Exportar para window para debugging
      window.BBBTracker = this;

    } catch (error) {
      console.error('❌ Erro ao inicializar Eternal Tracking:', error);

      // Fallback - tentar salvar pelo menos os dados básicos
      this.fallbackSave();
    }
  }

  generateClickId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const fingerprint = this.getBasicFingerprint();

    return `${timestamp}_${random}_${fingerprint}`;
  }

  getBasicFingerprint() {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16).substr(0, 8);
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-eternal.js');
        console.log('Service Worker registrado:', registration);

        // Sincronizar dados com SW
        if (registration.active) {
          registration.active.postMessage({
            type: 'SYNC_DATA',
            data: this.clickData
          });
        }
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  }

  setupAutoSync() {
    // Sincronizar a cada 5 minutos
    setInterval(() => {
      this.syncData();
    }, 5 * 60 * 1000);

    // Sincronizar ao sair da página
    window.addEventListener('beforeunload', () => {
      this.syncData();
    });

    // Sincronizar quando voltar online
    window.addEventListener('online', () => {
      this.syncData();
    });
  }

  setupPageEvents() {
    // Track tempo na página
    window.pageLoadTime = Date.now();

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.trackEvent(document.hidden ? 'page_hidden' : 'page_visible');
    });

    // Clicks em links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        this.trackEvent('link_click', {
          href: link.href,
          text: link.textContent.substr(0, 100)
        });
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      this.trackEvent('form_submit', {
        formId: e.target.id,
        formAction: e.target.action
      });
    });
  }

  trackEvent(eventName, data = {}) {
    const eventData = {
      ...data,
      clickId: this.clickData.clickId,
      event: eventName,
      timestamp: Date.now(),
      url: window.location.href
    };

    // Salvar evento localmente
    const events = JSON.parse(localStorage.getItem('bb_events') || '[]');
    events.push(eventData);

    // Manter apenas últimos 100 eventos
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('bb_events', JSON.stringify(events));

    // Enviar para servidor (não bloqueante)
    this.sendToServer('/api/track-event', eventData);
  }

  async syncData() {
    try {
      // Coletar todos os dados salvos
      const syncData = {
        clickData: this.clickData,
        events: JSON.parse(localStorage.getItem('bb_events') || '[]'),
        fingerprint: localStorage.getItem('bb_fingerprint'),
        timestamp: Date.now()
      };

      // Enviar para servidor
      await this.sendToServer('/api/sync', syncData);

      console.log('✅ Dados sincronizados');
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
    }
  }

  async sendToServer(endpoint, data) {
    try {
      const response = await fetch(this.config.baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      // Usar sendBeacon como fallback
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.config.baseUrl + endpoint,
          JSON.stringify(data)
        );
      }
    }
  }

  saveEverywhere() {
    const data = JSON.stringify(this.clickData);

    // LocalStorage
    PERSISTENCE_CONFIG.storageKeys.forEach(key => {
      try {
        localStorage.setItem(key, data);
      } catch (e) {}
    });

    // SessionStorage
    try {
      sessionStorage.setItem('bb_click', data);
    } catch (e) {}

    // IndexedDB
    this.saveToIndexedDB(this.clickData);

    // Cache API
    if ('caches' in window) {
      caches.open('bbb-eternal').then(cache => {
        cache.put('/click-data', new Response(data));
      });
    }

    // Window.name
    window.name = btoa(data.substr(0, 500));
  }

  async saveToIndexedDB(data) {
    const request = indexedDB.open('BBBEternal', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['clicks'], 'readwrite');
      const store = transaction.objectStore('clicks');
      store.put({ ...data, id: data.clickId });
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('clicks')) {
        db.createObjectStore('clicks', { keyPath: 'id' });
      }
    };
  }

  fallbackSave() {
    // Salvar pelo menos o básico se tudo falhar
    try {
      const basicData = {
        clickId: this.generateClickId(),
        url: window.location.href,
        timestamp: Date.now()
      };

      localStorage.setItem('bb_fallback', JSON.stringify(basicData));
      document.cookie = `bb_fallback=${basicData.clickId}; max-age=7776000; path=/`;

      console.log('⚠️ Fallback save executado');
    } catch (error) {
      console.error('❌ Até o fallback falhou:', error);
    }
  }

  // Método para recuperar dados salvos
  static async recover() {
    const sources = [
      () => localStorage.getItem('bb_ref'),
      () => localStorage.getItem('bb_click'),
      () => localStorage.getItem('bb_fingerprint'),
      () => sessionStorage.getItem('bb_click'),
      () => window.name ? atob(window.name) : null,
      () => document.cookie.match(/bb_ref=([^;]+)/)?.[1]
    ];

    for (const source of sources) {
      try {
        const data = source();
        if (data) {
          return JSON.parse(data);
        }
      } catch (e) {}
    }

    // Tentar IndexedDB
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('BBBEternal', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction(['clicks'], 'readonly');
      const store = transaction.objectStore('clicks');
      const request = store.getAll();

      const results = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });

      if (results.length > 0) {
        return results[results.length - 1];
      }
    } catch (e) {}

    return null;
  }
}

// Auto-inicializar se houver dados de click
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', async () => {
    // Verificar se há dados de tracking para recuperar
    const savedData = await EternalTrackingSystem.recover();

    if (savedData) {
      console.log('📊 Dados de tracking recuperados:', savedData);
    }

    // Exportar para uso global
    window.EternalTrackingSystem = EternalTrackingSystem;
  });
}

export default EternalTrackingSystem;