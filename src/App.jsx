import React, { useState, useEffect, useCallback, memo } from 'react';
import './App-Premium.css';
import './LinkEnhancer.css';
import {
  FiLink, FiPlus, FiCopy, FiExternalLink,
  FiTrendingUp, FiDollarSign, FiActivity,
  FiSettings, FiLogOut, FiSearch,
  FiMenu, FiX, FiMoon, FiSun,
  FiZap, FiShield, FiAward, FiBarChart2,
  FiDownload, FiBell
} from 'react-icons/fi';
import { AUTH_SERVICE } from './auth-service';
import { AFFILIATE_TAGS, detectPlatform, addAffiliateTag } from './config';
import MonitoringDashboard from './components/MonitoringDashboard';
import {
  saveLink,
  getLinks,
  updateLinkClick,
  getAnalyticsData,
  sendTelegramNotification
} from './firebase';
import { isValidUrl, isSupportedProductUrl, sanitizeUrl, checkRateLimit } from './utils/validation';
import { EternalTrackingSystem, AmazonSubscribeLinks } from './utils/eternal-tracking';
import { remarketingSystem } from './utils/remarketing-fomo';
import RemarketingDashboard from './components/RemarketingDashboard';
import { UltimateCookieSync } from './utils/ultimate-cookie-sync';

// Componente Principal com Firebase
const App = memo(() => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );
  const [trackingSystem, setTrackingSystem] = useState(null);
  const [ultimateSync, setUltimateSync] = useState(null);

  useEffect(() => {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Inicializar sistema de tracking eterno
    const initTracking = async () => {
      const tracker = new EternalTrackingSystem({
        affiliateTag: AFFILIATE_TAGS.AMAZON,
        baseUrl: window.location.origin,
        enableAllFeatures: true
      });

      await tracker.initialize({
        source: 'app_load',
        platform: 'web',
        userId: user?.uid || 'anonymous'
      });

      setTrackingSystem(tracker);
      window.BBBTracker = tracker; // Exportar para debug

      console.log('🔥 Eternal Tracking System ativado!');

      // Inicializar sistema de remarketing FOMO
      await remarketingSystem.initialize();
      console.log('🔥 Sistema de Remarketing FOMO ativado!');

      // Inicializar Ultimate Cookie Sync para garantir comissões
      const sync = new UltimateCookieSync({
        mercadoLivre: AFFILIATE_TAGS.MERCADO_LIVRE || 'alexand68-20',
        amazon: AFFILIATE_TAGS.AMAZON || 'buscabrasil-20'
      });

      await sync.initialize();
      setUltimateSync(sync);
      window.BBBUltimateSync = sync; // Exportar para debug

      console.log('🚀 Ultimate Cookie Sync ativado - Comissões garantidas!');
    };

    initTracking();
  }, [user]);

  useEffect(() => {
    // Monitor de autenticação Firebase
    const unsubscribe = AUTH_SERVICE.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Alexandre'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle tema
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  // Loading
  if (loading) {
    return <LoadingScreen />;
  }

  // Login
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Dashboard
  return (
    <Dashboard
      user={user}
      onLogout={async () => {
        await AUTH_SERVICE.logout();
        setUser(null);
      }}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
});

// Tela de Loading
const LoadingScreen = memo(() => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-spinner">
        <FiZap className="spin" size={48} />
      </div>
      <h2>BBB Link Enhancer</h2>
      <p>Sistema Premium com Firebase</p>
    </div>
  </div>
));

// Tela de Login com Firebase
const LoginScreen = memo(({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await AUTH_SERVICE.login(credentials.email, credentials.password);

    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error);
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-circle">BBB</div>
          <h1>Busca Busca Brasil</h1>
          <p>Sistema Premium com Firebase + Telegram</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required
              autoComplete="username"
              aria-label="Email"
              autoFocus
            />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password" className="sr-only">Senha</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
              autoComplete="current-password"
              aria-label="Senha"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <FiX /> : <FiShield />}
            </button>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <small>🔒 Autenticação Firebase • 🤖 Notificações Telegram</small>
        </div>
      </div>
    </div>
  );
});

