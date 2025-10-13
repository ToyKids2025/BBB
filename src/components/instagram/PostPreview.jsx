/**
 * 🖼️ POST PREVIEW - Visualiza e testa geração de imagens
 *
 * Permite testar os 3 templates com dados de produto real
 * e fazer download das imagens geradas
 *
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { generatePostImage, downloadImage } from '../../utils/instagram/image-generator';
import { FiImage, FiDownload, FiRefreshCw } from 'react-icons/fi';

const PostPreview = () => {
  const [template, setTemplate] = useState('moderno');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados de teste
  const [productData, setProductData] = useState({
    title: 'Notebook Gamer Acer Nitro 5 i5 12ª Geração 16GB 512GB SSD RTX 3050',
    price: 3499.90,
    originalPrice: 3999.90,
    discount: 12,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_720354-MLB73154659749_122023-F.webp'
    ],
    platform: 'mercadolivre'
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      console.log('🎨 Gerando imagem...');
      const imageDataURL = await generatePostImage(productData, template);
      setImageUrl(imageDataURL);
      console.log('✅ Imagem gerada!');
    } catch (err) {
      console.error('❌ Erro ao gerar imagem:', err);
      setError(err.message || 'Erro ao gerar imagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      downloadImage(imageUrl, `post-${template}-${Date.now()}.jpg`);
    }
  };

  const templates = [
    { id: 'moderno', name: 'Moderno', color: '#667eea', desc: 'Gradiente roxo elegante' },
    { id: 'minimalista', name: 'Minimalista', color: '#ffffff', desc: 'Clean e simples' },
    { id: 'colorido', name: 'Colorido', color: '#ff6b6b', desc: 'Vibrante e chamativo' }
  ];

  return (
    <div className="post-preview card glass">
      <div className="preview-header">
        <FiImage size={28} />
        <h2>Gerador de Posts para Instagram</h2>
        <p className="subtitle">Teste os templates visuais</p>
      </div>

      <div className="preview-content">
        {/* Seleção de Template */}
        <div className="template-selector">
          <h3>Escolha o Template</h3>
          <div className="template-grid">
            {templates.map((t) => (
              <button
                key={t.id}
                className={`template-option ${template === t.id ? 'active' : ''}`}
                onClick={() => setTemplate(t.id)}
                style={{
                  borderColor: template === t.id ? t.color : '#ddd',
                  backgroundColor: template === t.id ? t.color + '15' : 'transparent'
                }}
              >
                <div
                  className="template-color"
                  style={{ backgroundColor: t.color }}
                ></div>
                <div className="template-info">
                  <strong>{t.name}</strong>
                  <span>{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dados do Produto (Editáveis) */}
        <div className="product-data">
          <h3>Dados do Produto</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={productData.title}
                onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Preço Atual (R$)</label>
              <input
                type="number"
                step="0.01"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Preço Original (R$)</label>
              <input
                type="number"
                step="0.01"
                value={productData.originalPrice}
                onChange={(e) => setProductData({ ...productData, originalPrice: parseFloat(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Desconto (%)</label>
              <input
                type="number"
                value={productData.discount}
                onChange={(e) => setProductData({ ...productData, discount: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>

            <div className="form-group full-width">
              <label>URL da Imagem</label>
              <input
                type="url"
                value={productData.images[0]}
                onChange={(e) => setProductData({ ...productData, images: [e.target.value] })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Botão Gerar */}
        <div className="action-buttons">
          <button
            onClick={handleGenerate}
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Gerando...
              </>
            ) : (
              <>
                <FiRefreshCw /> Gerar Imagem
              </>
            )}
          </button>

          {imageUrl && (
            <button
              onClick={handleDownload}
              className="btn btn-success btn-large"
            >
              <FiDownload /> Baixar Imagem
            </button>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="alert alert-error">
            <strong>❌ Erro:</strong> {error}
          </div>
        )}

        {/* Preview da Imagem */}
        {imageUrl && (
          <div className="image-result">
            <h3>✅ Imagem Gerada (1080x1080)</h3>
            <div className="image-preview-container">
              <img src={imageUrl} alt="Post gerado" className="generated-image" />
              <div className="image-info">
                <p><strong>Template:</strong> {templates.find(t => t.id === template)?.name}</p>
                <p><strong>Resolução:</strong> 1080x1080px (Instagram)</p>
                <p><strong>Formato:</strong> JPEG (92% qualidade)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .post-preview {
          max-width: 1000px;
          margin: 2rem auto;
        }

        .preview-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .preview-header h2 {
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

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .template-selector h3,
        .product-data h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .template-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid #ddd;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .template-option.active {
          border-width: 3px;
        }

        .template-color {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .template-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .template-info strong {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .template-info span {
          font-size: 0.85rem;
          color: var(--text-secondary, #666);
        }

        .product-data {
          background: var(--surface, #f5f5f5);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
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

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .image-result {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid var(--border, #e0e0e0);
        }

        .image-result h3 {
          margin-bottom: 1.5rem;
        }

        .image-preview-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .generated-image {
          width: 100%;
          max-width: 450px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .image-info {
          background: var(--surface, #f5f5f5);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .image-info p {
          margin-bottom: 0.75rem;
        }

        .image-info strong {
          color: var(--text-primary, #000);
        }

        @media (max-width: 768px) {
          .image-preview-container {
            grid-template-columns: 1fr;
          }

          .generated-image {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PostPreview;
