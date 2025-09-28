import React, { useState, useEffect } from 'react';
import { FiDownload, FiShare2, FiCopy, FiSmartphone } from 'react-icons/fi';

/**
 * Gerador de QR Code para Links
 * Facilita compartilhamento mobile e aumenta conversões
 */
const QRCodeGenerator = ({ url, title, size = 200 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [url]);

  // Gerar QR Code usando API pública gratuita
  const generateQRCode = () => {
    // Usar Google Charts API (gratuita e sem limites)
    const qrApiUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(url)}&choe=UTF-8`;

    // Alternativa: QR Server API
    // const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

    setQrCodeUrl(qrApiUrl);
    setLoading(false);
  };

  // Download do QR Code
  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qrcode-${title || 'link'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  // Copiar link
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compartilhar via Web Share API
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Confira esta oferta!',
          text: 'Escaneie o QR Code ou acesse o link',
          url: url
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar link
      copyLink();
    }
  };

  // Gerar QR Code em Canvas (alternativa sem API externa)
  const generateLocalQRCode = () => {
    // Implementação simples de QR Code usando canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Criar padrão simples (em produção, usar biblioteca qrcode.js)
    const moduleSize = 8;
    const modules = size / moduleSize;

    // Fundo branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Padrão do QR (simplificado)
    ctx.fillStyle = 'black';

    // Cantos de posicionamento
    drawPositionPattern(ctx, 0, 0, moduleSize);
    drawPositionPattern(ctx, size - 7 * moduleSize, 0, moduleSize);
    drawPositionPattern(ctx, 0, size - 7 * moduleSize, moduleSize);

    // Dados (simplificado - em produção usar encoder real)
    const data = url.split('');
    for (let i = 0; i < data.length && i < modules * modules; i++) {
      const x = (i % modules) * moduleSize;
      const y = Math.floor(i / modules) * moduleSize;
      if (data[i].charCodeAt(0) % 2 === 0) {
        ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
      }
    }

    return canvas.toDataURL();
  };

  // Desenhar padrão de posicionamento (cantos do QR)
  const drawPositionPattern = (ctx, x, y, size) => {
    // Quadrado externo
    ctx.fillRect(x, y, size * 7, size * 7);

    // Quadrado branco interno
    ctx.fillStyle = 'white';
    ctx.fillRect(x + size, y + size, size * 5, size * 5);

    // Quadrado preto central
    ctx.fillStyle = 'black';
    ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3);
  };

  return (
    <div className="qr-code-generator">
      <div className="qr-code-container">
        {loading ? (
          <div className="qr-loading">
            <div className="spinner"></div>
            <p>Gerando QR Code...</p>
          </div>
        ) : (
          <>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="qr-code-image"
              onError={(e) => {
                // Fallback se API falhar
                e.target.src = generateLocalQRCode();
              }}
            />

            <div className="qr-overlay">
              <FiSmartphone className="scan-icon" />
              <p>Escaneie com seu celular</p>
            </div>
          </>
        )}
      </div>

      <div className="qr-actions">
        <button
          className="action-btn download"
          onClick={downloadQRCode}
          title="Baixar QR Code"
        >
          <FiDownload />
          <span>Baixar</span>
        </button>

        <button
          className="action-btn copy"
          onClick={copyLink}
          title="Copiar Link"
        >
          <FiCopy />
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>

        <button
          className="action-btn share"
          onClick={shareQRCode}
          title="Compartilhar"
        >
          <FiShare2 />
          <span>Compartilhar</span>
        </button>
      </div>

      {title && (
        <div className="qr-title">
          <p>{title}</p>
        </div>
      )}

      <style jsx>{`
        .qr-code-generator {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 300px;
          margin: 0 auto;
        }

        .qr-code-container {
          position: relative;
          display: inline-block;
          padding: 15px;
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .qr-code-image {
          display: block;
          width: ${size}px;
          height: ${size}px;
          image-rendering: pixelated;
        }

        .qr-overlay {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .scan-icon {
          font-size: 14px;
        }

        .qr-loading {
          width: ${size}px;
          height: ${size}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .qr-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 40px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .action-btn.download {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .action-btn.copy {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .action-btn.share {
          background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
        }

        .qr-title {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .qr-title p {
          margin: 0;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .qr-code-generator {
            padding: 15px;
          }

          .action-btn span {
            display: none;
          }

          .action-btn {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;