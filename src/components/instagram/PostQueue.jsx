/**
 * 📋 POST QUEUE - Fila de Posts do Instagram
 *
 * Gerencia:
 * - Rascunhos (drafts)
 * - Agendados (scheduled)
 * - Publicados (published)
 * - Falhos (failed)
 *
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FiList, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import { getInstagramPosts, deleteInstagramPost } from '../../utils/instagram/firebase-instagram';

const PostQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, draft, scheduled, published, failed
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');

    try {
      const filterStatus = filter === 'all' ? null : filter;
      const result = await getInstagramPosts({ status: filterStatus, limitCount: 100 });

      if (result.success) {
        setPosts(result.posts || []);
      } else {
        setError(result.error || 'Erro ao carregar posts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) {
      return;
    }

    try {
      const result = await deleteInstagramPost(postId);

      if (result.success) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        alert(`Erro ao deletar: ${result.error}`);
      }
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: '#999', icon: <FiEdit /> },
      scheduled: { label: 'Agendado', color: '#f59e0b', icon: <FiClock /> },
      publishing: { label: 'Publicando...', color: '#3b82f6', icon: <FiClock /> },
      published: { label: 'Publicado', color: '#10b981', icon: <FiCheckCircle /> },
      failed: { label: 'Falhou', color: '#ef4444', icon: <FiXCircle /> }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const filterOptions = [
    { id: 'all', label: 'Todos', count: posts.length },
    { id: 'draft', label: 'Rascunhos' },
    { id: 'scheduled', label: 'Agendados' },
    { id: 'published', label: 'Publicados' },
    { id: 'failed', label: 'Falhos' }
  ];

  return (
    <div className="post-queue card glass">
      <div className="queue-header">
        <FiList size={28} />
        <h2>Fila de Posts</h2>
        <p className="subtitle">Gerencie seus posts do Instagram</p>
      </div>

      {/* Filtros */}
      <div className="filter-tabs">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            className={`filter-tab ${filter === opt.id ? 'active' : ''}`}
            onClick={() => setFilter(opt.id)}
          >
            {opt.label}
            {opt.count !== undefined && <span className="count-badge">{opt.count}</span>}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Carregando posts...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="alert alert-error">
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {/* Posts */}
      {!loading && !error && posts.length > 0 && (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              {/* Imagem (se disponível) */}
              {post.imageUrl && (
                <div className="post-thumbnail">
                  <img src={post.imageUrl} alt="Post" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="post-content">
                <div className="post-header">
                  {getStatusBadge(post.status)}
                  <span className="post-date">
                    <FiCalendar /> {formatDate(post.createdAt)}
                  </span>
                </div>

                <div className="post-caption">
                  {post.caption || 'Sem legenda'}
                </div>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="post-hashtags">
                    {post.hashtags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="hashtag">{tag}</span>
                    ))}
                    {post.hashtags.length > 5 && (
                      <span className="hashtag-more">+{post.hashtags.length - 5}</span>
                    )}
                  </div>
                )}

                {post.scheduledFor && (
                  <div className="post-schedule">
                    <FiClock /> Agendado para: <strong>{formatDate(post.scheduledFor)}</strong>
                  </div>
                )}

                {post.publishedAt && (
                  <div className="post-published">
                    <FiCheckCircle /> Publicado em: <strong>{formatDate(post.publishedAt)}</strong>
                  </div>
                )}

                {post.error && (
                  <div className="post-error">
                    <FiXCircle /> Erro: {post.error}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="post-actions">
                <button
                  className="action-btn edit"
                  title="Editar"
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                >
                  <FiEdit />
                </button>
                <button
                  className="action-btn delete"
                  title="Deletar"
                  onClick={() => handleDelete(post.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vazio */}
      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <FiList size={64} />
          <h3>Nenhum post encontrado</h3>
          <p>Crie seu primeiro post usando as abas acima!</p>
        </div>
      )}

      <style jsx>{`
        .post-queue {
          max-width: 1200px;
          margin: 0 auto;
        }

        .queue-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .queue-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-secondary, #666);
          font-size: 0.9rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-tab:hover {
          border-color: #667eea;
        }

        .filter-tab.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
          font-weight: 600;
        }

        .count-badge {
          background: rgba(0, 0, 0, 0.2);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid #e0e0e0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .post-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .post-thumbnail {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .post-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .post-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .post-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary, #666);
          font-size: 0.9rem;
        }

        .post-caption {
          color: var(--text-primary, #1a1a1a);
          line-height: 1.5;
          max-height: 4.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .post-hashtags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .hashtag {
          background: #e0e0e0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          color: #667eea;
        }

        .hashtag-more {
          color: var(--text-secondary, #666);
          font-size: 0.85rem;
        }

        .post-schedule,
        .post-published,
        .post-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .post-schedule {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .post-published {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .post-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .post-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.edit {
          background: #3b82f6;
          color: white;
        }

        .action-btn.edit:hover {
          background: #2563eb;
        }

        .action-btn.delete {
          background: #ef4444;
          color: white;
        }

        .action-btn.delete:hover {
          background: #dc2626;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary, #666);
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem;
        }

        @media (max-width: 768px) {
          .post-item {
            grid-template-columns: 1fr;
          }

          .post-thumbnail {
            width: 100%;
            height: 200px;
          }

          .post-actions {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PostQueue;
