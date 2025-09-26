import React, { useState, useEffect, useCallback, memo } from 'react';
import './App-Premium.css';
import {
  FiLink, FiPlus, FiCopy, FiExternalLink,
  FiTrendingUp, FiDollarSign, FiActivity,
  FiSettings, FiLogOut, FiSearch,
  FiMenu, FiX, FiMoon, FiSun,
  FiZap, FiShield, FiAward, FiBarChart2
} from 'react-icons/fi';
import { checkAuth, logout, AUTH_CONFIG } from './auth-config';
import { AFFILIATE_TAGS, createShortlink, detectPlatform } from './config';


// Componente Principal com Performance Otimizada
const App = memo(() => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    // Aplicar tema salvo
    document.documentElement.setAttribute('data-theme', theme);

    // Verificar autenticação
    const token = localStorage.getItem('bb_token');
    const savedUser = localStorage.getItem('bb_user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.cpf === AUTH_CONFIG.VALID_CPF) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao validar usuário:', error);
      }
    }

    setLoading(false);
  }, []);

  // Toggle tema
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  // Loading Premium
  if (loading) {
    return <LoadingScreen />;
  }

  // Login
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  // Dashboard Principal
  return <Dashboard user={user} onLogout={() => {
    logout();
    setUser(null);
  }} theme={theme} toggleTheme={toggleTheme} />;
});

// Tela de Loading Premium
const LoadingScreen = memo(() => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-spinner">
        <FiZap className="spin" size={48} />
      </div>
      <h2>BBB Link Enhancer</h2>
      <p>Carregando sistema premium...</p>
    </div>
  </div>
));

// Tela de Login Premium
const LoginScreen = memo(({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação
    const result = checkAuth(credentials.username, credentials.password);

    if (result.success) {
      localStorage.setItem('bb_token', result.token);
      localStorage.setItem('bb_user', JSON.stringify(result.user));
      onLogin(result.user);
    } else {
      setError(result.error);
      // Vibração para feedback tátil (mobile)
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
          <p>Sistema Premium de Links</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="cpf" className="sr-only">CPF</label>
            <input
              id="cpf"
              type="text"
              placeholder="CPF (apenas números)"
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value.replace(/\D/g, '')
              })}
              required
              maxLength="11"
              autoComplete="username"
              pattern="[0-9]{11}"
              title="Digite seu CPF com 11 dígitos"
              aria-label="CPF"
              aria-required="true"
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
              aria-required="true"
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
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <small>Sistema protegido • Acesso exclusivo</small>
        </div>
      </div>
    </div>
  );
});

// Dashboard Principal Premium
const Dashboard = memo(({ user, onLogout, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifications] = useState([]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiActivity, badge: null },
    { id: 'links', label: 'Shortlinks', icon: FiLink, badge: 'novo' },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2, badge: null },
    { id: 'settings', label: 'Configurações', icon: FiSettings, badge: null }
  ];

  // Fechar sidebar no mobile ao clicar em item
  const handleMenuClick = useCallback((tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K para busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-bar input')?.focus();
      }
      // Ctrl/Cmd + N para novo link
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('links');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="dashboard-container" data-theme={theme}>
      {/* Overlay para mobile */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-circle">BBB</div>
          {sidebarOpen && <span className="logo-text">Link Enhancer</span>}
        </div>

        <nav className="sidebar-nav" role="navigation">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <item.icon aria-hidden="true" />
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
          <button
            className="nav-item"
            onClick={toggleTheme}
            aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
            {sidebarOpen && <span>Tema</span>}
          </button>
          <button
            className="nav-item"
            onClick={onLogout}
            aria-label="Sair do sistema"
          >
            <FiLogOut />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" role="main">
        <header className="top-bar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="search-bar">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar links, analytics... (Ctrl+K)"
              aria-label="Buscar no sistema"
            />
          </div>

          <div className="user-menu">
            <button
              className="btn-icon notification-btn"
              aria-label={`${notifications.length} notificações`}
            >
              <FiActivity />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            <div
              className="user-avatar"
              title={user.fullName}
              role="img"
              aria-label={`Avatar de ${user.fullName}`}
            >
              {user.username[0].toUpperCase()}
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

// Dashboard View Premium
const DashboardView = memo(({ user }) => {
  const metrics = {
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    revenue: 0,
    activeLinks: 0,
    clicksToday: 0
  };

  const stats = [
    {
      title: 'Links Ativos',
      value: metrics.activeLinks,
      change: null,
      icon: FiLink,
      color: 'primary'
    },
    {
      title: 'Clicks Hoje',
      value: metrics.clicksToday,
      change: null,
      icon: FiTrendingUp,
      color: 'success'
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate}%`,
      change: null,
      icon: FiAward,
      color: 'warning'
    },
    {
      title: 'Receita Total',
      value: `R$ ${metrics.revenue.toFixed(2)}`,
      change: null,
      icon: FiDollarSign,
      color: 'info'
    }
  ];

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <h1>Bem-vindo, {user.username}!</h1>
        <p className="subtitle">Sistema funcionando perfeitamente</p>
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
            {stat.change && (
              <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Performance</h2>
          </div>
          <div className="performance-metrics">
            <div className="metric-item">
              <FiZap className="metric-icon" />
              <div>
                <div className="metric-value">-</div>
                <div className="metric-label">Redirect Speed</div>
              </div>
            </div>
            <div className="metric-item">
              <FiShield className="metric-icon" />
              <div>
                <div className="metric-value">-</div>
                <div className="metric-label">Uptime</div>
              </div>
            </div>
            <div className="metric-item">
              <FiActivity className="metric-icon" />
              <div>
                <div className="metric-value">-</div>
                <div className="metric-label">Cookie Persistence</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tags de Afiliado</h2>
          </div>
          <div className="tags-list">
            <div className="tag-item">
              <span className="tag-platform">Amazon</span>
              <span className="tag-value">{AFFILIATE_TAGS.AMAZON}</span>
              <span className="badge badge-success">Ativa</span>
            </div>
            <div className="tag-item">
              <span className="tag-platform">Mercado Livre</span>
              <span className="tag-value">{AFFILIATE_TAGS.MERCADOLIVRE}</span>
              <span className="badge badge-success">Ativa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Links View Premium
const LinksView = memo(() => {
  const [links, setLinks] = useState(() => {
    // Carregar links salvos do localStorage
    const saved = localStorage.getItem('bbb_links');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', title: '' });
  const [creating, setCreating] = useState(false);

  const handleCreateLink = async () => {
    if (!newLink.url) return;

    setCreating(true);
    const platform = detectPlatform(newLink.url);
    const result = await createShortlink(newLink.url);

    if (result.success) {
      const linkData = {
        key: result.key,
        short_url: result.shortUrl,
        dest: newLink.url,
        title: newLink.title || 'Sem título',
        platform,
        clicks: 0,
        created: new Date().toISOString()
      };

      setLinks([linkData, ...links]);
      setNewLink({ url: '', title: '' });
      setShowCreateModal(false);

      // Copiar para clipboard
      navigator.clipboard.writeText(result.shortUrl);

      // Notificação de sucesso
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Link criado!', {
          body: 'Link copiado para a área de transferência',
          icon: '/icon-192.png'
        });
      }
    }

    setCreating(false);
  };

  const copyLink = useCallback((url, e) => {
    navigator.clipboard.writeText(url);
    // Feedback visual
    const btn = e.target;
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 2000);
  }, []);

  return (
    <div className="links-view">
      <div className="view-header">
        <div>
          <h1>Shortlinks</h1>
          <p className="subtitle">Gerencie seus links turbinados</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> Novo Link
        </button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Shortlink</h2>
              <button
                className="btn-icon"
                onClick={() => setShowCreateModal(false)}
                aria-label="Fechar modal"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="link-url">URL do Produto (com sua tag)</label>
                <input
                  id="link-url"
                  type="url"
                  placeholder="https://www.amazon.com.br/dp/..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="link-title">Título (opcional)</label>
                <input
                  id="link-title"
                  type="text"
                  placeholder="Nome do produto"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
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
            <p>Crie seu primeiro shortlink turbinado</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus /> Criar Primeiro Link
            </button>
          </div>
        ) : (
          links.map((link) => (
            <div key={link.key} className="link-card">
              <div className="link-header">
                <span className={`platform-badge ${link.platform}`}>
                  {link.platform}
                </span>
                <span className="link-date">
                  {new Date(link.created).toLocaleDateString()}
                </span>
              </div>
              <h3 className="link-title">{link.title || 'Link de afiliado'}</h3>
              <div className="link-url" style={{fontSize: '12px', wordBreak: 'break-all'}}>{link.short_url}</div>
              <div className="link-stats">
                <span><FiTrendingUp /> {link.clicks} clicks</span>
              </div>
              <div className="link-actions">
                <button
                  className="btn btn-secondary"
                  onClick={(e) => copyLink(link.short_url, e)}
                >
                  <FiCopy /> Copiar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(link.short_url, '_blank')}
                >
                  <FiExternalLink /> Abrir
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
const AnalyticsView = memo(() => (
  <div className="analytics-view">
    <div className="view-header">
      <h1>Analytics</h1>
      <p className="subtitle">Métricas detalhadas em tempo real</p>
    </div>

    <div className="analytics-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Performance do Sistema</h2>
        </div>
        <div className="analytics-grid">
          <div className="analytic-item">
            <div className="analytic-label">Redirect Speed</div>
            <div className="analytic-value">-</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
          <div className="analytic-item">
            <div className="analytic-label">Cookie Persistence</div>
            <div className="analytic-value">-</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
          <div className="analytic-item">
            <div className="analytic-label">Add-to-Cart Success</div>
            <div className="analytic-value">-</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
          <div className="analytic-item">
            <div className="analytic-label">Deep Link Success</div>
            <div className="analytic-value">-</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '0%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Settings View
const SettingsView = memo(({ user }) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
  <div className="settings-view">
    <div className="view-header">
      <h1>Configurações</h1>
      <p className="subtitle">Personalize seu sistema</p>
    </div>

    <div className="settings-grid">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Perfil</h2>
        </div>
        <div className="settings-content">
          <div className="setting-item">
            <label>Nome</label>
            <input type="text" value={user.fullName} readOnly />
          </div>
          <div className="setting-item">
            <label>CPF</label>
            <input type="text" value={user.cpf} readOnly />
          </div>
          <div className="setting-item">
            <label>Email</label>
            <input type="email" value={user.email} readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Acessibilidade</h2>
        </div>
        <div className="settings-content">
          <label className="switch-container">
            <input type="checkbox" defaultChecked aria-describedby="contrast-desc" />
            <span className="switch-label">Alto Contraste</span>
            <span id="contrast-desc" className="sr-only">Aumenta o contraste das cores para melhor legibilidade</span>
          </label>
          <label className="switch-container">
            <input type="checkbox" defaultChecked={prefersReducedMotion} aria-describedby="motion-desc" />
            <span className="switch-label">Animações Reduzidas</span>
            <span id="motion-desc" className="sr-only">Reduz animações e transições para evitar desconforto</span>
          </label>
          <label className="switch-container">
            <input type="checkbox" defaultChecked aria-describedby="keyboard-desc" />
            <span className="switch-label">Atalhos de Teclado</span>
            <span id="keyboard-desc" className="sr-only">Ativa atalhos de teclado para navegação rápida</span>
          </label>
        </div>
      </div>
    </div>
  </div>
)});

export default App;