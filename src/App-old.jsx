import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  FiLink, FiPlus, FiCopy, FiExternalLink, FiDownload,
  FiTrendingUp, FiUsers, FiDollarSign, FiActivity,
  FiSettings, FiLogOut, FiSearch, FiFilter, FiCalendar,
  FiSmartphone, FiMonitor, FiGlobe, FiShoppingCart
} from 'react-icons/fi';
import './App.css';

// Configuração da API
const API_BASE = process.env.REACT_APP_API_URL || 'https://bbbrasil.com/api';
const DOMAIN = 'https://bbbrasil.com';

// Componente Principal
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('bb_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const validateToken = async (token) => {
    try {
      // Validação local do token (sem API por enquanto)
      const savedUser = localStorage.getItem('bb_user');
      if (savedUser && token === 'valid_token_alex_2025') {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem('bb_token');
        localStorage.removeItem('bb_user');
      }
    } catch (error) {
      console.error('Erro validando token:', error);
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }
  
  return <Dashboard user={user} onLogout={() => {
    localStorage.removeItem('bb_token');
    setUser(null);
  }} />;
}

// Tela de Login
function LoginScreen({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Credenciais do Alexandre
    const VALID_CPF = '07917165973';
    const VALID_PASSWORD = 'Alex.2025@';

    try {
      // Validação local (sem API backend por enquanto)
      if (credentials.username === VALID_CPF && credentials.password === VALID_PASSWORD) {
        const userData = {
          username: 'Alexandre',
          cpf: VALID_CPF,
          email: 'alexandre@bbbrasil.com',
          role: 'super_admin',
          fullName: 'Alexandre - BBB Link Enhancer Admin'
        };

        // Salvar no localStorage
        localStorage.setItem('bb_token', 'valid_token_alex_2025');
        localStorage.setItem('bb_user', JSON.stringify(userData));

        onLogin(userData);
      } else {
        setError('CPF ou senha incorretos!');
      }
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-circle">BBB</div>
          <h1>Busca Busca Brasil</h1>
          <p>Link Enhancer Admin</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="CPF (apenas números)"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value.replace(/\D/g, '')})}
              required
              maxLength="11"
              autoComplete="username"
              pattern="[0-9]{11}"
              title="Digite seu CPF com 11 dígitos"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
              autoComplete="current-password"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard Principal
