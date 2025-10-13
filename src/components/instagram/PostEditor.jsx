/**
 * ✏️ POST EDITOR - Editor de Posts do Instagram
 *
 * Permite editar:
 * - Legenda
 * - Hashtags
 * - Agendar publicação
 * - Salvar como rascunho
 *
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { FiEdit3, FiHash, FiCalendar, FiSave, FiSend } from 'react-icons/fi';
import { createInstagramPost, updateInstagramPost } from '../../utils/instagram/firebase-instagram';

const PostEditor = ({ post = null, onSave = null }) => {
  const [caption, setCaption] = useState(post?.caption || '');
  const [hashtags, setHashtags] = useState(post?.hashtags?.join(' ') || '');
  const [scheduledDate, setScheduledDate] = useState(post?.scheduledFor?.split('T')[0] || '');
  const [scheduledTime, setScheduledTime] = useState(post?.scheduledFor?.split('T')[1]?.substring(0, 5) || '09:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Templates de legenda
  const captionTemplates = {
    entusiasta: 'Olha só que incrível! 😍 {PRODUCT_NAME}\n\n✨ Por apenas R$ {PRICE}!\n\nCorra, oferta por tempo limitado! 🔥',
    urgencia: '⚡ ATENÇÃO! OFERTA RELÂMPAGO ⚡\n\n{PRODUCT_NAME}\n\nDe R$ {ORIGINAL_PRICE} por R$ {PRICE}!\n\n❌ ÚLTIMAS UNIDADES!\n🔥 Não perca essa chance!',
    informativo: '📦 {PRODUCT_NAME}\n\n💰 Preço: R$ {PRICE}\n⭐ Avaliação: {RATING}/5\n✅ {REVIEWS} avaliações\n\nConfira agora e aproveite!',
    casual: 'Bom dia! ☀️\n\nEncontrei isso e achei que você ia gostar:\n\n{PRODUCT_NAME}\n\nTá com um precinho legal: R$ {PRICE} 😊\n\nDá uma olhada! 👀'
  };

  // Hashtags sugeridas
  const hashtagSuggestions = {
    ofertas: ['#ofertas', '#promocao', '#desconto', '#blackfriday', '#ofertasdodia'],
    tech: ['#tecnologia', '#tech', '#gadgets', '#eletronicos', '#inovacao'],
    casa: ['#casaeconforto', '#decoracao', '#utilidadesdomesticas', '#casa', '#lar'],
    moda: ['#moda', '#fashion', '#estilo', '#lookdodia', '#modafeminina'],
    geral: ['#compras', '#compraronline', '#brasil', '#mercadolivre', '#amazon']
  };

  const handleApplyTemplate = (template) => {
    setCaption(captionTemplates[template]);
  };

  const handleAddHashtags = (category) => {
    const newHashtags = hashtagSuggestions[category].join(' ');
    setHashtags(prev => prev ? `${prev} ${newHashtags}` : newHashtags);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setMessage('');

    try {
      const hashtagArray = hashtags.split(' ').filter(h => h.startsWith('#'));

      const postData = {
        caption,
        hashtags: hashtagArray,
        status: 'draft'
      };

      let result;
      if (post?.id) {
        // Atualizar post existente
        result = await updateInstagramPost(post.id, postData);
      } else {
        // Criar novo post
        result = await createInstagramPost(postData);
      }

      if (result.success) {
        setMessage('✅ Rascunho salvo com sucesso!');
        if (onSave) onSave(result);
      } else {
        setMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      setMessage('⚠️ Selecione data e horário para agendar');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const hashtagArray = hashtags.split(' ').filter(h => h.startsWith('#'));
      const scheduledFor = `${scheduledDate}T${scheduledTime}:00`;

      const postData = {
        caption,
        hashtags: hashtagArray,
        status: 'scheduled',
        scheduledFor
      };

      let result;
      if (post?.id) {
        result = await updateInstagramPost(post.id, postData);
      } else {
        result = await createInstagramPost(postData);
      }

      if (result.success) {
        setMessage(`✅ Post agendado para ${new Date(scheduledFor).toLocaleString('pt-BR')}!`);
        if (onSave) onSave(result);
      } else {
        setMessage(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Erro ao agendar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const captionLength = caption.length;
  const hashtagCount = hashtags.split(' ').filter(h => h.startsWith('#')).length;

  return (
    <div className="post-editor card glass">
      <div className="editor-header">
        <FiEdit3 size={28} />
        <h2>Editor de Posts</h2>
        <p className="subtitle">Crie e edite seus posts para o Instagram</p>
      </div>

      <div className="editor-content">
        {/* Templates de Legenda */}
        <div className="section">
          <h3>
            <FiEdit3 /> Templates de Legenda
          </h3>
          <div className="template-buttons">
            <button onClick={() => handleApplyTemplate('entusiasta')} className="btn btn-secondary">
              😍 Entusiasta
            </button>
            <button onClick={() => handleApplyTemplate('urgencia')} className="btn btn-secondary">
              ⚡ Urgência
            </button>
            <button onClick={() => handleApplyTemplate('informativo')} className="btn btn-secondary">
              📊 Informativo
            </button>
            <button onClick={() => handleApplyTemplate('casual')} className="btn btn-secondary">
              😊 Casual
            </button>
          </div>
        </div>

        {/* Legenda */}
        <div className="section">
          <h3>
            <FiEdit3 /> Legenda
          </h3>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="caption-textarea"
            placeholder="Escreva a legenda do seu post..."
            rows={8}
          />
          <div className="caption-info">
            <span>{captionLength}/2200 caracteres</span>
            <span>Instagram recomenda até 125 caracteres</span>
          </div>
        </div>

        {/* Hashtags */}
        <div className="section">
          <h3>
            <FiHash /> Hashtags Sugeridas
          </h3>
          <div className="hashtag-buttons">
            <button onClick={() => handleAddHashtags('ofertas')} className="btn btn-sm">
              #Ofertas
            </button>
            <button onClick={() => handleAddHashtags('tech')} className="btn btn-sm">
              #Tech
            </button>
            <button onClick={() => handleAddHashtags('casa')} className="btn btn-sm">
              #Casa
            </button>
            <button onClick={() => handleAddHashtags('moda')} className="btn btn-sm">
              #Moda
            </button>
            <button onClick={() => handleAddHashtags('geral')} className="btn btn-sm">
              #Geral
            </button>
          </div>

          <textarea
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="hashtags-textarea"
            placeholder="#ofertas #promocao #desconto"
            rows={3}
          />
          <div className="hashtag-info">
            <span>{hashtagCount}/30 hashtags</span>
            <span>Instagram permite até 30 hashtags por post</span>
          </div>
        </div>

        {/* Agendamento */}
        <div className="section">
          <h3>
            <FiCalendar /> Agendamento
          </h3>
          <div className="schedule-grid">
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Horário</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="action-buttons">
          <button
            onClick={handleSaveDraft}
            className="btn btn-secondary btn-large"
            disabled={loading}
          >
            <FiSave /> Salvar Rascunho
          </button>
          <button
            onClick={handleSchedule}
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            <FiSend /> {loading ? 'Agendando...' : 'Agendar Post'}
          </button>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <style jsx>{`
        .post-editor {
          max-width: 900px;
          margin: 0 auto;
        }

        .editor-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .editor-header h2 {
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

        .editor-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .template-buttons,
        .hashtag-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .caption-textarea,
        .hashtags-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          transition: border-color 0.3s;
        }

        .caption-textarea:focus,
        .hashtags-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .caption-info,
        .hashtag-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
          margin-top: 0.5rem;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          min-width: 200px;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 768px) {
          .schedule-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-large {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PostEditor;