// Dashboard Principal
const Dashboard = memo(({ user, onLogout, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifications] = useState([]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiActivity, badge: null },
    { id: 'links', label: 'Shortlinks', icon: FiLink, badge: 'Firebase' },
    { id: 'analytics', label: 'Analytics Real', icon: FiBarChart2, badge: 'Live' },
    { id: 'monitoring', label: 'Monitoramento', icon: FiActivity, badge: 'Daily' },
    { id: 'remarketing', label: 'Remarketing FOMO', icon: FiBell, badge: '🔥' },
    { id: 'settings', label: 'Configurações', icon: FiSettings, badge: null }
  ];

  const handleMenuClick = useCallback((tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="dashboard-container" data-theme={theme}>
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-circle">BBB</div>
          {sidebarOpen && <span className="logo-text">Link Pro</span>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon />
              {sidebarOpen && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={toggleTheme}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
            {sidebarOpen && <span>Tema</span>}
          </button>
          <button className="nav-item" onClick={onLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="search-bar">
            <FiSearch />
            <input type="search" placeholder="Buscar..." />
          </div>

          <div className="user-menu">
            <button className="btn-icon notification-btn">
              <FiBell />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            <div className="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content">
          {activeTab === 'dashboard' && <DashboardView user={user} />}
          {activeTab === 'links' && <LinksView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'monitoring' && <MonitoringDashboard />}
          {activeTab === 'remarketing' && <RemarketingDashboard />}
          {activeTab === 'settings' && <SettingsView user={user} />}
        </div>
      </main>
    </div>
  );
});

// Dashboard View com Firebase Analytics
const DashboardView = memo(({ user }) => {
  const [metrics, setMetrics] = useState({
    totalLinks: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const result = await getAnalyticsData();
    if (result.success) {
      setMetrics(result.data);
    }
    setLoading(false);
  };

  const stats = [
    {
      title: 'Links Ativos',
      value: metrics.totalLinks,
      icon: FiLink,
      color: 'primary'
    },
    {
      title: 'Clicks Total',
      value: metrics.totalClicks,
      icon: FiTrendingUp,
      color: 'success'
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate}%`,
      icon: FiAward,
      color: 'warning'
    },
    {
      title: 'Receita Total',
      value: `R$ ${metrics.totalRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'info'
    }
  ];

  if (loading) {
    return <div className="loading">Carregando analytics...</div>;
  }

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <h1>Dashboard Firebase</h1>
        <p className="subtitle">Métricas em tempo real</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sistema Ativo</h2>
          </div>
          <div className="performance-metrics">
            <div className="metric-item">
              <FiZap className="metric-icon" />
              <div>
                <div className="metric-value">✅</div>
                <div className="metric-label">Firebase</div>
              </div>
            </div>
            <div className="metric-item">
              <FiBell className="metric-icon" />
              <div>
                <div className="metric-value">✅</div>
                <div className="metric-label">Telegram Bot</div>
              </div>
            </div>
            <div className="metric-item">
              <FiShield className="metric-icon" />
              <div>
                <div className="metric-value">✅</div>
                <div className="metric-label">Auth Seguro</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tags Configuradas</h2>
          </div>
          <div className="tags-list">
            <div className="tag-item">
              <span className="tag-platform">Amazon</span>
              <span className="tag-value">{AFFILIATE_TAGS.AMAZON}</span>
              <span className="badge badge-success">✅</span>
            </div>
            <div className="tag-item">
              <span className="tag-platform">Mercado Livre</span>
              <span className="tag-value">{AFFILIATE_TAGS.MERCADOLIVRE}</span>
              <span className="badge badge-success">✅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Links View com Firebase
const LinksView = memo(() => {
  const [links, setLinks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obter usuário atual
    AUTH_SERVICE.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
  }, []);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const result = await getLinks();
    if (result.success) {
      setLinks(result.links);
    }
    setLoading(false);
  };

  const handleCreateLink = async () => {
    if (!newLink.url) {
      alert('Por favor, insira uma URL do produto');
      return;
    }

    // Validar URL
    if (!isValidUrl(newLink.url)) {
      alert('Por favor, insira uma URL válida');
      return;
    }

    if (!isSupportedProductUrl(newLink.url)) {
      alert('Esta plataforma ainda não é suportada. Use Amazon, Mercado Livre, Magazine Luiza, etc.');
      return;
    }

    // Rate limiting
    const rateLimit = checkRateLimit(user?.uid || 'anonymous', 30, 60000); // 30 links por minuto
    if (!rateLimit.allowed) {
      alert(`Limite excedido. Aguarde ${Math.ceil(rateLimit.remainingTime / 1000)} segundos.`);
      return;
    }

    setCreating(true);

    try {
      // Sanitizar URL
      const cleanUrl = sanitizeUrl(newLink.url);
      const platform = detectPlatform(cleanUrl);
      const urlWithTag = addAffiliateTag(cleanUrl, platform);

      const linkData = {
        url: urlWithTag,
        originalUrl: newLink.url,
        title: newLink.title || `Link ${platform}`,
        platform,
        clicks: 0
      };

      // Adicionar links especiais Amazon Subscribe & Save
      if (platform === 'amazon') {
        const amazonHelper = new AmazonSubscribeLinks(AFFILIATE_TAGS.AMAZON);
        const subscribeLinks = amazonHelper.createSubscribeLink(newLink.url);
        linkData.subscribeLinks = subscribeLinks;
        console.log('🛒 Links Subscribe & Save gerados:', subscribeLinks);
      }

      // Rastrear criação de link com sistema eterno
      if (window.BBBTracker) {
        window.BBBTracker.trackEvent('link_created', linkData);
      }

      const result = await saveLink(linkData);

      if (result.success) {
        // Rastrear click para remarketing FOMO
        await remarketingSystem.trackClick(linkData);
        console.log('📍 Click rastreado para remarketing FOMO');

        await loadLinks(); // Recarregar lista
        setNewLink({ url: '', title: '' });
        setShowCreateModal(false);

        // Copiar para clipboard com feedback visual
        try {
          await navigator.clipboard.writeText(urlWithTag);
          // Mostrar feedback de sucesso
          const successMsg = document.createElement('div');
          successMsg.className = 'copy-success-toast';
          successMsg.textContent = '✅ Link criado e copiado!';
          successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4caf50;color:white;padding:15px;border-radius:8px;z-index:9999;animation:slideIn 0.3s ease';
          document.body.appendChild(successMsg);
          setTimeout(() => successMsg.remove(), 3000);
        } catch (clipErr) {
          console.error('Erro ao copiar:', clipErr);
          alert(`Link criado com sucesso!\n\n${urlWithTag}\n\nCopie o link acima.`);
        }

        // Notificar sucesso
        await sendTelegramNotification(
          `✅ <b>Link criado com sucesso!</b>\n` +
          `📌 Título: ${linkData.title}\n` +
          `🔗 URL Original: ${newLink.url}\n` +
          `✅ URL com Tag: ${urlWithTag}\n` +
          `📋 Status: Copiado para clipboard`
        );
      } else {
        alert(`Erro ao criar link: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao criar link:', error);
      alert('Erro ao criar link. Verifique o console.');
    } finally {
      setCreating(false);
    }
  };

  const handleExportLinks = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `bbb-links-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyLink = useCallback((url, e) => {
    if (!url) {
      console.error('URL vazia');
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      const btn = e && e.currentTarget;
      if (btn) {
        const originalText = btn.textContent || 'Copiar Link';
        const originalBg = btn.style.background || '';

        btn.textContent = '✅ Copiado!';
        btn.style.background = '#4caf50';

        setTimeout(() => {
          if (btn) {
            btn.textContent = originalText;
            btn.style.background = originalBg;
          }
        }, 2000);
      }
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      // Fallback para método antigo
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        if (e && e.currentTarget) {
          e.currentTarget.textContent = '✅ Copiado!';
        }
      } catch (err2) {
        alert('Erro ao copiar. URL: ' + url);
      }

      document.body.removeChild(textArea);
    });
  }, []);

  if (loading) {
    return <div className="loading">Carregando links...</div>;
  }

  return (
    <div className="links-view">
      <div className="view-header">
        <div>
          <h1>Shortlinks Firebase</h1>
          <p className="subtitle">Links salvos na nuvem</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportLinks}>
            <FiDownload /> Exportar
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Novo Link
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Link com Tag de Afiliado</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>URL do Produto</label>
                <input
                  type="url"
                  placeholder="https://www.amazon.com.br/dp/..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Título (opcional)</label>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateLink}
                disabled={!newLink.url || creating}
              >
                {creating ? 'Criando...' : 'Criar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="links-grid">
        {links.length === 0 ? (
          <div className="empty-state">
            <FiLink size={48} />
            <h3>Nenhum link ainda</h3>
            <p>Links salvos no Firebase Firestore</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Criar Primeiro Link
            </button>
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="link-card">
              <div className="link-header">
                <span className={`platform-badge ${link.platform}`}>
                  {link.platform}
                </span>
                <span className="link-date">
                  {new Date(link.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="link-title">{link.title}</h3>
              <div style={{marginBottom: '15px'}}>
                <div style={{fontSize: '11px', color: '#999', marginBottom: '5px'}}>URL Original:</div>
                <div className="link-url original-url" style={{fontSize: '12px', wordBreak: 'break-all', padding: '8px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '10px', userSelect: 'text', cursor: 'text'}}>
                  {link.originalUrl || link.url}
                </div>
                <div style={{fontSize: '11px', color: '#4caf50', fontWeight: 'bold', marginBottom: '5px'}}>✅ Link com Tag de Afiliado (COPIE ESTE):</div>
                <div className="link-url affiliate-url" style={{fontSize: '13px', fontWeight: '600', wordBreak: 'break-all', padding: '10px', background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)', borderRadius: '6px', border: '2px solid #4caf50', userSelect: 'all', cursor: 'pointer'}} onClick={(e) => copyLink(link.url, e)}>
                  {link.url}
                </div>
              </div>
              <div className="link-stats">
                <span><FiTrendingUp /> {link.clicks || 0} clicks</span>
              </div>
              <div className="link-actions">
                <button className="btn btn-primary" style={{background: 'linear-gradient(135deg, #4caf50, #45a049)', fontWeight: 'bold'}} onClick={(e) => {
                  copyLink(link.url, e);
                  // Rastrear cópia com sistema eterno
                  if (window.BBBTracker) {
                    window.BBBTracker.trackEvent('link_copied', { linkId: link.id, platform: link.platform });
                  }
                  // Ativar Ultimate Cookie Sync para garantir comissão
                  if (window.BBBUltimateSync) {
                    window.BBBUltimateSync.trackAffiliateClick(link.url, link.platform);
                    console.log('💰 Cookie sync ativado - comissão garantida mesmo se voltar direto!');
                  }
                }}>
                  <FiCopy /> COPIAR LINK
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      await updateLinkClick(link.id);
                      await loadLinks(); // Atualizar contadores
                      // Rastrear click com sistema eterno
                      if (window.BBBTracker) {
                        window.BBBTracker.trackEvent('link_test_click', { linkId: link.id, platform: link.platform });
                      }
                    } catch (err) {
                      console.error('Erro ao atualizar click:', err);
                    }
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FiExternalLink /> Testar
                </button>
                <button
                  className="btn btn-secondary"
                  style={{background: '#25D366', color: 'white'}}
                  onClick={() => {
                    const whatsappText = `🅱️ *OFERTA IMPERDÍVEL!*\n\n${link.title || 'Confira este produto'}\n\n🔗 Link: ${link.url}\n\n_Via Busca Busca Brasil_`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  📱 WhatsApp
                </button>
              </div>
              {link.platform === 'amazon' && link.subscribeLinks && (
                <div className="subscribe-links" style={{marginTop: '10px', padding: '10px', background: '#fef3c7', borderRadius: '6px', fontSize: '12px'}}>
                  <strong style={{color: '#d97706'}}>🛒 Links Subscribe & Save:</strong>
                  <div style={{marginTop: '5px'}}>
                    <button
                      className="btn btn-sm"
                      style={{marginRight: '5px', background: '#ff9900', color: 'white', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                      onClick={() => {
                        navigator.clipboard.writeText(link.subscribeLinks.subscribe);
                        alert('Link Subscribe copiado!');
                      }}
                    >
                      Assinar
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{background: '#ff9900', color: 'white', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                      onClick={() => {
                        navigator.clipboard.writeText(link.subscribeLinks.subscribeCart);
                        alert('Link Carrinho + Subscribe copiado!');
                      }}
                    >
                      Carrinho + Subscribe
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

// Analytics View
const AnalyticsView = memo(() => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const result = await getAnalyticsData();
    if (result.success) {
      setAnalytics(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Carregando analytics...</div>;
  }

  return (
    <div className="analytics-view">
      <div className="view-header">
        <h1>Analytics Firebase</h1>
        <p className="subtitle">Dados reais do Firestore</p>
      </div>

      <div className="analytics-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Performance Geral</h2>
          </div>
          <div className="analytics-grid">
            <div className="analytic-item">
              <div className="analytic-label">Total de Links</div>
              <div className="analytic-value">{analytics?.totalLinks || 0}</div>
            </div>
            <div className="analytic-item">
              <div className="analytic-label">Total de Clicks</div>
              <div className="analytic-value">{analytics?.totalClicks || 0}</div>
            </div>
            <div className="analytic-item">
              <div className="analytic-label">Conversões</div>
              <div className="analytic-value">{analytics?.totalConversions || 0}</div>
            </div>
            <div className="analytic-item">
              <div className="analytic-label">Taxa de Conversão</div>
              <div className="analytic-value">{analytics?.conversionRate || 0}%</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Receita</h2>
          </div>
          <div className="revenue-display">
            <div className="revenue-value">
              R$ {analytics?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <div className="revenue-label">Total Acumulado</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Settings View
const SettingsView = memo(({ user }) => (
  <div className="settings-view">
    <div className="view-header">
      <h1>Configurações</h1>
      <p className="subtitle">Sistema integrado</p>
    </div>

    <div className="settings-grid">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Conta Firebase</h2>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label>Email</label>
            <input type="text" value={user.email} readOnly />
          </div>
          <div className="setting-item">
            <label>UID</label>
            <input type="text" value={user.uid} readOnly />
          </div>
          <div className="setting-item">
            <label>Nome</label>
            <input type="text" value={user.displayName || 'Alexandre'} readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Integrações</h2>
        </div>
        <div className="settings-content">
          <div className="integration-status">
            <span>🔥 Firebase</span>
            <span className="badge badge-success">Conectado</span>
          </div>
          <div className="integration-status">
            <span>🤖 Telegram Bot</span>
            <span className="badge badge-success">Ativo</span>
          </div>
          <div className="integration-status">
            <span>📊 Analytics</span>
            <span className="badge badge-success">Rodando</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export default App;