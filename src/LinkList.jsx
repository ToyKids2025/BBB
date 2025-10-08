import React, { useState, useEffect } from 'react';
import { getLinks, deleteLink, updateLink } from './firebase';
import { FiClipboard, FiTrash2, FiEdit, FiLink, FiBarChart2 } from 'react-icons/fi';

/**
 * Componente LinkList
 * Exibe uma lista de todos os links gerados pelo usuário,
 * permitindo copiar, editar e deletar.
 */
const LinkList = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    const result = await getLinks();
    if (result.success) {
      setLinks(result.links);
    } else {
      setError('Falha ao carregar links.');
    }
    setLoading(false);
  };

  const handleCopy = (linkId) => {
    const shortUrl = `${window.location.origin}/r/${linkId}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Tem certeza que deseja deletar este link? Esta ação é irreversível.')) {
      const result = await deleteLink(linkId);
      if (result.success) {
        setLinks(links.filter(link => link.id !== linkId));
      } else {
        alert('Erro ao deletar o link.');
      }
    }
  };

  const handleEdit = (link) => {
    setEditingLink({ ...link });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingLink) return;

    const { id, title, url } = editingLink;

    console.log('📝 Atualizando link:', { id, title, url });

    const result = await updateLink(id, { title, url });

    if (result.success) {
      console.log('✅ Link atualizado com sucesso!');
      await fetchLinks(); // Recarrega a lista para mostrar a alteração
      setIsEditModalOpen(false);
      setEditingLink(null);
    } else {
      console.error('❌ Erro ao atualizar link:', result.error);
      alert('Erro ao atualizar o link: ' + (result.error || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return <div className="loading-state">Carregando seus links...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="link-list-container card glass">

      <div className="list-header">
        <FiLink size={28} />
        <h2>Meus Links Gerados</h2>
      </div>

      {links.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="links-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Plataforma</th>
                <th>Cliques</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.id}>
                  <td>
                    <span className="link-title">{link.title || 'Sem título'}</span>
                    <span className="link-url">{`${window.location.origin}/r/${link.id}`}</span>
                  </td>
                  <td>
                    <span className={`platform-badge ${link.platform}`}>
                      {link.platform || 'Outro'}
                    </span>
                  </td>
                  <td>{link.clicks || 0}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleCopy(link.id)} className="action-btn" title="Copiar Link">
                        {copiedId === link.id ? <span className="copied-feedback">✓</span> : <FiClipboard />}
                      </button>
                      <button onClick={() => handleEdit(link)} className="action-btn" title="Editar Link">
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="action-btn delete" title="Deletar Link">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-links">
          <FiBarChart2 size={40} />
          <p>Você ainda não gerou nenhum link.</p>
          <p>Use o "Gerador de Links Mágicos" para começar!</p>
        </div>
      )}

      {isEditModalOpen && editingLink && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Link</h2>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={editingLink.title || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    className="input"
                    placeholder="Digite o nome do link"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>URL de Destino</label>
                  <input
                    type="url"
                    value={editingLink.url || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                    className="input"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkList;