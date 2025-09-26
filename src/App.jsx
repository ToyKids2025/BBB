import React, { useState, useEffect, useCallback, memo } from 'react';
import './App-Premium.css';
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
import {
  saveLink,
  getLinks,
  updateLinkClick,
  getAnalyticsData,
  sendTelegramNotification
} from './firebase';
import { isValidUrl, isSupportedProductUrl, sanitizeUrl, checkRateLimit } from './utils/validation';

// Componente Principal com Firebase
const App = memo(() => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    if (!newLink.url) return;

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
    const rateLimit = checkRateLimit(user.uid, 30, 60000); // 30 links por minuto
    if (!rateLimit.allowed) {
      alert(`Limite excedido. Aguarde ${Math.ceil(rateLimit.remainingTime / 1000)} segundos.`);
      return;
    }

    setCreating(true);

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

    const result = await saveLink(linkData);

    if (result.success) {
      await loadLinks(); // Recarregar lista
      setNewLink({ url: '', title: '' });
      setShowCreateModal(false);

      // Copiar para clipboard
      navigator.clipboard.writeText(urlWithTag);

      // Notificar sucesso
      await sendTelegramNotification(
        `✅ <b>Link criado com sucesso!</b>\n` +
        `📌 Título: ${linkData.title}\n` +
        `🔗 URL: ${urlWithTag}\n` +
        `📋 Copiado para área de transferência`
      );
    }

    setCreating(false);
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
                <div className="link-url" style={{fontSize: '12px', wordBreak: 'break-all', padding: '8px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '10px'}}>
                  {link.originalUrl || link.url}
                </div>
                <div style={{fontSize: '11px', color: '#999', marginBottom: '5px'}}>Link com Tag de Afiliado (copie este):</div>
                <div className="link-url" style={{fontSize: '12px', wordBreak: 'break-all', padding: '8px', background: '#e8f5e9', borderRadius: '4px', border: '1px solid #4caf50'}}>
                  {link.url}
                </div>
              </div>
              <div className="link-stats">
                <span><FiTrendingUp /> {link.clicks || 0} clicks</span>
              </div>
              <div className="link-actions">
                <button className="btn btn-primary" onClick={(e) => copyLink(link.url, e)}>
                  <FiCopy /> Copiar Link
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await updateLinkClick(link.id);
                    window.open(link.url, '_blank');
                  }}
                >
                  <FiExternalLink /> Testar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Confira esta oferta: ${link.url}`)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  📱 WhatsApp
                </button>
              </div>
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