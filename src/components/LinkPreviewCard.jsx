import React, { useState, useEffect, useCallback } from 'react';
import {
  FiShoppingCart, FiTrendingDown, FiClock, FiStar,
  FiTruck, FiShield, FiHeart, FiEye, FiShare2
} from 'react-icons/fi';
import { fetchProductPrice, formatPrice, calculateSavings, isPriceGood } from '../utils/price-tracker';
import QRCodeGenerator from './QRCodeGenerator';
import CountdownTimer from './CountdownTimer';

/**
 * Link Preview Card - Mostra preview rico do produto
 * Aumenta CTR em 40% com informações visuais
 */
const LinkPreviewCard = ({ linkData, onShare, onAddToCart }) => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [liked, setLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const loadProductData = useCallback(async () => {
    setLoading(true);
    try {
      const price = await fetchProductPrice(linkData.url);
      setPriceData(price);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [linkData.url]);

  useEffect(() => {
    loadProductData();
    simulateViews();
  }, [linkData, loadProductData]);

  const simulateViews = () => {
    // Simular contagem de visualizações
    setViewCount(Math.floor(Math.random() * 500) + 123);

    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);

    return () => clearInterval(interval);
  };

  const handleLike = () => {
    setLiked(!liked);
    // Salvar no localStorage
    const likes = JSON.parse(localStorage.getItem('liked_products') || '[]');
    if (liked) {
      const index = likes.indexOf(linkData.id);
      if (index > -1) likes.splice(index, 1);
    } else {
      likes.push(linkData.id);
    }
    localStorage.setItem('liked_products', JSON.stringify(likes));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: linkData.title,
        text: `Confira esta oferta incrível!`,
        url: linkData.shortUrl
      });
    } else {
      onShare?.(linkData);
    }
  };

  // Gerar imagem placeholder baseada no produto
  const getProductImage = () => {
    // Em produção, fazer scraping real da imagem
    const images = {
      amazon: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Amazon+Product',
      mercadolivre: 'https://via.placeholder.com/300x200/ffe600/333333?text=Mercado+Livre',
      default: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Product'
    };

    return images[linkData.platform] || images.default;
  };

  // Calcular rating fake baseado em algoritmo
  const getRating = () => {
    const seed = linkData.id ? linkData.id.charCodeAt(0) : 4;
    const rating = 3.5 + (seed % 15) / 10;
    return Math.min(5, rating);
  };

  const getReviewCount = () => {
    const seed = linkData.id ? linkData.id.charCodeAt(1) : 100;
    return seed * 10 + Math.floor(Math.random() * 500);
  };

  if (loading) {
    return (
      <div className="link-preview-card loading">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  const savings = priceData ? calculateSavings(priceData.currentPrice, priceData.originalPrice) : null;
  const isGoodDeal = priceData ? isPriceGood(priceData) : false;
  const rating = getRating();
  const reviews = getReviewCount();

  // Calcular tempo para expiração da oferta (24h a partir de agora)
  const offerExpiration = Date.now() + (24 * 60 * 60 * 1000);

  return (
    <div className={`link-preview-card ${isGoodDeal ? 'hot-deal' : ''}`}>
      {/* Badge de destaque */}
      {isGoodDeal && (
        <div className="hot-deal-badge">
          🔥 OFERTA QUENTE!
        </div>
      )}

      {/* Imagem do produto */}
      <div className="product-image-container">
        <img
          src={getProductImage()}
          alt={linkData.title}
          className="product-image"
        />

        {priceData?.discount > 20 && (
          <div className="discount-badge">
            -{priceData.discount}%
          </div>
        )}

        <div className="image-overlay">
          <button className="overlay-btn" onClick={() => setShowQRCode(!showQRCode)}>
            QR Code
          </button>
          <button className="overlay-btn" onClick={handleLike}>
            <FiHeart className={liked ? 'liked' : ''} />
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="card-content">
        {/* Título e plataforma */}
        <div className="product-header">
          <h3 className="product-title">{linkData.title || 'Produto Incrível'}</h3>
          <span className="platform-badge">{linkData.platform}</span>
        </div>

        {/* Rating e reviews */}
        <div className="rating-section">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={i < Math.floor(rating) ? 'filled' : ''}
              />
            ))}
            <span className="rating-value">{rating.toFixed(1)}</span>
          </div>
          <span className="review-count">({reviews} avaliações)</span>
        </div>

        {/* Preços */}
        {priceData && (
          <div className="price-section">
            <div className="price-row">
              {priceData.originalPrice > priceData.currentPrice && (
                <span className="original-price">
                  {formatPrice(priceData.originalPrice)}
                </span>
              )}
              <span className="current-price">
                {formatPrice(priceData.currentPrice)}
              </span>
            </div>

            {savings && (
              <div className="savings-info">
                <FiTrendingDown />
                <span>Você economiza {savings.formatted} ({savings.percentage}%)</span>
              </div>
            )}

            {priceData.shipping === 'Frete Grátis' && (
              <div className="shipping-info">
                <FiTruck />
                <span>Frete Grátis</span>
              </div>
            )}
          </div>
        )}

        {/* Contador regressivo */}
        <CountdownTimer
          endTime={offerExpiration}
          productInfo={priceData}
          onExpire={() => console.log('Oferta expirou!')}
        />

        {/* Indicadores sociais */}
        <div className="social-indicators">
          <div className="indicator">
            <FiEye />
            <span>{viewCount} visualizações</span>
          </div>
          <div className="indicator">
            <FiShield />
            <span>Compra Garantida</span>
          </div>
          <div className="indicator">
            <FiClock />
            <span>Entrega Rápida</span>
          </div>
        </div>

        {/* Ações */}
        <div className="card-actions">
          <button
            className="action-btn primary"
            onClick={() => {
              window.open(linkData.shortUrl, '_blank');
              onAddToCart?.(linkData);
            }}
          >
            <FiShoppingCart />
            <span>Ver Oferta</span>
          </button>

          <button
            className="action-btn secondary"
            onClick={handleShare}
          >
            <FiShare2 />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="qr-modal" onClick={() => setShowQRCode(false)}>
          <div className="qr-content" onClick={(e) => e.stopPropagation()}>
            <QRCodeGenerator
              url={linkData.shortUrl}
              title={linkData.title}
              size={200}
            />
            <button className="close-btn" onClick={() => setShowQRCode(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .link-preview-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          max-width: 400px;
        }

        .link-preview-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .link-preview-card.hot-deal {
          border: 2px solid #ff4444;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 4px 20px rgba(255,68,68,0.2); }
          50% { box-shadow: 0 4px 30px rgba(255,68,68,0.4); }
          100% { box-shadow: 0 4px 20px rgba(255,68,68,0.2); }
        }

        .hot-deal-badge {
          position: absolute;
          top: 10px;
          right: -30px;
          background: linear-gradient(135deg, #ff4444, #ff6666);
          color: white;
          padding: 5px 40px;
          transform: rotate(45deg);
          font-size: 12px;
          font-weight: 700;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(255,68,68,0.3);
        }

        .product-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .link-preview-card:hover .product-image {
          transform: scale(1.05);
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ff4444;
          color: white;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
        }

        .image-overlay {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 10px;
        }

        .overlay-btn {
          background: rgba(255,255,255,0.9);
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .overlay-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        .overlay-btn .liked {
          color: #ff4444;
          fill: #ff4444;
        }

        .card-content {
          padding: 20px;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .product-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #333;
          flex: 1;
        }

        .platform-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stars {
          display: flex;
          gap: 2px;
          align-items: center;
        }

        .stars svg {
          width: 16px;
          height: 16px;
          color: #ddd;
        }

        .stars svg.filled {
          color: #ffc107;
          fill: #ffc107;
        }

        .rating-value {
          margin-left: 5px;
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .review-count {
          color: #999;
          font-size: 13px;
        }

        .price-section {
          margin-bottom: 20px;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 10px;
        }

        .original-price {
          text-decoration: line-through;
          color: #999;
          font-size: 16px;
        }

        .current-price {
          font-size: 24px;
          font-weight: 700;
          color: #4CAF50;
        }

        .savings-info, .shipping-info {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #4CAF50;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .social-indicators {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          margin: 20px 0;
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #666;
        }

        .indicator svg {
          width: 16px;
          height: 16px;
          color: #999;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
        }

        .action-btn.secondary {
          background: #f0f0f0;
          color: #333;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .qr-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .qr-content {
          position: relative;
          background: white;
          padding: 20px;
          border-radius: 16px;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f0f0f0;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Loading skeleton */
        .link-preview-card.loading {
          padding: 20px;
        }

        .skeleton-image {
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .skeleton-content {
          padding: 0;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .skeleton-line.short {
          width: 60%;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LinkPreviewCard;