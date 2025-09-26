import React, { useState, useEffect, memo } from 'react';
import {
  FiCopy, FiExternalLink, FiShare2, FiEdit,
  FiTrash2, FiTrendingUp, FiDollarSign,
  FiMessageCircle, FiMail, FiSend
} from 'react-icons/fi';
import { updateLinkClick } from '../firebase';

/**
 * Componente Avançado de Gerenciamento de Links
 * Sistema completo com todas as funcionalidades
 */
const LinkManager = memo(({ links, onRefresh, onDelete, onEdit }) => {
  const [selectedLink, setSelectedLink] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  // Filtrar links
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || link.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Estatísticas dos links
  const stats = {
    total: links.length,
    totalClicks: links.reduce((sum, link) => sum + (link.clicks || 0), 0),
    avgClicks: links.length > 0 ?
      (links.reduce((sum, link) => sum + (link.clicks || 0), 0) / links.length).toFixed(1) : 0,
    platforms: [...new Set(links.map(l => l.platform))].length
  };

  // Copiar link
  const copyToClipboard = async (text, linkId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(linkId);

      // Feedback visual
      setTimeout(() => setCopiedId(null), 2000);

      // Notificação
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Link Copiado!', {
          body: 'Link com tag de afiliado copiado para a área de transferência',
          icon: '/icon-192.png'
        });
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar. Selecione o texto manualmente.');
    }
  };

  // Compartilhar link
  const shareLink = (link, platform) => {
    const text = `Confira esta oferta: ${link.title || 'Produto incrível'}`;
    const url = link.url;

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/` // Instagram não tem share direto
    };

    if (platform === 'instagram') {
      copyToClipboard(url, link.id);
      alert('Link copiado! Cole no Instagram Stories ou Direct Message.');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  // Abrir modal de compartilhamento
  const openShareModal = (link) => {
    setSelectedLink(link);
    setShowShareModal(true);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular receita estimada
  const estimateRevenue = (link) => {
    const conversionRate = 0.05; // 5% de conversão média
    const avgTicket = {
      amazon: 150,
      mercadolivre: 100,
      magalu: 80,
      other: 50
    };
    const commission = {
      amazon: 0.08, // 8% comissão
      mercadolivre: 0.06, // 6% comissão
      magalu: 0.05, // 5% comissão
      other: 0.04 // 4% comissão
    };

    const platform = link.platform || 'other';
    const clicks = link.clicks || 0;
    const conversions = clicks * conversionRate;
    const revenue = conversions * (avgTicket[platform] || 50) * (commission[platform] || 0.04);

    return revenue.toFixed(2);
  };

  // Solicitar permissão de notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="link-manager">
      {/* Header com estatísticas */}
      <div className="manager-header">
        <div className="stats-row">
          <div className="stat-card mini">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Links</span>
          </div>
          <div className="stat-card mini">
            <span className="stat-value">{stats.totalClicks}</span>
            <span className="stat-label">Clicks Total</span>
          </div>
          <div className="stat-card mini">
            <span className="stat-value">{stats.avgClicks}</span>
            <span className="stat-label">Média/Link</span>
          </div>
          <div className="stat-card mini">
            <span className="stat-value">{stats.platforms}</span>
            <span className="stat-label">Plataformas</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-row">
          <input
            type="search"
            placeholder="🔍 Buscar links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas Plataformas</option>
            <option value="amazon">Amazon</option>
            <option value="mercadolivre">Mercado Livre</option>
            <option value="magalu">Magazine Luiza</option>
            <option value="other">Outras</option>
          </select>
        </div>
      </div>

      {/* Lista de links */}
      <div className="links-list">
        {filteredLinks.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum link encontrado</p>
          </div>
        ) : (
          filteredLinks.map(link => (
            <div key={link.id} className="link-card enhanced">
              {/* Header do card */}
              <div className="card-header">
                <span className={`platform-badge ${link.platform}`}>
                  {link.platform}
                </span>
                <span className="link-date">
                  {formatDate(link.createdAt)}
                </span>
              </div>

              {/* Título e URLs */}
              <h3 className="link-title">{link.title || 'Link sem título'}</h3>

              {/* URL Original */}
              <div className="url-section">
                <label>URL Original:</label>
                <div className="url-box original">
                  {link.originalUrl || link.url}
                </div>
              </div>

              {/* URL com Tag (destacada) */}
              <div className="url-section">
                <label>🔗 Link para Compartilhar (com tag de afiliado):</label>
                <div className="url-box affiliate">
                  <span className="url-text">{link.url}</span>
                  <button
                    className={`copy-btn ${copiedId === link.id ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(link.url, link.id)}
                  >
                    {copiedId === link.id ? '✅' : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div className="link-metrics">
                <div className="metric">
                  <FiTrendingUp />
                  <span>{link.clicks || 0} clicks</span>
                </div>
                <div className="metric">
                  <FiDollarSign />
                  <span>R$ {estimateRevenue(link)} estimado</span>
                </div>
              </div>

              {/* Ações */}
              <div className="link-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => openShareModal(link)}
                >
                  <FiShare2 /> Compartilhar
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
                {onEdit && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEdit(link)}
                  >
                    <FiEdit /> Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Deletar este link?')) {
                        onDelete(link.id);
                      }
                    }}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Compartilhamento */}
      {showShareModal && selectedLink && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Compartilhar Link</h2>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="share-title">{selectedLink.title}</p>

              <div className="share-options">
                <button
                  className="share-btn whatsapp"
                  onClick={() => shareLink(selectedLink, 'whatsapp')}
                >
                  <FiMessageCircle /> WhatsApp
                </button>
                <button
                  className="share-btn telegram"
                  onClick={() => shareLink(selectedLink, 'telegram')}
                >
                  <FiSend /> Telegram
                </button>
                <button
                  className="share-btn instagram"
                  onClick={() => shareLink(selectedLink, 'instagram')}
                >
                  📷 Instagram
                </button>
                <button
                  className="share-btn twitter"
                  onClick={() => shareLink(selectedLink, 'twitter')}
                >
                  🐦 Twitter
                </button>
                <button
                  className="share-btn facebook"
                  onClick={() => shareLink(selectedLink, 'facebook')}
                >
                  📘 Facebook
                </button>
                <button
                  className="share-btn email"
                  onClick={() => shareLink(selectedLink, 'email')}
                >
                  <FiMail /> Email
                </button>
              </div>

              <div className="share-url">
                <input
                  type="text"
                  value={selectedLink.url}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(selectedLink.url, selectedLink.id)}
                >
                  <FiCopy /> Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .link-manager {
          padding: 20px;
        }

        .manager-header {
          margin-bottom: 30px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card.mini {
          background: white;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }

        .filters-row {
          display: flex;
          gap: 15px;
        }

        .search-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .filter-select {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .links-list {
          display: grid;
          gap: 20px;
        }

        .link-card.enhanced {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .link-card.enhanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.12);
        }

        .url-section {
          margin: 15px 0;
        }

        .url-section label {
          display: block;
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .url-box {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          word-break: break-all;
        }

        .url-box.original {
          background: #f5f5f5;
          border: 1px solid #ddd;
        }

        .url-box.affiliate {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 2px solid #4caf50;
          position: relative;
        }

        .url-text {
          flex: 1;
        }

        .copy-btn {
          padding: 5px 10px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 10px;
        }

        .copy-btn.copied {
          background: #2196f3;
        }

        .link-metrics {
          display: flex;
          gap: 20px;
          margin: 15px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: #666;
        }

        .metric svg {
          color: #4caf50;
        }

        .share-modal {
          max-width: 500px;
          width: 90%;
        }

        .share-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .share-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .share-btn {
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .share-btn:hover {
          transform: translateY(-2px);
        }

        .share-btn.whatsapp:hover {
          background: #25d366;
          color: white;
        }

        .share-btn.telegram:hover {
          background: #0088cc;
          color: white;
        }

        .share-btn.instagram:hover {
          background: linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4);
          color: white;
        }

        .share-btn.twitter:hover {
          background: #1da1f2;
          color: white;
        }

        .share-btn.facebook:hover {
          background: #1877f2;
          color: white;
        }

        .share-btn.email:hover {
          background: #666;
          color: white;
        }

        .share-url {
          display: flex;
          gap: 10px;
        }

        .share-url input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
        }

        .btn-danger {
          background: #f44336;
          color: white;
        }

        .btn-danger:hover {
          background: #d32f2f;
        }
      `}</style>
    </div>
  );
});

export default LinkManager;