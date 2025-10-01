/**
 * 🚨 INTERCEPTOR DE REDIRECT - SOLUÇÃO EMERGENCIAL
 *
 * COMO USAR:
 * 1. Abra o link: https://www.buscabuscabrasil.com.br/r/ABC123
 * 2. Aperte F12 (DevTools)
 * 3. Cole TODO este código no Console
 * 4. Aperte ENTER
 * 5. O redirect será BLOQUEADO!
 * 6. Você verá TODOS os logs
 */

(function() {
  console.log('🚨 INTERCEPTOR DE REDIRECT ATIVADO!');
  console.log('📋 Redirect será BLOQUEADO até você permitir!');

  // Array para armazenar todos os logs
  window.BBB_CAPTURED_LOGS = [];

  // Função para capturar logs
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = function(...args) {
    window.BBB_CAPTURED_LOGS.push({
      type: 'log',
      timestamp: Date.now(),
      message: args
    });
    originalLog.apply(console, args);
  };

  console.error = function(...args) {
    window.BBB_CAPTURED_LOGS.push({
      type: 'error',
      timestamp: Date.now(),
      message: args
    });
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    window.BBB_CAPTURED_LOGS.push({
      type: 'warn',
      timestamp: Date.now(),
      message: args
    });
    originalWarn.apply(console, args);
  };

  // BLOQUEAR window.location.replace
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    console.log('🚨 REDIRECT BLOQUEADO!');
    console.log('🔗 URL de destino:', url);
    console.log('⏸️ Redirect foi PAUSADO!');

    window.BBB_BLOCKED_URL = url;

    // Criar painel visual
    createBlockPanel(url);

    // NÃO executar o redirect!
    return false;
  };

  // BLOQUEAR window.location.href
  const originalHrefDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
  Object.defineProperty(window.location, 'href', {
    set: function(url) {
      console.log('🚨 REDIRECT BLOQUEADO (href)!');
      console.log('🔗 URL de destino:', url);

      window.BBB_BLOCKED_URL = url;
      createBlockPanel(url);

      // NÃO executar o redirect!
      return false;
    },
    get: originalHrefDescriptor.get
  });

  // Função para criar painel visual
  function createBlockPanel(url) {
    // Remove painel anterior se existir
    const existing = document.getElementById('bbb-block-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'bbb-block-panel';
    panel.innerHTML = `
      <style>
        #bbb-block-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 600px;
          max-height: 80vh;
          background: #000;
          border: 3px solid #ff0000;
          border-radius: 12px;
          padding: 20px;
          z-index: 999999999;
          color: #0f0;
          font-family: monospace;
          font-size: 13px;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
          overflow-y: auto;
        }
        #bbb-block-panel h2 {
          margin: 0 0 15px 0;
          color: #ff0000;
          font-size: 18px;
          border-bottom: 2px solid #ff0000;
          padding-bottom: 10px;
        }
        #bbb-block-panel .url-box {
          background: #111;
          padding: 10px;
          border-radius: 6px;
          margin: 15px 0;
          word-break: break-all;
          color: #0ff;
          border: 1px solid #0ff;
        }
        #bbb-block-panel .logs {
          background: #111;
          padding: 10px;
          border-radius: 6px;
          max-height: 400px;
          overflow-y: auto;
          margin: 15px 0;
          font-size: 11px;
        }
        #bbb-block-panel .log-entry {
          margin: 5px 0;
          padding: 5px;
          border-left: 3px solid #0f0;
          padding-left: 8px;
        }
        #bbb-block-panel .log-error {
          border-left-color: #f00;
          color: #f99;
        }
        #bbb-block-panel .log-warn {
          border-left-color: #fa0;
          color: #fc6;
        }
        #bbb-block-panel .buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        #bbb-block-panel button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          transition: all 0.2s;
        }
        #bbb-block-panel .btn-redirect {
          background: #0f0;
          color: #000;
        }
        #bbb-block-panel .btn-redirect:hover {
          background: #0c0;
          transform: scale(1.05);
        }
        #bbb-block-panel .btn-copy {
          background: #00f;
          color: #fff;
        }
        #bbb-block-panel .btn-download {
          background: #f90;
          color: #000;
        }
        #bbb-block-panel .btn-close {
          background: #f00;
          color: #fff;
        }
        #bbb-block-panel .status {
          background: #222;
          padding: 10px;
          border-radius: 6px;
          margin: 10px 0;
          text-align: center;
          font-weight: bold;
          color: #ff0;
        }
      </style>

      <h2>🚨 REDIRECT BLOQUEADO!</h2>

      <div class="status">
        ⏸️ Redirect foi PAUSADO pelo Interceptor
      </div>

      <div>
        <strong>🔗 URL de Destino:</strong>
        <div class="url-box">${url}</div>
      </div>

      <div>
        <strong>📋 Logs Capturados (${window.BBB_CAPTURED_LOGS.length}):</strong>
        <div class="logs" id="bbb-logs-container">
          ${window.BBB_CAPTURED_LOGS.map(log => `
            <div class="log-entry log-${log.type}">
              [+${log.timestamp - window.BBB_CAPTURED_LOGS[0].timestamp}ms]
              ${JSON.stringify(log.message)}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="buttons">
        <button class="btn-redirect" onclick="window.BBB_executeRedirect()">
          🚀 REDIRECIONAR AGORA
        </button>
        <button class="btn-copy" onclick="window.BBB_copyURL()">
          📋 COPIAR URL
        </button>
        <button class="btn-download" onclick="window.BBB_downloadLogs()">
          💾 BAIXAR LOGS
        </button>
        <button class="btn-close" onclick="document.getElementById('bbb-block-panel').remove()">
          ✖️ FECHAR
        </button>
      </div>
    `;

    document.body.appendChild(panel);
  }

  // Funções auxiliares
  window.BBB_executeRedirect = function() {
    console.log('🚀 Executando redirect manual...');
    const url = window.BBB_BLOCKED_URL;

    // Restaurar função original temporariamente
    window.location.replace = originalReplace;

    // Executar redirect
    window.location.replace(url);
  };

  window.BBB_copyURL = function() {
    const url = window.BBB_BLOCKED_URL;
    navigator.clipboard.writeText(url);
    alert('✅ URL copiada: ' + url);
  };

  window.BBB_downloadLogs = function() {
    const logs = window.BBB_CAPTURED_LOGS;
    const text = logs.map(log =>
      `[+${log.timestamp - logs[0].timestamp}ms] [${log.type}] ${JSON.stringify(log.message)}`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bbb-interceptor-logs-${Date.now()}.txt`;
    a.click();
  };

  console.log('✅ Interceptor instalado com sucesso!');
  console.log('📋 Todos os redirects serão BLOQUEADOS!');
  console.log('🔍 Logs sendo capturados em: window.BBB_CAPTURED_LOGS');

})();
