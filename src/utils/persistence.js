/**
 * Sistema de Persistência Avançado
 * Múltiplas camadas para garantir tracking em Safari iOS e Instagram
 */

// Configurações de Cookie Seguro (usado nas funções de cookie)
// const COOKIE_CONFIG = {
//   maxAge: 30 * 24 * 60 * 60, // 30 dias
//   secure: true,
//   sameSite: 'Lax',
//   path: '/',
//   domain: window.location.hostname
// };

/**
 * Define cookie com configurações máximas de segurança
 */
export function setCookieSecure(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

  // Cookie com todas as flags de segurança
  const cookieString = `${name}=${encodeURIComponent(value)}; ` +
    `expires=${date.toUTCString()}; ` +
    `max-age=${days * 24 * 60 * 60}; ` +
    `path=/; ` +
    `SameSite=Lax; ` +
    (window.location.protocol === 'https:' ? 'Secure; ' : '');

  document.cookie = cookieString;

  // Fallback: localStorage
  try {
    localStorage.setItem(`cookie_${name}`, JSON.stringify({
      value,
      expires: date.getTime()
    }));
  } catch (e) {
    console.warn('localStorage não disponível');
  }

  // Fallback: sessionStorage
  try {
    sessionStorage.setItem(`cookie_${name}`, value);
  } catch (e) {
    console.warn('sessionStorage não disponível');
  }
}

/**
 * Recupera cookie com fallbacks
 */
export function getCookieSecure(name) {
  // Tentar cookie primeiro
  const cookieMatch = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (cookieMatch) {
    return decodeURIComponent(cookieMatch[2]);
  }

  // Fallback 1: localStorage
  try {
    const stored = localStorage.getItem(`cookie_${name}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.expires > Date.now()) {
        return data.value;
      }
      localStorage.removeItem(`cookie_${name}`);
    }
  } catch (e) {}

  // Fallback 2: sessionStorage
  try {
    return sessionStorage.getItem(`cookie_${name}`);
  } catch (e) {}

  return null;
}

/**
 * Sistema de persistência para Safari iOS (ITP - Intelligent Tracking Prevention)
 */
export class SafariPersistence {
  constructor() {
    this.storageKey = 'bbb_tracking';
    this.initStorage();
  }

  initStorage() {
    // Detectar Safari iOS
    this.isSafariIOS = /Safari/.test(navigator.userAgent) &&
                       /iPhone|iPad|iPod/.test(navigator.userAgent) &&
                       !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

    // Detectar Instagram in-app browser
    this.isInstagram = /Instagram/.test(navigator.userAgent);

    if (this.isSafariIOS || this.isInstagram) {
      this.setupAdvancedPersistence();
    }
  }

  setupAdvancedPersistence() {
    // Estratégia 1: IndexedDB (mais resistente no Safari)
    this.setupIndexedDB();

    // Estratégia 2: Web SQL (deprecated mas ainda funciona)
    this.setupWebSQL();

    // Estratégia 3: Cache API
    this.setupCacheAPI();

    // Estratégia 4: Service Worker storage
    if ('serviceWorker' in navigator) {
      this.setupServiceWorker();
    }
  }

  async setupIndexedDB() {
    try {
      const request = indexedDB.open('BBBTracking', 1);

      request.onerror = () => console.warn('IndexedDB não disponível');

      request.onsuccess = (event) => {
        this.db = event.target.result;
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tracking')) {
          db.createObjectStore('tracking', { keyPath: 'id' });
        }
      };
    } catch (e) {
      console.warn('Erro ao configurar IndexedDB:', e);
    }
  }

  setupWebSQL() {
    if (window.openDatabase) {
      try {
        this.webSQL = window.openDatabase('BBBTracking', '1.0', 'Tracking Data', 5 * 1024 * 1024);
        this.webSQL.transaction((tx) => {
          tx.executeSql('CREATE TABLE IF NOT EXISTS tracking (id TEXT PRIMARY KEY, data TEXT)');
        });
      } catch (e) {
        console.warn('Web SQL não disponível');
      }
    }
  }

  async setupCacheAPI() {
    if ('caches' in window) {
      try {
        this.cache = await caches.open('bbb-tracking-v1');
      } catch (e) {
        console.warn('Cache API não disponível');
      }
    }
  }

  setupServiceWorker() {
    // Service Worker será registrado separadamente
    navigator.serviceWorker.ready.then(registration => {
      this.swRegistration = registration;
    });
  }

  /**
   * Salva dados em todas as camadas disponíveis
   */
  async saveData(key, value) {
    const data = {
      key,
      value,
      timestamp: Date.now(),
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };

    // Cookie seguro
    setCookieSecure(key, value);

    // localStorage com try-catch
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}

    // sessionStorage
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}

    // IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['tracking'], 'readwrite');
        const store = transaction.objectStore('tracking');
        store.put({ id: key, ...data });
      } catch (e) {}
    }

    // Web SQL
    if (this.webSQL) {
      this.webSQL.transaction((tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO tracking (id, data) VALUES (?, ?)',
          [key, JSON.stringify(data)]
        );
      });
    }

    // Cache API
    if (this.cache) {
      const response = new Response(JSON.stringify(data));
      await this.cache.put(key, response);
    }

    // Service Worker
    if (this.swRegistration) {
      this.swRegistration.active.postMessage({
        type: 'SAVE_TRACKING',
        key,
        data
      });
    }
  }

  /**
   * Recupera dados de qualquer camada disponível
   */
  async getData(key) {
    // Tentar cookie primeiro
    const cookieValue = getCookieSecure(key);
    if (cookieValue) return cookieValue;

    // localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.expires > Date.now()) {
          return data.value;
        }
      }
    } catch (e) {}

    // sessionStorage
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        return data.value;
      }
    } catch (e) {}

    // IndexedDB
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db.transaction(['tracking'], 'readonly');
          const store = transaction.objectStore('tracking');
          const request = store.get(key);

          request.onsuccess = () => {
            if (request.result && request.result.expires > Date.now()) {
              resolve(request.result.value);
            } else {
              resolve(null);
            }
          };

          request.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    // Cache API
    if (this.cache) {
      try {
        const response = await this.cache.match(key);
        if (response) {
          const data = await response.json();
          if (data.expires > Date.now()) {
            return data.value;
          }
        }
      } catch (e) {}
    }

    return null;
  }
}

/**
 * Detecta e reporta capacidades do browser
 */
export function detectBrowserCapabilities() {
  return {
    cookies: navigator.cookieEnabled,
    localStorage: (() => {
      try {
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', '1');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    indexedDB: 'indexedDB' in window,
    webSQL: 'openDatabase' in window,
    cacheAPI: 'caches' in window,
    serviceWorker: 'serviceWorker' in navigator,
    safari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    safariIOS: /Safari/.test(navigator.userAgent) && /iPhone|iPad|iPod/.test(navigator.userAgent),
    instagram: /Instagram/.test(navigator.userAgent),
    facebook: /FB/.test(navigator.userAgent) || /FBAN/.test(navigator.userAgent)
  };
}

// Instância global
export const persistence = new SafariPersistence();

// Export default como objeto nomeado
const persistenceModule = {
  setCookieSecure,
  getCookieSecure,
  SafariPersistence,
  detectBrowserCapabilities,
  persistence
};

export default persistenceModule;