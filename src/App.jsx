import React, { useState, useEffect } from 'react';
import { loginUser, logoutUser, monitorAuthState } from './firebase';
import { FiUser, FiLock } from 'react-icons/fi';
import LinkManager from './components/LinkManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import RemarketingDashboard from './components/RemarketingDashboard';

// Componentes ativos (sem dados mocados)
import ClickHeatmap from './components/ClickHeatmap';
import EnvironmentValidator from './components/EnvironmentValidator';
import HealthCheck from './components/HealthCheck';
import HowToGenerateLinkGuide from './components/HowToGenerateLinkGuide';

import LinkList from './LinkList'; // CORREÇÃO: Importando da pasta correta
// Utilitários
import { deviceFingerprint } from './utils/device-fingerprint';
import { notifications } from './utils/notifications';
import { abTesting } from './utils/ab-testing';
// DESABILITADO: Commission Guardian causava erro 494 (headers muito grandes) e bloqueio no Instagram
// import { guardian } from './utils/commission-guardian';

// Estilos e tema
import './styles/theme.css';

/**
 * App Principal Completo com Todas as Melhorias
 * Sistema Premium de Gestão de Links de Afiliados
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [theme, setTheme] = useState('light');
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    // Monitor de autenticação
    const unsubscribe = monitorAuthState(async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Notificar login (apenas se configurado)
        try {
          await notifications.notifyAll('✅ Login realizado com sucesso', {
          title: '🔐 Login',
          fields: [
            { name: 'Usuário', value: user.email },
            { name: 'Horário', value: new Date().toLocaleString('pt-BR') }
          ]
        });
        } catch (err) {
          console.log('Notificações não configuradas');
        }

        // Gerar fingerprint do dispositivo
        const fp = await deviceFingerprint.generate();
        setDeviceId(fp.id);
        console.log(`📱 Device ID: ${fp.id} (Confiança: ${fp.confidence}%)`);
      }
    });

    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Inicializar A/B Testing
    initializeABTesting();

    return () => unsubscribe();
  }, []);

  const initializeABTesting = () => {
    // Criar experimentos
    const experiments = [
      {
        name: 'cta_button_test',
        variants: [
          { id: 'buy_now', name: 'Comprar Agora', color: '#4CAF50' },
          { id: 'see_offer', name: 'Ver Oferta', color: '#2196F3' },
          { id: 'save_now', name: 'Economizar Agora', color: '#FF9800' }
        ],
        metrics: ['clicks', 'conversions']
      }
    ];

    experiments.forEach(exp => {
      abTesting.createExperiment(exp);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);

    if (result.success) {
      setUser(result.user);
      setEmail('');
      setPassword('');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const result = await logoutUser();

    if (result.success) {
      setUser(null);
      await notifications.notifyAll('👋 Logout realizado', {
        title: '🔓 Logout'
      });
    }

    setLoading(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner animate-spin"></div>
        <p>Carregando sistema premium...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container animate-fadeIn">
        <div className="theme-toggle">
          <button onClick={toggleTheme} className="toggle-switch hover-glow" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="login-card card glass animate-float">
          {/* Logo animado */}
          <div className="logo-container">
            <div className="logo-animation">
              <div className="rotating-circle"></div>
              <div className="pulse-dot"></div>
            </div>
          </div>

          <h1 className="login-title gradient-text animate-gradient">BuscaBusca Brasil</h1>
          <p className="login-subtitle neon-text">🚀 WEB3 AFFILIATE PLATFORM</p>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="email"
                placeholder="Email corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary hover-lift animate-neon-pulse">
              {loading ? '⚡ Autenticando...' : '🔐 ACESSAR PLATAFORMA WEB3'}
            </button>
          </form>

          {/* Seção de desenvolvimento */}
          <div className="development-notice">
            <div className="dev-header">
              <div className="status-indicator">
                <div className="status-dot pulsing"></div>
                <span className="status-text">Em Desenvolvimento</span>
              </div>
            </div>

            <div className="dev-content">
              <p className="dev-description">
                Plataforma em fase de testes e aprimoramentos contínuos
              </p>
              <div className="dev-features">
                <span className="badge badge-neon">🔒 PRIVATE ACCESS</span>
                <span className="badge badge-neon">⚡ LIGHTNING FAST</span>
                <span className="badge badge-neon">🛡️ BLOCKCHAIN SECURE</span>
              </div>
            </div>
          </div>

          <div className="system-info-footer">
            <p className="gradient-text-2">⚡ WEB3 AFFILIATE TECHNOLOGY</p>
            <span style={{color: 'var(--neon-green)'}}>v3.0.0 • NEXT-GEN</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <EnvironmentValidator />

      {/* Header */}
      <header className="app-header glass">
        <div className="header-content">
          <h1 className="gradient-text animate-gradient">⚡ BuscaBusca WEB3</h1>
          <div className="header-actions">
            <span className="user-info">
              👤 {user.email} | 📱 Device: {deviceId?.substring(0, 8)}...
            </span>
            <button onClick={toggleTheme} className="theme-btn">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            🔗 Links
          </button>
          <button
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button
            className={`nav-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            🗺️ Heatmap
          </button>
          <button
            className={`nav-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            📈 Monitoramento
          </button>
          <button
            className={`nav-btn ${activeTab === 'remarketing' ? 'active' : ''}`}
            onClick={() => setActiveTab('remarketing')}
          >
            🎯 Remarketing
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Content based on active tab */}
        <div className="tab-content animate-fadeIn">
          {activeTab === 'links' && (
            <div className="links-section">
              {/* Guia Visual */}
              <HowToGenerateLinkGuide />

              {/* Gerador de Links */}
              <LinkManager />

              {/* Lista de Links Gerados */}
              <LinkList />
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'heatmap' && <ClickHeatmap />}
          {activeTab === 'monitoring' && (
            <div className="monitoring-section">
              <MonitoringDashboard />
              <HealthCheck />
            </div>
          )}
          {activeTab === 'remarketing' && <RemarketingDashboard />}
        </div>
      </main>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: var(--accent-gradient);
          color: white;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-gradient);
          padding: 20px;
        }

        .login-card {
          max-width: 450px;
          width: 100%;
          padding: 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Logo animado */
        .logo-container {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }

        .logo-animation {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .rotating-circle {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 3px solid transparent;
          border-top: 3px solid var(--accent-color);
          border-radius: 50%;
          animation: rotate 2s linear infinite;
        }

        .pulse-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: var(--accent-gradient);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.7;
          }
        }

        .login-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 30px;
        }

        .login-form {
          margin: 30px 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .error-message {
          background: var(--error-bg);
          color: var(--error);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--error);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: var(--text-secondary);
        }

        .input-wrapper .input {
          padding-left: 45px;
        }

        .login-footer {
          text-align: right;
          margin-top: 10px;
        }

        .forgot-password {
          font-size: 12px;
          color: var(--text-secondary);
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        /* Seção de desenvolvimento */
        .development-notice {
          margin: 30px 0;
          padding: 25px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .dev-header {
          margin-bottom: 20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          background: #ffd700;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .status-dot.pulsing {
          animation: statusPulse 2s ease-in-out infinite;
        }

        @keyframes statusPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .status-text {
          color: #ffd700;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dev-content {
          text-align: center;
        }

        .dev-description {
          color: var(--text-secondary);
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.5;
        }

        .dev-features {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .feature-tag {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 12px;
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }

        .system-info-footer {
          margin-top: 30px;
          font-size: 12px;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .system-info-footer p {
          margin: 0;
          font-weight: bold;
        }

        .app-container {
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: 20px;
        }

        .header-content {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-info {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .theme-btn {
          background: var(--bg-tertiary);
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
        }

        .app-nav {
          display: flex;
          gap: 10px;
          padding: 0 20px 20px;
          overflow-x: auto;
        }

        .nav-btn {
          padding: 10px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-btn:hover {
          background: var(--bg-tertiary);
        }

        .nav-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
        }

        .app-main {
          padding: 0 20px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tab-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--shadow-md);
        }

        .monitoring-section {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .links-section {
          display: grid;
          gap: 30px;
          grid-template-columns: 1fr; /* Garante que o guia ocupe a largura total */
        }

        @media (min-width: 1024px) {
          .links-section {
            grid-template-columns: 1fr 1fr;
          }
        }
        .links-section > *:nth-child(3) { /* Estilo para o LinkList ocupar a largura toda */
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }

          .app-nav {
            flex-wrap: wrap;
          }

          .user-info {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;