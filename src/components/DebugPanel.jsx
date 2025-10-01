import React, { useState, useEffect } from 'react';
import { getAllLogs, getLogSummary, exportLogs, clearLogs, isDebugMode, isPauseMode } from '../utils/debug-logger';

/**
 * 🐛 PAINEL DE DEBUG VISUAL
 * Mostra todos os logs em tempo real na tela
 */
const DebugPanel = ({ autoHide = false, hideDelay = 0, redirectUrl, onManualRedirect }) => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const pauseMode = isPauseMode();

  // Atualizar logs a cada 100ms
  useEffect(() => {
    if (!isDebugMode()) return;

    const interval = setInterval(() => {
      setLogs(getAllLogs());
      setSummary(getLogSummary());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide após delay
  useEffect(() => {
    if (autoHide && hideDelay > 0) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
      return () => clearTimeout(timeout);
    }
  }, [autoHide, hideDelay]);

  if (!isDebugMode() || !isVisible) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.title}>🐛 DEBUG PANEL</span>
          {pauseMode && <span style={styles.pauseBadge}>⏸️ PAUSE MODE</span>}
          {summary && (
            <span style={styles.stats}>
              {summary.totalLogs} logs • {summary.totalTime}ms
              {summary.errors > 0 && <span style={styles.errorBadge}> • {summary.errors} errors</span>}
            </span>
          )}
        </div>
        <div style={styles.headerRight}>
          {pauseMode && redirectUrl && onManualRedirect && (
            <button onClick={onManualRedirect} style={styles.redirectBtn} title="Redirecionar Agora">
              🚀 REDIRECT
            </button>
          )}
          <button onClick={() => setIsMinimized(!isMinimized)} style={styles.btn}>
            {isMinimized ? '📖' : '📕'}
          </button>
          <button onClick={exportLogs} style={styles.btn}>💾</button>
          <button onClick={clearLogs} style={styles.btn}>🗑️</button>
          <button onClick={() => setIsVisible(false)} style={styles.btn}>✖️</button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div style={styles.logsContainer}>
          {logs.length === 0 ? (
            <div style={styles.emptyState}>Aguardando logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{
                ...styles.logEntry,
                ...(log.type === 'error' && styles.logError),
                ...(log.type === 'warning' && styles.logWarning),
                ...(log.type === 'success' && styles.logSuccess)
              }}>
                <span style={styles.logTime}>+{log.timestamp}ms</span>
                <span style={styles.logMessage}>
                  {getEmoji(log.type)} {log.message}
                </span>
                {log.data && (
                  <pre style={styles.logData}>{JSON.stringify(log.data, null, 2)}</pre>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {!isMinimized && summary && (
        <div style={styles.footer}>
          <div style={styles.summaryItem}>
            ✅ {summary.success} success
          </div>
          <div style={styles.summaryItem}>
            ⚠️ {summary.warnings} warnings
          </div>
          <div style={styles.summaryItem}>
            ❌ {summary.errors} errors
          </div>
          <div style={styles.summaryItem}>
            ⏱️ {summary.totalTime}ms
          </div>
        </div>
      )}
    </div>
  );
};

function getEmoji(type) {
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

const styles = {
  container: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 600,
    maxHeight: '80vh',
    backgroundColor: '#1a1a1a',
    border: '2px solid #00ff00',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)',
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#00ff00',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottom: '1px solid #00ff00',
    backgroundColor: '#0d0d0d'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  headerRight: {
    display: 'flex',
    gap: 5
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#00ff00'
  },
  stats: {
    fontSize: 11,
    color: '#66ff66',
    opacity: 0.8
  },
  errorBadge: {
    color: '#ff4444'
  },
  pauseBadge: {
    backgroundColor: '#ffaa00',
    color: '#000',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 10
  },
  redirectBtn: {
    background: '#00ff00',
    border: 'none',
    color: '#000',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 13,
    fontWeight: 'bold',
    transition: 'all 0.2s',
    marginRight: 10
  },
  btn: {
    background: 'transparent',
    border: '1px solid #00ff00',
    color: '#00ff00',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    transition: 'all 0.2s'
  },
  logsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    maxHeight: 400
  },
  logEntry: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#0d0d0d',
    borderLeft: '3px solid #00ff00',
    borderRadius: 4
  },
  logError: {
    borderLeftColor: '#ff4444',
    backgroundColor: '#1a0d0d'
  },
  logWarning: {
    borderLeftColor: '#ffaa00',
    backgroundColor: '#1a1a0d'
  },
  logSuccess: {
    borderLeftColor: '#00ff00',
    backgroundColor: '#0d1a0d'
  },
  logTime: {
    color: '#666',
    fontSize: 10,
    marginRight: 8
  },
  logMessage: {
    color: '#00ff00',
    fontSize: 12
  },
  logData: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    fontSize: 10,
    color: '#66ff66',
    overflow: 'auto',
    maxHeight: 150
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 8,
    borderTop: '1px solid #00ff00',
    backgroundColor: '#0d0d0d',
    fontSize: 11
  },
  summaryItem: {
    padding: '4px 8px',
    borderRadius: 4,
    backgroundColor: '#1a1a1a'
  },
  emptyState: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  }
};

export default DebugPanel;
