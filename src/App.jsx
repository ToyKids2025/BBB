import React, { useState, useEffect } from 'react';
import { auth, loginUser, logoutUser, monitorAuthState } from './firebase';
import { FiUser, FiLock } from 'react-icons/fi';
import LinkManager from './components/LinkManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import RemarketingDashboard from './components/RemarketingDashboard';

// Novos componentes
import CountdownTimer from './components/CountdownTimer';
import QRCodeGenerator from './components/QRCodeGenerator';
import LinkPreviewCard from './components/LinkPreviewCard';
import BulkLinkGenerator from './components/BulkLinkGenerator';
import ClickHeatmap from './components/ClickHeatmap';
import EnvironmentValidator from './components/EnvironmentValidator';
import HealthCheck from './components/HealthCheck';
import HowToGenerateLinkGuide from './components/HowToGenerateLinkGuide';

import LinkList from './components/LinkList'; // Importando o novo componente
// Utilitários
import { deviceFingerprint } from './utils/device-fingerprint';
import { notifications } from './utils/notifications';
import { abTesting } from './utils/ab-testing';

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
          <button onClick={toggleTheme} className="toggle-switch" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="login-card card glass">
          <h1 className="login-title">🚀 BuscaBuscaBrasil Premium</h1>
          <p className="login-subtitle">Sistema Avançado de Links de Afiliados</p>

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
                placeholder="Seu email de acesso"
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
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary hover-lift">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="login-footer">
              <a href="#forgot" className="forgot-password">Esqueci minha senha</a>
            </div>
          </form>

          <div className="features-list">
            <h3>✨ Recursos Premium:</h3>
            <ul>
              <li>🔄 Rotação inteligente de tags</li>
              <li>💰 Rastreamento de preços em tempo real</li>
              <li>⏰ Countdown timer FOMO</li>
              <li>📱 QR Code generator</li>
              <li>📊 A/B Testing automático</li>
              <li>🔥 Heatmap de cliques</li>
              <li>🌙 Dark Mode</li>
              <li>🔔 Notificações Discord/Telegram</li>
            </ul>
          </div>

          <div className="system-info-footer">
            <p>Sistema de Acesso Restrito</p>
            <span>Versão Premium 2.0.0</span>
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
          <h1 className="gradient-text">🚀 BuscaBuscaBrasil Premium</h1>
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
            className={`nav-btn ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            📦 Bulk Generator
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
        {/* Widget de Countdown (sempre visível) */}
        <div className="countdown-widget">
          <CountdownTimer
            endTime={Date.now() + (24 * 60 * 60 * 1000)}
            productInfo={{ discount: 30 }}
            onExpire={() => console.log('Oferta expirou!')}
          />
        </div>

        {/* Content based on active tab */}
        <div className="tab-content animate-fadeIn">
          {activeTab === 'links' && (
            <div className="links-section">
              {/* Guia Visual Adicionado */}
              <HowToGenerateLinkGuide />

              <LinkManager />

              {/* Lista de Links Gerados */}
              <LinkList />

              {/* Preview de Link Exemplo */}
              <div className="preview-section">
                <h2>📱 Preview de Link</h2>
                <LinkPreviewCard
                  linkData={{
                    id: 'demo',
                    url: 'https://www.amazon.com.br/dp/B0CJK4JG67',
                    title: 'Echo Dot 4ª Geração',
                    platform: 'amazon',
                    shortUrl: 'https://bbb.link/abc123'
                  }}
                />
              </div>

              {/* QR Code Generator */}
              <div className="qr-section">
                <h2>📱 Gerar QR Code</h2>
                <QRCodeGenerator
                  url="https://bbb.link/demo"
                  title="Link de Demonstração"
                  size={200}
                />
              </div>
            </div>
          )}

          {activeTab === 'bulk' && <BulkLinkGenerator />}
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
        }

        .login-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .login-subtitle {
          color: var(--text-secondary);
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

        .features-list {
          text-align: left;
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid var(--border-color);
        }

        .features-list h3 {
          margin-bottom: 15px;
        }

        .features-list ul {
          list-style: none;
          padding: 0;
        }

        .features-list li {
          padding: 8px 0;
          color: var(--text-secondary);
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

        .countdown-widget {
          margin-bottom: 20px;
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

        .preview-section, .qr-section {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .preview-section h2, .qr-section h2 {
          margin-bottom: 20px;
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