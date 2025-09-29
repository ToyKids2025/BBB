import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp, FiDollarSign, FiUsers, FiActivity,
  FiBarChart2, FiPieChart, FiCalendar, FiAward, FiDownload
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAnalyticsData, getLinks } from '../firebase';

/**
 * Dashboard Completo de Analytics
 * Métricas em tempo real com gráficos e insights
 */
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [links, setLinks] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const loadData = async () => {
    try {
      const [analyticsResult, linksResult] = await Promise.all([
        getAnalyticsData(),
        getLinks()
      ]);

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }

      if (linksResult.success) {
        setLinks(linksResult.links);
        // Calcular métricas adicionais
        setChartData(processDataForCharts(linksResult.links));
        calculateAdvancedMetrics(linksResult.links);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataForCharts = (linksData) => {
    const platformClicks = linksData.reduce((acc, link) => {
      const p = link.platform || 'other';
      acc[p] = (acc[p] || 0) + (link.clicks || 0);
      return acc;
    }, {});

    return Object.entries(platformClicks).map(([name, clicks]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      clicks,
    }));
  };

  const platformColors = {
    Amazon: '#ff9900',
    Mercadolivre: '#ffe600',
    Magalu: '#0086ff',
    Other: '#666',
  };

  const calculateAdvancedMetrics = (linksData) => {
    // Análise por plataforma
    const platformStats = {};
    linksData.forEach(link => {
      const platform = link.platform || 'other';
      if (!platformStats[platform]) {
        platformStats[platform] = {
          count: 0,
          clicks: 0,
          revenue: 0
        };
      }
      platformStats[platform].count++;
      platformStats[platform].clicks += link.clicks || 0;
      platformStats[platform].revenue += estimateRevenue(link);
    });

    // Análise temporal
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentLinks = linksData.filter(link => {
      const linkDate = new Date(link.createdAt);
      if (period === '7d') return linkDate >= last7Days;
      if (period === '30d') return linkDate >= last30Days;
      return true;
    });

    // Performance metrics
    const performanceData = calculatePerformance(recentLinks);

    return {
      platformStats,
      recentLinks,
      performanceData
    };
  };

  const estimateRevenue = (link) => {
    const conversionRates = {
      amazon: 0.08,
      mercadolivre: 0.06,
      magalu: 0.05,
      other: 0.04
    };

    const avgTickets = {
      amazon: 150,
      mercadolivre: 100,
      magalu: 80,
      other: 50
    };

    const platform = link.platform || 'other';
    const clicks = link.clicks || 0;
    const conversions = clicks * 0.05; // 5% conversion rate média
    const revenue = conversions * (avgTickets[platform] || 50) * (conversionRates[platform] || 0.04);

    return revenue;
  };

  const calculatePerformance = (linksData) => {
    const totalClicks = linksData.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const totalRevenue = linksData.reduce((sum, link) => sum + estimateRevenue(link), 0);
    const avgClicksPerLink = linksData.length > 0 ? totalClicks / linksData.length : 0;

    // Calcular tendência
    const firstHalf = linksData.slice(0, Math.floor(linksData.length / 2));
    const secondHalf = linksData.slice(Math.floor(linksData.length / 2));

    const firstHalfClicks = firstHalf.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const secondHalfClicks = secondHalf.reduce((sum, link) => sum + (link.clicks || 0), 0);

    const trend = secondHalfClicks > firstHalfClicks ? 'up' :
                  secondHalfClicks < firstHalfClicks ? 'down' : 'stable';

    return {
      totalClicks,
      totalRevenue,
      avgClicksPerLink,
      trend,
      growthRate: firstHalfClicks > 0 ?
        ((secondHalfClicks - firstHalfClicks) / firstHalfClicks * 100).toFixed(1) : 0
    };
  };

  // Top performers
  const getTopLinks = () => {
    return [...links]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5);
  };

  // Insights automáticos
  const generateInsights = () => {
    const insights = [];

    if (links.length === 0) {
      insights.push({
        type: 'info',
        message: 'Comece criando seus primeiros links de afiliado'
      });
      return insights;
    }

    // Melhor plataforma
    const platforms = {};
    links.forEach(link => {
      const p = link.platform || 'other';
      platforms[p] = (platforms[p] || 0) + (link.clicks || 0);
    });

    const bestPlatform = Object.entries(platforms)
      .sort(([,a], [,b]) => b - a)[0];

    if (bestPlatform) {
      insights.push({
        type: 'success',
        message: `${bestPlatform[0]} é sua plataforma com melhor performance`
      });
    }

    // Links sem clicks
    const linksWithoutClicks = links.filter(l => !l.clicks || l.clicks === 0);
    if (linksWithoutClicks.length > 0) {
      insights.push({
        type: 'warning',
        message: `${linksWithoutClicks.length} links ainda não receberam clicks`
      });
    }

    // Crescimento
    const perf = calculatePerformance(links);
    if (perf.trend === 'up') {
      insights.push({
        type: 'success',
        message: `Crescimento de ${perf.growthRate}% no período`
      });
    } else if (perf.trend === 'down') {
      insights.push({
        type: 'warning',
        message: `Queda de ${Math.abs(perf.growthRate)}% no período`
      });
    }

    return insights;
  };

  const handleExportCSV = () => {
    if (!links || links.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Título',
      'Plataforma',
      'URL de Destino',
      'Cliques',
      'Receita Estimada (R$)',
      'Data de Criação'
    ];

    const csvRows = [headers.join(',')];

    links.forEach(link => {
      const row = [
        link.id,
        `"${(link.title || 'Sem título').replace(/"/g, '""')}"`, // Trata aspas no título
        link.platform || 'other',
        link.url,
        link.clicks || 0,
        estimateRevenue(link).toFixed(2),
        new Date(link.createdAt).toLocaleString('pt-BR')
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Adiciona BOM para Excel
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    linkElement.setAttribute('download', `relatorio-links-buscabuscabrasil-${today}.csv`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando analytics...</p>
      </div>
    );
  }

  const insights = generateInsights();
  const topLinks = getTopLinks();
  const perf = calculatePerformance(links);

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>📊 Analytics Dashboard</h1>
        </div>
        <div className="header-actions">
          <div className="period-selector">
            <button
              className={period === '7d' ? 'active' : ''}
              onClick={() => setPeriod('7d')}
            >
              7 dias
            </button>
            <button
              className={period === '30d' ? 'active' : ''}
              onClick={() => setPeriod('30d')}
            >
              30 dias
            </button>
            <button
              className={period === 'all' ? 'active' : ''}
              onClick={() => setPeriod('all')}
            >
              Todo período
            </button>
          </div>
          <button onClick={handleExportCSV} className="btn-export">
            <FiDownload />
            Exportar para CSV
          </button>
        </div>
      </div>

      {/* Cards principais */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <FiDollarSign />
          </div>
          <div className="metric-content">
            <h3>Receita Estimada</h3>
            <p className="metric-value">
              R$ {perf.totalRevenue.toFixed(2)}
            </p>
            <span className={`trend ${perf.trend}`}>
              {perf.trend === 'up' ? '↑' : perf.trend === 'down' ? '↓' : '→'}
              {perf.growthRate}%
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <h3>Clicks Totais</h3>
            <p className="metric-value">{perf.totalClicks}</p>
            <span className="metric-subtitle">
              Média: {perf.avgClicksPerLink.toFixed(1)}/link
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FiActivity />
          </div>
          <div className="metric-content">
            <h3>Links Ativos</h3>
            <p className="metric-value">{links.length}</p>
            <span className="metric-subtitle">
              {links.filter(l => l.clicks > 0).length} com clicks
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FiAward />
          </div>
          <div className="metric-content">
            <h3>Taxa Conversão</h3>
            <p className="metric-value">
              {analytics?.conversionRate || 0}%
            </p>
            <span className="metric-subtitle">Média do mercado: 3-5%</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h2>💡 Insights</h2>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight ${insight.type}`}>
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Links */}
      {topLinks.length > 0 && (
        <div className="top-links-section">
          <h2>🏆 Top 5 Links</h2>
          <div className="top-links-table">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Plataforma</th>
                  <th>Clicks</th>
                  <th>Receita Est.</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map(link => (
                  <tr key={link.id}>
                    <td>{link.title || 'Sem título'}</td>
                    <td>
                      <span className={`platform-badge ${link.platform}`}>
                        {link.platform}
                      </span>
                    </td>
                    <td>{link.clicks || 0}</td>
                    <td>R$ {estimateRevenue(link).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico de Performance */}
      <div className="chart-section">
        <div className="chart-header">
          <FiBarChart2 />
          <h2>Performance por Plataforma</h2>
        </div>
        <div className="charts-container">
          <div className="chart-wrapper">
            <h3>Cliques por Plataforma</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="clicks" name="Cliques">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={platformColors[entry.name] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h3>Distribuição de Cliques</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="clicks" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={platformColors[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-title h1 {
          font-size: 28px;
          color: #333;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .period-selector {
          display: flex;
          gap: 10px;
        }

        .period-selector button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .period-selector button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 25px;
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-5px);
        }

        .metric-card.primary {
          background: var(--accent-gradient);
          color: white;
        }

        .metric-icon {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .metric-content h3 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 8px;
          opacity: 0.8;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }

        .metric-subtitle {
          font-size: 12px;
          opacity: 0.7;
        }

        .trend {
          font-size: 14px;
          font-weight: bold;
        }

        .trend.up {
          color: #4caf50;
        }

        .trend.down {
          color: #f44336;
        }

        .trend.stable {
          color: #ffc107;
        }

        .insights-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        }

        .insights-section h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .insights-list {
          display: grid;
          gap: 10px;
        }

        .insight {
          padding: 12px 15px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .insight.success {
          background: #e8f5e9;
          border-color: #4caf50;
          color: #2e7d32;
        }

        .insight.warning {
          background: #fff3e0;
          border-color: #ff9800;
          color: #e65100;
        }

        .insight.info {
          background: #e3f2fd;
          border-color: #2196f3;
          color: #0d47a1;
        }

        .top-links-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        }

        .top-links-section h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .top-links-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .top-links-table th {
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #f0f0f0;
          font-size: 14px;
          color: #666;
        }

        .top-links-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .chart-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 25px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          margin-bottom: 25px;
        }

        .charts-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        @media (min-width: 992px) {
          .charts-container {
            grid-template-columns: 2fr 1fr;
          }
        }

        .chart-wrapper {
          background: var(--bg-tertiary);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .chart-wrapper h3 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .platform-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .platform-badge.amazon {
          background: #ff9900;
          color: white;
        }

        .platform-badge.mercadolivre {
          background: #ffe600;
          color: #333;
        }

        .platform-badge.magalu {
          background: #0086ff;
          color: white;
        }

        .platform-badge.other {
          background: #666;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;