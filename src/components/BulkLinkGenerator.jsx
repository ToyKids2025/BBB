import React, { useState } from 'react';
import {
  FiUpload, FiDownload, FiCopy, FiCheckCircle,
  FiAlertCircle, FiFileText, FiTrash2
} from 'react-icons/fi';
import { createShortlink, detectPlatform } from '../config';
import { saveLink } from '../firebase';

/**
 * Bulk Link Generator - Gera múltiplos links de uma vez
 * Processa listas de URLs e exporta resultados
 */
const BulkLinkGenerator = ({ onComplete }) => {
  const [urls, setUrls] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);

  // Processar múltiplas URLs
  const processUrls = async () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && isValidUrl(url));

    if (urlList.length === 0) {
      alert('Por favor, insira URLs válidas');
      return;
    }

    setProcessing(true);
    setProgress(0);
    const processedLinks = [];

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      const platform = detectPlatform(url);

      try {
        // Gerar link com tag
        const result = await createShortlink(url);

        if (result.success) {
          // Salvar no Firebase
          const linkData = {
            url: result.shortUrl,
            originalUrl: url,
            platform,
            title: extractTitle(url),
            createdAt: new Date().toISOString(),
            clicks: 0
          };

          const saved = await saveLink(linkData);

          processedLinks.push({
            ...linkData,
            id: saved.id || result.key,
            status: 'success'
          });
        } else {
          processedLinks.push({
            originalUrl: url,
            status: 'error',
            error: result.error
          });
        }
      } catch (error) {
        processedLinks.push({
          originalUrl: url,
          status: 'error',
          error: error.message
        });
      }

      // Atualizar progresso
      setProgress(((i + 1) / urlList.length) * 100);
    }

    setResults(processedLinks);
    setProcessing(false);

    // Callback opcional
    if (onComplete) {
      onComplete(processedLinks);
    }
  };

  // Validar URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Extrair título da URL
  const extractTitle = (url) => {
    // Tentar extrair nome do produto da URL
    const patterns = {
      amazon: /\/([^\/]+)\/dp\//,
      mercadolivre: /\/([^\/]+)-MLB/,
      default: /\/([^\/]+)$/
    };

    const platform = detectPlatform(url);
    const pattern = patterns[platform] || patterns.default;
    const match = url.match(pattern);

    if (match && match[1]) {
      return match[1]
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .substring(0, 50);
    }

    return 'Produto';
  };

  // Importar CSV
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');

      // Detectar se é CSV ou lista simples
      if (content.includes(',')) {
        // CSV: assumir que URL está na primeira coluna
        const csvUrls = lines
          .map(line => line.split(',')[0])
          .filter(url => isValidUrl(url.trim()));
        setUrls(csvUrls.join('\n'));
      } else {
        // Lista simples de URLs
        setUrls(content);
      }

      setShowImportModal(false);
    };

    reader.readAsText(file);
  };

  // Exportar resultados
  const exportResults = (format = 'csv') => {
    if (results.length === 0) return;

    let content = '';
    const filename = `links_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      // Cabeçalho CSV
      content = 'URL Original,Link Gerado,Plataforma,Status\n';

      // Dados
      results.forEach(result => {
        content += `"${result.originalUrl}","${result.url || ''}","${result.platform || ''}","${result.status}"\n`;
      });

      downloadFile(content, `${filename}.csv`, 'text/csv');

    } else if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      downloadFile(content, `${filename}.json`, 'application/json');

    } else if (format === 'txt') {
      results.forEach(result => {
        if (result.status === 'success') {
          content += `${result.url}\n`;
        }
      });
      downloadFile(content, `${filename}.txt`, 'text/plain');
    }
  };

  // Download de arquivo
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Copiar todos os links
  const copyAllLinks = () => {
    const links = results
      .filter(r => r.status === 'success')
      .map(r => r.url)
      .join('\n');

    navigator.clipboard.writeText(links);
    alert('Links copiados para a área de transferência!');
  };

  // Limpar tudo
  const clearAll = () => {
    setUrls('');
    setResults([]);
    setProgress(0);
  };

  // Estatísticas
  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    errors: results.filter(r => r.status === 'error').length
  };

  return (
    <div className="bulk-link-generator">
      <div className="generator-header">
        <h2>Gerador de Links em Massa</h2>
        <p>Processe múltiplas URLs de uma vez</p>
      </div>

      {/* Input de URLs */}
      <div className="url-input-section">
        <div className="input-header">
          <label>Cole suas URLs (uma por linha)</label>
          <div className="input-actions">
            <button
              className="btn-import"
              onClick={() => setShowImportModal(true)}
            >
              <FiUpload />
              Importar CSV
            </button>
            {urls && (
              <button className="btn-clear" onClick={clearAll}>
                <FiTrash2 />
                Limpar
              </button>
            )}
          </div>
        </div>

        <textarea
          className="url-textarea"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://www.amazon.com.br/dp/B0CJK4JG67&#10;https://produto.mercadolivre.com.br/MLB-123456&#10;https://www.magazineluiza.com.br/produto/..."
          rows={10}
          disabled={processing}
        />

        <div className="input-footer">
          <span className="url-count">
            {urls.split('\n').filter(u => u.trim()).length} URLs
          </span>
          <button
            className="btn-process"
            onClick={processUrls}
            disabled={processing || !urls}
          >
            {processing ? 'Processando...' : 'Gerar Links'}
          </button>
        </div>
      </div>

      {/* Barra de Progresso */}
      {processing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {Math.round(progress)}% completo
          </span>
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Resultados</h3>
            <div className="results-stats">
              <span className="stat success">
                <FiCheckCircle />
                {stats.success} sucesso
              </span>
              {stats.errors > 0 && (
                <span className="stat error">
                  <FiAlertCircle />
                  {stats.errors} erros
                </span>
              )}
            </div>
          </div>

          <div className="results-list">
            {results.map((result, index) => (
              <div
                key={index}
                className={`result-item ${result.status}`}
              >
                <div className="result-content">
                  <div className="result-url">
                    {result.originalUrl}
                  </div>
                  {result.status === 'success' && (
                    <div className="result-link">
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        {result.url}
                      </a>
                      <button
                        className="btn-copy-single"
                        onClick={() => {
                          navigator.clipboard.writeText(result.url);
                        }}
                      >
                        <FiCopy />
                      </button>
                    </div>
                  )}
                  {result.status === 'error' && (
                    <div className="result-error">
                      Erro: {result.error}
                    </div>
                  )}
                </div>
                <div className="result-badge">
                  {result.platform}
                </div>
              </div>
            ))}
          </div>

          {/* Ações de Exportação */}
          <div className="export-actions">
            <button className="btn-export" onClick={() => exportResults('csv')}>
              <FiDownload />
              Exportar CSV
            </button>
            <button className="btn-export" onClick={() => exportResults('json')}>
              <FiFileText />
              Exportar JSON
            </button>
            <button className="btn-export" onClick={() => exportResults('txt')}>
              <FiFileText />
              Exportar TXT
            </button>
            <button className="btn-export primary" onClick={copyAllLinks}>
              <FiCopy />
              Copiar Todos
            </button>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="import-modal" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Importar URLs</h3>
            <p>Selecione um arquivo CSV ou TXT com suas URLs</p>

            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileImport}
              id="file-import"
              className="file-input"
            />
            <label htmlFor="file-import" className="file-label">
              <FiUpload />
              Escolher Arquivo
            </label>

            <div className="modal-info">
              <p>Formatos aceitos:</p>
              <ul>
                <li>CSV: URLs na primeira coluna</li>
                <li>TXT: Uma URL por linha</li>
              </ul>
            </div>

            <button
              className="btn-cancel"
              onClick={() => setShowImportModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .bulk-link-generator {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .generator-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .generator-header h2 {
          margin: 0;
          color: #333;
        }

        .generator-header p {
          color: #666;
          margin-top: 5px;
        }

        .url-input-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .input-header label {
          font-weight: 600;
          color: #333;
        }

        .input-actions {
          display: flex;
          gap: 10px;
        }

        .btn-import, .btn-clear {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 15px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .btn-import:hover, .btn-clear:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .url-textarea {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .url-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .url-textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }

        .url-count {
          color: #666;
          font-size: 14px;
        }

        .btn-process {
          padding: 10px 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-process:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .btn-process:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #11998e, #38ef7d);
          transition: width 0.3s ease;
        }

        .progress-text {
          display: block;
          text-align: center;
          margin-top: 10px;
          color: #666;
          font-size: 14px;
        }

        .results-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .results-header h3 {
          margin: 0;
          color: #333;
        }

        .results-stats {
          display: flex;
          gap: 15px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
        }

        .stat.success {
          color: #4CAF50;
        }

        .stat.error {
          color: #f44336;
        }

        .results-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .result-item {
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .result-item.success {
          background: #f1f8e9;
          border-color: #8bc34a;
        }

        .result-item.error {
          background: #ffebee;
          border-color: #ef5350;
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-url {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-link {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .result-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .result-link a:hover {
          text-decoration: underline;
        }

        .btn-copy-single {
          padding: 5px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .btn-copy-single:hover {
          background: #f5f5f5;
        }

        .result-error {
          color: #f44336;
          font-size: 13px;
        }

        .result-badge {
          padding: 4px 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .export-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .btn-export:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .btn-export.primary {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          border: none;
        }

        .btn-export.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(17,153,142,0.3);
        }

        .import-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
        }

        .modal-content h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .modal-content p {
          color: #666;
          margin-bottom: 20px;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .file-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .modal-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .modal-info p {
          margin: 0 0 10px 0;
          font-weight: 600;
          color: #333;
        }

        .modal-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .modal-info li {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .btn-cancel {
          width: 100%;
          padding: 10px;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default BulkLinkGenerator;