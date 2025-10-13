/**
 * 📦 PRODUCT EXTRACTOR - Componente de Teste
 *
 * Interface para testar o scraper de produtos
 * Permite extrair dados de URLs e visualizar resultados
 *
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { scrapeProductData } from '../../utils/instagram/scraper';
import { FiSearch, FiPackage, FiImage, FiDollarSign, FiStar } from 'react-icons/fi';

const ProductExtractor = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');

  const handleExtract = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Por favor, cole uma URL válida');
      return;
    }

    setLoading(true);
    setError('');
    setProductData(null);

    try {
      console.log('🔍 Extraindo dados da URL:', url);
      const data = await scrapeProductData(url);
      console.log('✅ Dados extraídos:', data);
      setProductData(data);
    } catch (err) {
      console.error('❌ Erro ao extrair dados:', err);
      setError(err.message || 'Erro ao extrair dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleTestML = () => {
    setUrl('https://produto.mercadolivre.com.br/MLB-3711633645-notebook-gamer-acer-nitro-5-i5-12450h-16gb-512gb-ssd-rtx-3050-156-fhd-144hz-linux-preto-_JM');
  };

  const handleTestAmazon = () => {
    setUrl('https://www.amazon.com.br/dp/B08N5WRWNW');
  };

  return (
    <div className="product-extractor card glass">
      <div className="extractor-header">
        <FiPackage size={28} />
        <h2>Extrator de Produtos</h2>
        <p className="subtitle">Cole a URL de um produto para extrair dados automaticamente</p>
      </div>

      <form onSubmit={handleExtract} className="extractor-form">
        <div className="form-group">
          <label htmlFor="product-url">
            <FiSearch /> URL do Produto
          </label>
          <input
            id="product-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://produto.mercadolivre.com.br/MLB-..."
            className="input"
            disabled={loading}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Extraindo...
              </>
            ) : (
              <>
                <FiSearch /> Extrair Dados
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleTestML}
            className="btn btn-secondary"
            disabled={loading}
          >
            🛒 Testar ML
          </button>

          <button
            type="button"
            onClick={handleTestAmazon}
            className="btn btn-secondary"
            disabled={loading}
          >
            📦 Testar Amazon
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-error">
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {productData && (
        <div className="product-result">
          <div className="result-header">
            <h3>✅ Dados Extraídos</h3>
            <span className={`platform-badge ${productData.platform}`}>
              {productData.platform}
            </span>
          </div>

          <div className="result-grid">
            {/* Título */}
            <div className="result-item">
              <div className="result-label">
                <FiPackage /> Título
              </div>
              <div className="result-value">{productData.title}</div>
            </div>

            {/* Preço */}
            {productData.price && (
              <div className="result-item">
                <div className="result-label">
                  <FiDollarSign /> Preço
                </div>
                <div className="result-value price">
                  R$ {productData.price.toFixed(2)}
                  {productData.discount && (
                    <span className="discount-badge">-{productData.discount}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Preço Original */}
            {productData.originalPrice && (
              <div className="result-item">
                <div className="result-label">
                  <FiDollarSign /> Preço Original
                </div>
                <div className="result-value original-price">
                  R$ {productData.originalPrice.toFixed(2)}
                </div>
              </div>
            )}

            {/* Avaliação */}
            {productData.rating && (
              <div className="result-item">
                <div className="result-label">
                  <FiStar /> Avaliação
                </div>
                <div className="result-value rating">
                  {productData.rating.toFixed(1)} ⭐
                  {productData.reviewCount && (
                    <span className="review-count">
                      ({productData.reviewCount.toLocaleString()} avaliações)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Imagens */}
            {productData.images && productData.images.length > 0 && (
              <div className="result-item full-width">
                <div className="result-label">
                  <FiImage /> Imagens ({productData.images.length})
                </div>
                <div className="images-grid">
                  {productData.images.slice(0, 4).map((img, index) => (
                    <div key={index} className="image-preview">
                      <img src={img} alt={`Produto ${index + 1}`} />
                    </div>
                  ))}
                  {productData.images.length > 4 && (
                    <div className="image-preview more">
                      +{productData.images.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dados extras */}
            {productData.condition && (
              <div className="result-item">
                <div className="result-label">Condição</div>
                <div className="result-value">{productData.condition}</div>
              </div>
            )}

            {productData.soldQuantity !== null && (
              <div className="result-item">
                <div className="result-label">Vendidos</div>
                <div className="result-value">{productData.soldQuantity}</div>
              </div>
            )}

            {/* Timestamp */}
            <div className="result-item full-width">
              <div className="result-label">Extraído em</div>
              <div className="result-value timestamp">
                {new Date(productData.scrapedAt).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* JSON completo (para debug) */}
          <details className="json-details">
            <summary>🔍 Ver JSON completo</summary>
            <pre className="json-preview">
              {JSON.stringify(productData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <style jsx>{`
        .product-extractor {
          max-width: 900px;
          margin: 2rem auto;
        }

        .extractor-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .extractor-header h2 {
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

        .extractor-form {
          margin-bottom: 2rem;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
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
          margin-bottom: 1rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .product-result {
          background: var(--surface, #f5f5f5);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border, #e0e0e0);
        }

        .result-header h3 {
          margin: 0;
        }

        .platform-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .platform-badge.mercadolivre {
          background: #fff159;
          color: #333;
        }

        .platform-badge.amazon {
          background: #ff9900;
          color: white;
        }

        .platform-badge.shopee {
          background: #ee4d2d;
          color: white;
        }

        .platform-badge.magalu {
          background: #0086ff;
          color: white;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .result-item {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .result-item.full-width {
          grid-column: 1 / -1;
        }

        .result-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary, #666);
          margin-bottom: 0.5rem;
        }

        .result-value {
          font-size: 1rem;
          color: var(--text-primary, #000);
        }

        .result-value.price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
        }

        .discount-badge {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-left: 0.5rem;
        }

        .result-value.original-price {
          text-decoration: line-through;
          color: #999;
        }

        .result-value.rating {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .review-count {
          font-size: 0.85rem;
          color: #666;
          margin-left: 0.5rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.5rem;
        }

        .image-preview {
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview.more {
          background: var(--primary, #667eea);
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
        }

        .result-value.timestamp {
          font-size: 0.85rem;
          color: #666;
        }

        .json-details {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid var(--border, #e0e0e0);
        }

        .json-details summary {
          cursor: pointer;
          font-weight: 600;
          color: var(--primary, #667eea);
          user-select: none;
        }

        .json-details summary:hover {
          text-decoration: underline;
        }

        .json-preview {
          margin-top: 1rem;
          padding: 1rem;
          background: #1e1e1e;
          color: #d4d4d4;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ProductExtractor;