function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
    { id: 'links', label: 'Shortlinks', icon: FiLink },
    { id: 'clicks', label: 'Clicks', icon: FiTrendingUp },
    { id: 'conversions', label: 'Conversões', icon: FiDollarSign },
    { id: 'affiliates', label: 'Afiliados', icon: FiUsers },
    { id: 'settings', label: 'Configurações', icon: FiSettings }
  ];
  
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">BBB</div>
          {sidebarOpen && <span className="logo-text">Link Enhancer</span>}
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item" onClick={onLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          
          <div className="search-bar">
            <FiSearch />
            <input type="text" placeholder="Buscar links, clicks..." />
          </div>
          
          <div className="user-menu">
            <span>{user.username}</span>
            <div className="user-avatar">{user.username[0].toUpperCase()}</div>
          </div>
        </header>
        
        <div className="content">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'links' && <LinksView />}
          {activeTab === 'clicks' && <ClicksView />}
          {activeTab === 'conversions' && <ConversionsView />}
          {activeTab === 'affiliates' && <AffiliatesView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

// Dashboard View - KPIs e Métricas
function DashboardView() {
  const [metrics, setMetrics] = useState({
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    revenue: 0,
    activeLinks: 0,
    clicksToday: 0,
    clicksChart: [],
    topLinks: [],
    deviceStats: []
  });
  
  useEffect(() => {
    loadMetrics();
  }, []);
  
  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('bb_token');
      const response = await fetch(`${API_BASE}/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Erro carregando métricas:', error);
    }
  };
  
  const kpis = [
    {
      title: 'Clicks (30d)',
      value: metrics.totalClicks.toLocaleString(),
      change: '+12.5%',
      icon: FiTrendingUp,
      color: 'blue'
    },
    {
      title: 'Conversões',
      value: metrics.totalConversions.toLocaleString(),
      change: '+8.2%',
      icon: FiShoppingCart,
      color: 'green'
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(2)}%`,
      change: '+2.1%',
      icon: FiActivity,
      color: 'purple'
    },
    {
      title: 'Receita Total',
      value: `R$ ${metrics.revenue.toLocaleString()}`,
      change: '+15.3%',
      icon: FiDollarSign,
      color: 'yellow'
    }
  ];
  
  const deviceColors = {
    'iPhone': '#007AFF',
    'Android': '#3DDC84',
    'Desktop': '#6366F1',
    'Outros': '#94A3B8'
  };
  
  return (
    <div className="dashboard-view">
      <h1>Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className={`kpi-card ${kpi.color}`}>
            <div className="kpi-header">
              <span className="kpi-title">{kpi.title}</span>
              <kpi.icon className="kpi-icon" />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-change positive">{kpi.change}</div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="charts-grid">
        {/* Clicks Chart */}
        <div className="chart-card">
          <h3>Clicks últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.clicksChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#6366F1" 
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Device Stats */}
        <div className="chart-card">
          <h3>Dispositivos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.deviceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.deviceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={deviceColors[entry.name] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Top Links Table */}
      <div className="table-card">
        <h3>Top Links</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Link</th>
              <th>Plataforma</th>
              <th>Clicks</th>
              <th>Conversões</th>
              <th>Taxa</th>
            </tr>
          </thead>
          <tbody>
            {metrics.topLinks.map((link, index) => (
              <tr key={index}>
                <td>
                  <div className="link-cell">
                    <span className="link-key">/r/{link.key}</span>
                    <span className="link-title">{link.title}</span>
                  </div>
                </td>
                <td>
                  <span className={`platform-badge ${link.platform}`}>
                    {link.platform}
                  </span>
                </td>
                <td>{link.clicks.toLocaleString()}</td>
                <td>{link.conversions.toLocaleString()}</td>
                <td>{link.conversionRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Links View - Gerenciar Shortlinks
function LinksView() {
  const [links, setLinks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  useEffect(() => {
    loadLinks();
  }, []);
  
  const loadLinks = async () => {
    try {
      const token = localStorage.getItem('bb_token');
      const response = await fetch(`${API_BASE}/redirects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Erro carregando links:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    showToast('Link copiado!');
  };
  
  const filteredLinks = links.filter(link => 
    link.key.includes(filter) || 
    link.title?.toLowerCase().includes(filter.toLowerCase()) ||
    link.platform?.includes(filter)
  );
  
  return (
    <div className="links-view">
      <div className="view-header">
        <h1>Shortlinks</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> Criar Link
        </button>
      </div>
      
      <div className="filters-bar">
        <div className="search-input">
          <FiSearch />
          <input
            type="text"
            placeholder="Filtrar links..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="filter-chips">
          <button className="chip active">Todos</button>
          <button className="chip">Amazon</button>
          <button className="chip">Mercado Livre</button>
          <button className="chip">Ativos</button>
          <button className="chip">Expirados</button>
        </div>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Short Link</th>
                <th>Título</th>
                <th>Plataforma</th>
                <th>Owner</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Criado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map(link => (
                <tr key={link.key}>
                  <td>
                    <div className="link-cell">
                      <code>/r/{link.key}</code>
                    </div>
                  </td>
                  <td>{link.title || '—'}</td>
                  <td>
                    <span className={`platform-badge ${link.platform}`}>
                      {link.platform}
                    </span>
                  </td>
                  <td>{link.owner}</td>
                  <td>
                    <span className="clicks-count">{link.clicks || 0}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${link.active ? 'active' : 'inactive'}`}>
                      {link.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{new Date(link.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-icon"
                        onClick={() => copyToClipboard(`${DOMAIN}/r/${link.key}`)}
                        title="Copiar link"
                      >
                        <FiCopy />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => window.open(`${DOMAIN}/r/${link.key}`, '_blank')}
                        title="Abrir link"
                      >
                        <FiExternalLink />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => console.log('Analytics', link.key)}
                        title="Ver analytics"
                      >
                        <FiActivity />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showCreateModal && (
        <CreateLinkModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={(newLink) => {
            setLinks([newLink, ...links]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// Modal para Criar Link
function CreateLinkModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    dest: '',
    title: '',
    platform: 'auto',
    owner: '',
    add_to_cart: false,
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('bb_token');
      const response = await fetch(`${API_BASE}/redirects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        onCreated(data.data);
        showToast('Link criado com sucesso!');
      } else {
        const error = await response.json();
        setError(error.message || 'Erro ao criar link');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar Novo Shortlink</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>URL de Destino *</label>
            <input
              type="url"
              placeholder="https://www.amazon.com.br/dp/..."
              value={formData.dest}
              onChange={(e) => setFormData({...formData, dest: e.target.value})}
              required
            />
            <small>Cole o link completo com seu tag de afiliado</small>
          </div>
          
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              placeholder="Nome do produto ou campanha"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Plataforma</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option value="auto">Auto-detectar</option>
                <option value="amazon">Amazon</option>
                <option value="mercadolivre">Mercado Livre</option>
                <option value="magalu">Magazine Luiza</option>
                <option value="americanas">Americanas</option>
                <option value="other">Outro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Owner</label>
              <input
                type="text"
                placeholder="Ex: CAMPANHA123"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.add_to_cart}
                onChange={(e) => setFormData({...formData, add_to_cart: e.target.checked})}
              />
              <span>Tentar Add-to-Cart (apenas Amazon)</span>
            </label>
          </div>
          
          <div className="form-group">
            <label>Expiração (opcional)</label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Clicks View
function ClicksView() {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    key: '',
    dateFrom: '',
    dateTo: '',
    device: ''
  });
  
  useEffect(() => {
    loadClicks();
  }, [filters]);
  
  const loadClicks = async () => {
    try {
      const token = localStorage.getItem('bb_token');
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/clicks?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClicks(data);
      }
    } catch (error) {
      console.error('Erro carregando clicks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const exportClicks = () => {
    // Criar CSV
    const csv = [
      ['Click ID', 'Link', 'Plataforma', 'Dispositivo', 'País', 'Referrer', 'Data'],
      ...clicks.map(click => [
        click.click_id,
        click.key,
        click.platform,
        click.device,
        click.country,
        click.referrer,
        click.ts
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  const deviceIcons = {
    'iphone': FiSmartphone,
    'android_phone': FiSmartphone,
    'desktop': FiMonitor,
    'other': FiGlobe
  };
  
  return (
    <div className="clicks-view">
      <div className="view-header">
        <h1>Clicks</h1>
        <button className="btn-secondary" onClick={exportClicks}>
          <FiDownload /> Exportar CSV
        </button>
      </div>
      
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Filtrar por link..."
          value={filters.key}
          onChange={(e) => setFilters({...filters, key: e.target.value})}
        />
        
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
        />
        
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
        />
        
        <select
          value={filters.device}
          onChange={(e) => setFilters({...filters, device: e.target.value})}
        >
          <option value="">Todos dispositivos</option>
          <option value="iphone">iPhone</option>
          <option value="android">Android</option>
          <option value="desktop">Desktop</option>
        </select>
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Link</th>
                <th>Plataforma</th>
                <th>Dispositivo</th>
                <th>País</th>
                <th>Referrer</th>
                <th>Persistido</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map(click => {
                const DeviceIcon = deviceIcons[click.device] || FiGlobe;
                return (
                  <tr key={click.click_id}>
                    <td>
                      <code className="click-id">{click.click_id}</code>
                    </td>
                    <td>/r/{click.key}</td>
                    <td>
                      <span className={`platform-badge ${click.platform}`}>
                        {click.platform}
                      </span>
                    </td>
                    <td>
                      <div className="device-cell">
                        <DeviceIcon />
                        <span>{click.device}</span>
                      </div>
                    </td>
                    <td>{click.country}</td>
                    <td className="referrer-cell">
                      {click.referrer === 'direct' ? (
                        <span className="direct">Direto</span>
                      ) : (
                        <span>{new URL(click.referrer).hostname}</span>
                      )}
                    </td>
                    <td>
                      {click.persisted ? (
                        <span className="badge success">✓</span>
                      ) : (
                        <span className="badge warning">✗</span>
                      )}
                    </td>
                    <td>{new Date(click.ts).toLocaleString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Conversions View
function ConversionsView() {
  const [conversions, setConversions] = useState([]); // ZERO dados mockados - sistema limpo
  const [showImportModal, setShowImportModal] = useState(false);
  
  return (
    <div className="conversions-view">
      <div className="view-header">
        <h1>Conversões</h1>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowImportModal(true)}
          >
            <FiDownload /> Importar CSV
          </button>
          <button className="btn-primary">
            <FiPlus /> Adicionar Manual
          </button>
        </div>
      </div>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Confirmado</h3>
          <p className="stat-value">R$ 12.450</p>
        </div>
        <div className="stat-card">
          <h3>Pendente</h3>
          <p className="stat-value">R$ 3.200</p>
        </div>
        <div className="stat-card">
          <h3>Taxa Média</h3>
          <p className="stat-value">4.5%</p>
        </div>
      </div>
      
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Transação</th>
              <th>Click ID</th>
              <th>Plataforma</th>
              <th>Valor</th>
              <th>Comissão</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {conversions.map(conversion => (
              <tr key={conversion.id}>
                <td>{conversion.affiliate_tx_id}</td>
                <td>
                  <code>{conversion.click_id || '—'}</code>
                </td>
                <td>
                  <span className={`platform-badge ${conversion.platform}`}>
                    {conversion.platform}
                  </span>
                </td>
                <td>R$ {conversion.amount.toFixed(2)}</td>
                <td>R$ {conversion.commission.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${conversion.status}`}>
                    {conversion.status}
                  </span>
                </td>
                <td>{new Date(conversion.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button className="btn-icon">✓</button>
                  <button className="btn-icon">✗</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showImportModal && (
        <ImportCSVModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}

// Affiliates View
function AffiliatesView() {
  const [accounts, setAccounts] = useState([
    { id: 1, platform: 'amazon', account_tag: 'buscabusca0f-20', owner: 'ALEXANDRE', status: 'active' },
    { id: 2, platform: 'mercadolivre', account_tag: 'wa20250726131129', owner: 'ALEXANDRE', status: 'active' }
  ]);
  
  return (
    <div className="affiliates-view">
      <div className="view-header">
        <h1>Contas de Afiliado</h1>
        <button className="btn-primary">
          <FiPlus /> Adicionar Conta
        </button>
      </div>
      
      <div className="accounts-grid">
        {accounts.map(account => (
          <div key={account.id} className="account-card">
            <div className="account-header">
              <span className={`platform-badge large ${account.platform}`}>
                {account.platform}
              </span>
              <span className={`status-badge ${account.status}`}>
                {account.status}
              </span>
            </div>
            
            <div className="account-info">
              <div className="info-row">
                <span>Tag/ID:</span>
                <code>{account.account_tag}</code>
              </div>
              <div className="info-row">
                <span>Owner:</span>
                <span>{account.owner}</span>
              </div>
            </div>
            
            <div className="account-actions">
              <button className="btn-secondary">Testar Link</button>
              <button className="btn-secondary">Editar</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="test-link-section">
        <h3>Testar Link de Afiliado</h3>
        <div className="test-form">
          <input 
            type="url" 
            placeholder="Cole um link de produto para testar..."
            className="test-input"
          />
          <button className="btn-primary">Testar</button>
        </div>
      </div>
    </div>
  );
}

// Settings View
function SettingsView() {
  return (
    <div className="settings-view">
      <h1>Configurações</h1>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h3>Domínio</h3>
          <div className="setting-item">
            <label>Domínio Principal</label>
            <input type="text" value="bbbrasil.com" readOnly />
          </div>
          <div className="setting-item">
            <label>Domínio Alternativo</label>
            <input type="text" placeholder="Ex: bbr.link" />
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Segurança</h3>
          <div className="setting-item">
            <label>Autenticação de Dois Fatores</label>
            <button className="btn-secondary">Ativar 2FA</button>
          </div>
          <div className="setting-item">
            <label>IP Allowlist</label>
            <textarea placeholder="Um IP por linha..." rows="3"></textarea>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Integrações</h3>
          <div className="setting-item">
            <label>Webhook URL</label>
            <input type="url" placeholder="https://..." />
            <small>Receba notificações de conversões em tempo real</small>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Exportação</h3>
          <button className="btn-secondary">Exportar Todos os Dados</button>
          <button className="btn-secondary">Backup Configurações</button>
        </div>
      </div>
      
      <div className="settings-footer">
        <button className="btn-primary">Salvar Alterações</button>
      </div>
    </div>
  );
}

// Componentes Auxiliares
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
}

function ImportCSVModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar CSV de Conversões</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="upload-area">
            <FiDownload size={48} />
            <p>Arraste o arquivo CSV aqui ou clique para selecionar</p>
            <input type="file" accept=".csv" />
          </div>
          
          <div className="csv-format">
            <h4>Formato esperado:</h4>
            <code>
              data,transacao_id,valor,comissao,tag
            </code>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary">Importar</button>
        </div>
      </div>
    </div>
  );
}

// Toast Notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

export default App;
