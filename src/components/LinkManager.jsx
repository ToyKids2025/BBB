import React, { useState, useEffect } from 'react';
import { saveLink } from '../firebase';
import { FiLink, FiClipboard, FiCheck, FiZap, FiX, FiLoader } from 'react-icons/fi';
import { FaAmazon, FaShopify } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';
import { fetchProductTitle } from '../utils/product-scraper';

/**
 * Componente LinkManager
 * Responsável por criar novos links de afiliado.
 * Inclui a funcionalidade de limpeza automática de URL ao colar.
 */

const LinkManager = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);

  // Mapeamento de plataformas para ícones
  const platformIcons = {
    amazon: <FaAmazon color="#FF9900" />,
    mercadolivre: <SiMercadopago color="#FFE600" />,
    shopee: <FaShopify color="#EE4D2D" />,
    magalu: <span className="platform-icon-text">M</span>,
    other: <FiLink />,
  };

  /**
   * NÃO limpa a URL - preserva TODOS os parâmetros de afiliado
   * Apenas remove espaços extras e normaliza o formato
   * @param {string} rawUrl A URL original
   * @returns {string} A URL normalizada SEM remover parâmetros
   */
  const cleanUrl = (rawUrl) => {
    if (!rawUrl) return rawUrl;

    // Apenas trim de espaços, mantém TODOS os parâmetros de afiliado
    return rawUrl.trim();
  };

  // Função para detectar a plataforma (movida para dentro para evitar import)
  const detectPlatform = (url) => {
    const urlLower = url.toLowerCase();
    // ✅ DETECTAR AMAZON (incluindo links curtos amzn.to)
    if (urlLower.includes('amazon.com') || urlLower.includes('amzn.to')) return 'amazon';
    // ✅ DETECTAR MERCADO LIVRE (incluindo /sec/ e /social/)
    if (urlLower.includes('mercadolivre.com') ||
        urlLower.includes('mercadolibre.com') ||
        urlLower.includes('/sec/') ||
        urlLower.includes('/social/')) return 'mercadolivre';
    if (urlLower.includes('shopee.com')) return 'shopee';
    if (urlLower.includes('magazineluiza.com') || urlLower.includes('magalu.com')) return 'magalu';
    return 'other';
  };

  // Efeito para detectar a plataforma E buscar título quando a URL muda
  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url);
      setPlatform(detected);

      // Auto-buscar título se for Amazon ou Mercado Livre
      if (detected === 'amazon' || detected === 'mercadolivre') {
        autoFetchTitle(url, detected);
      }
    } else {
      setPlatform('');
      setTitle('');
    }
  }, [url]);

  /**
   * Buscar título do produto automaticamente
   */
  const autoFetchTitle = async (productUrl, productPlatform) => {
    try {
      setFetchingTitle(true);
      console.log('🔍 Buscando título do produto automaticamente...');

      const productTitle = await fetchProductTitle(productUrl, productPlatform);

      setTitle(productTitle);
      console.log('✅ Título encontrado:', productTitle);

    } catch (error) {
      console.error('❌ Erro ao buscar título:', error);
      // Não mostrar erro ao usuário, apenas deixar vazio
      setTitle('');
    } finally {
      setFetchingTitle(false);
    }
  };
  /**
   * Manipulador do evento de colar no campo de URL.
   * Limpa a URL colada antes de inseri-la no campo.
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedUrl = cleanUrl(pastedText);
    setUrl(cleanedUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedLink(null);

    const result = await saveLink({
      url: url,
      title: title,
      platform: platform,
    });

    if (result.success) {
      const shortUrl = `${window.location.origin}/r/${result.id}`;
      setGeneratedLink({ ...result.link, shortUrl });
      setUrl('');
      setTitle('');
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }

    setLoading(false);
  };

  const handleCopy = () => {
    if (generatedLink?.shortUrl) {
      navigator.clipboard.writeText(generatedLink.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="link-manager-container card glass">
      <style jsx>{`
        .link-manager-container {
          padding: 2rem;
        }
        .form-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .form-header h2 {
          margin: 0;
        }
        .link-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        .input-group label {
          margin-bottom: 0.5rem;
          font-weight: bold;
          font-size: 0.9rem;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-wrapper .input {
          padding-left: 40px;
        }
        .platform-icon {
          position: absolute;
          left: 12px;
          font-size: 1.5rem;
          color: var(--text-secondary);
        }
        .generated-link-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--bg-tertiary);
          border-radius: 12px;
          border: 1px solid var(--accent-color);
        }
        .generated-link-header {
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .generated-link-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 8px;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
          color: var(--accent-color);
        }
        .copy-feedback {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--success);
          font-weight: bold;
        }
        .copy-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 1.2rem;
        }
        .clear-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 1.2rem;
        }
        .fetching-title-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: var(--accent-color);
          font-size: 14px;
          font-weight: 500;
          animation: fadeIn 0.3s ease;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .title-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(76, 175, 80, 0.3);
          animation: fadeIn 0.3s ease;
        }
        .title-label {
          font-weight: 600;
          color: var(--success);
          font-size: 14px;
        }
        .title-text {
          flex: 1;
          color: var(--text-primary);
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="form-header">
        <FiZap size={28} />
        <h2>Gerador de Links Mágicos</h2>
      </div>

      <form onSubmit={handleSubmit} className="link-form">
        <div className="input-group">
          <label htmlFor="url-input">URL do Produto (mantenha TODOS os parâmetros de afiliado)</label>
          <div className="input-wrapper">
            <span className="platform-icon">{platformIcons[platform] || <FiLink />}</span>
            <input
              id="url-input"
              type="url"
              placeholder="Cole a URL completa com parâmetros de afiliado"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              required
              className="input"
            />
            {url && (
              <button type="button" className="clear-btn" onClick={() => setUrl('')} title="Limpar URL">
                <FiX />
              </button>
            )}
          </div>
        </div>
        {/* Campo de título escondido - preenchido automaticamente */}
        {fetchingTitle && (
          <div className="fetching-title-indicator">
            <FiLoader className="spinner-icon" />
            <span>🔍 Buscando nome do produto...</span>
          </div>
        )}

        {title && !fetchingTitle && (
          <div className="title-preview">
            <span className="title-label">📦 Produto:</span>
            <span className="title-text">{title}</span>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Gerando...' : 'Gerar Link'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>

      {generatedLink && (
        <div className="generated-link-section animate-fadeInUp">
          <div className="generated-link-header">✨ Seu Link Mágico está pronto!</div>
          <div className="generated-link-box">
            <span style={{ flex: 1, wordBreak: 'break-all' }}>{generatedLink.shortUrl}</span>
            {copied ? (
              <div className="copy-feedback"><FiCheck /> Copiado!</div>
            ) : (
              <button onClick={handleCopy} className="copy-btn" title="Copiar Link">
                <FiClipboard />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkManager;