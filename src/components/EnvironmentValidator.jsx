import React, { useState, useEffect } from 'react';
import { FiAlertOctagon } from 'react-icons/fi';

/**
 * Componente EnvironmentValidator
 * Verifica se as variáveis de ambiente essenciais estão definidas
 * e exibe um alerta em modo de desenvolvimento se alguma estiver faltando.
 */

// Lista de variáveis de ambiente obrigatórias para o funcionamento do sistema.
// Extraído de firebase.js, README-PREMIUM.md e relatórios.
const REQUIRED_ENV_VARS = [
  'REACT_APP_AMAZON_TAG',
  'REACT_APP_ML_AFFILIATE_ID',
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const EnvironmentValidator = () => {
  const [missingVars, setMissingVars] = useState([]);

  useEffect(() => {
    // Este componente só deve exibir o alerta em ambiente de desenvolvimento.
    if (process.env.NODE_ENV === 'development') {
      const missing = REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar]);
      setMissingVars(missing);
    }
  }, []);

  // Se não houver variáveis faltando, não renderiza nada.
  if (missingVars.length === 0) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .env-validator-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .env-validator-card {
          background: white;
          color: #333;
          border-radius: 12px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          border-top: 5px solid #f44336;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d32f2f;
          margin-bottom: 1rem;
        }
        .header h2 {
          margin: 0;
        }
        .content p {
          line-height: 1.6;
        }
        .missing-list {
          list-style-type: none;
          padding: 0;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .missing-list li {
          padding: 0.75rem 1rem;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
          border-bottom: 1px solid #ddd;
        }
        .missing-list li:last-child {
          border-bottom: none;
        }
      `}</style>
      <div className="env-validator-overlay">
        <div className="env-validator-card">
          <div className="header">
            <FiAlertOctagon size={32} />
            <h2>Configuração Incompleta</h2>
          </div>
          <div className="content">
            <p>O sistema detectou que algumas variáveis de ambiente essenciais não foram configuradas. Sem elas, funcionalidades críticas como a geração de links de afiliado e a conexão com o banco de dados não funcionarão.</p>
            <p>As seguintes variáveis estão faltando no seu arquivo <strong>.env.local</strong>:</p>
            <ul className="missing-list">
              {missingVars.map(v => <li key={v}>{v}</li>)}
            </ul>
            <p><strong>Solução:</strong> Crie ou edite o arquivo <code>.env.local</code> na raiz do projeto, adicione as variáveis listadas acima com seus respectivos valores e <strong>reinicie o servidor de desenvolvimento</strong>.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnvironmentValidator;