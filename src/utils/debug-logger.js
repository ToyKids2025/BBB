/**
 * 🐛 SISTEMA DE DEBUG AVANÇADO
 * Captura TODOS os logs e permite visualização antes do redirect
 */

class DebugLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
    this.enabled = this.checkDebugMode();

    if (this.enabled) {
      console.log('🐛 DEBUG MODE ATIVO - Logs serão salvos e exibidos');
    }
  }

  /**
   * Verifica se modo debug está ativo
   * Ativar adicionando ?debug=true na URL
   * Modo PAUSE: ?debug=pause (nunca redireciona automaticamente)
   */
  checkDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    return debugParam === 'true' ||
           debugParam === 'pause' ||
           localStorage.getItem('bbb_debug_mode') === 'true';
  }

  /**
   * Verifica se está em modo PAUSE (sem redirect automático)
   */
  isPauseMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'pause' ||
           localStorage.getItem('bbb_debug_pause') === 'true';
  }

  /**
   * Adiciona um log com timestamp
   */
  log(type, message, data = null) {
    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      type, // 'info', 'success', 'warning', 'error', 'debug'
      message,
      data,
      time: new Date().toISOString()
    };

    this.logs.push(logEntry);

    // Log no console também
    const emoji = this.getEmoji(type);
    const timeStr = `+${timestamp}ms`;

    if (data) {
      console.log(`${emoji} [${timeStr}] ${message}`, data);
    } else {
      console.log(`${emoji} [${timeStr}] ${message}`);
    }

    // Salvar no localStorage em tempo real
    this.saveLogs();
  }

  /**
   * Retorna emoji baseado no tipo
   */
  getEmoji(type) {
    const emojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
      device: '📱',
      link: '🔗',
      redirect: '🚀',
      tracking: '📊',
      firebase: '🔥'
    };
    return emojis[type] || 'ℹ️';
  }

  /**
   * Salva logs no localStorage
   */
  saveLogs() {
    try {
      localStorage.setItem('bbb_debug_logs', JSON.stringify(this.logs));
      localStorage.setItem('bbb_debug_timestamp', Date.now().toString());
    } catch (e) {
      console.warn('Não foi possível salvar logs:', e);
    }
  }

  /**
   * Recupera logs salvos
   */
  static getSavedLogs() {
    try {
      const logs = localStorage.getItem('bbb_debug_logs');
      const timestamp = localStorage.getItem('bbb_debug_timestamp');
      return {
        logs: logs ? JSON.parse(logs) : [],
        timestamp: timestamp ? parseInt(timestamp) : null
      };
    } catch (e) {
      return { logs: [], timestamp: null };
    }
  }

  /**
   * Limpa logs salvos
   */
  static clearLogs() {
    localStorage.removeItem('bbb_debug_logs');
    localStorage.removeItem('bbb_debug_timestamp');
  }

  /**
   * Retorna todos os logs
   */
  getAllLogs() {
    return this.logs;
  }

  /**
   * Exporta logs como texto
   */
  exportAsText() {
    let text = '=== BBB DEBUG LOGS ===\n';
    text += `Sessão iniciada em: ${new Date(this.startTime).toLocaleString('pt-BR')}\n`;
    text += `Total de logs: ${this.logs.length}\n\n`;

    this.logs.forEach(log => {
      text += `[+${log.timestamp}ms] ${this.getEmoji(log.type)} ${log.message}\n`;
      if (log.data) {
        text += `   Dados: ${JSON.stringify(log.data, null, 2)}\n`;
      }
      text += '\n';
    });

    return text;
  }

  /**
   * Faz download dos logs como arquivo
   */
  downloadLogs() {
    const text = this.exportAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bbb-debug-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Cria um resumo dos logs
   */
  getSummary() {
    const totalTime = Date.now() - this.startTime;
    const errors = this.logs.filter(l => l.type === 'error').length;
    const warnings = this.logs.filter(l => l.type === 'warning').length;
    const success = this.logs.filter(l => l.type === 'success').length;

    return {
      totalLogs: this.logs.length,
      totalTime,
      errors,
      warnings,
      success,
      firstLog: this.logs[0],
      lastLog: this.logs[this.logs.length - 1]
    };
  }
}

// Criar instância global
const debugLogger = new DebugLogger();

/**
 * Ativa modo debug
 */
export function enableDebugMode() {
  localStorage.setItem('bbb_debug_mode', 'true');
  console.log('🐛 Modo debug ATIVADO! Recarregue a página.');
  console.log('💡 Ou adicione ?debug=true na URL');
}

/**
 * Desativa modo debug
 */
export function disableDebugMode() {
  localStorage.removeItem('bbb_debug_mode');
  console.log('🐛 Modo debug DESATIVADO!');
}

/**
 * Verifica se modo debug está ativo
 */
export function isDebugMode() {
  return debugLogger.enabled;
}

/**
 * Verifica se está em modo PAUSE
 */
export function isPauseMode() {
  return debugLogger.isPauseMode();
}

/**
 * Helpers para logging
 */
export const log = {
  info: (msg, data) => debugLogger.log('info', msg, data),
  success: (msg, data) => debugLogger.log('success', msg, data),
  warning: (msg, data) => debugLogger.log('warning', msg, data),
  error: (msg, data) => debugLogger.log('error', msg, data),
  debug: (msg, data) => debugLogger.log('debug', msg, data),
  device: (msg, data) => debugLogger.log('device', msg, data),
  link: (msg, data) => debugLogger.log('link', msg, data),
  redirect: (msg, data) => debugLogger.log('redirect', msg, data),
  tracking: (msg, data) => debugLogger.log('tracking', msg, data),
  firebase: (msg, data) => debugLogger.log('firebase', msg, data),
};

/**
 * Exporta logs
 */
export function exportLogs() {
  debugLogger.downloadLogs();
}

/**
 * Retorna resumo
 */
export function getLogSummary() {
  return debugLogger.getSummary();
}

/**
 * Retorna todos os logs
 */
export function getAllLogs() {
  return debugLogger.getAllLogs();
}

/**
 * Recupera logs salvos de sessão anterior
 */
export function getSavedLogs() {
  return DebugLogger.getSavedLogs();
}

/**
 * Limpa logs
 */
export function clearLogs() {
  DebugLogger.clearLogs();
  debugLogger.logs = [];
  console.log('🗑️ Logs limpos!');
}

// Expor no window para uso no console
if (typeof window !== 'undefined') {
  window.bbbDebug = {
    enable: enableDebugMode,
    disable: disableDebugMode,
    isActive: isDebugMode,
    logs: getAllLogs,
    summary: getLogSummary,
    export: exportLogs,
    clear: clearLogs,
    saved: getSavedLogs
  };
}

export default debugLogger;
