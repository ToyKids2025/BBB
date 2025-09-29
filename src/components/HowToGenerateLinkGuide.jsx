import React from 'react';
import { FiArrowDown, FiCopy, FiLink, FiXCircle } from 'react-icons/fi';

/**
 * Componente HowToGenerateLinkGuide
 * Um guia visual passo a passo para ensinar o usuário a gerar e usar os links corretamente.
 */
const HowToGenerateLinkGuide = () => {
  return (
    <div className="guide-container card glass">
      <style jsx>{`
        .guide-container {
          padding: 2rem;
          border-left: 5px solid var(--accent-color);
        }
        .guide-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .guide-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }
        .step {
          margin-bottom: 2rem;
        }
        .step:last-child {
          margin-bottom: 0;
        }
        .step-title {
          font-weight: bold;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .url-box {
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 8px;
          font-family: 'Courier New', Courier, monospace;
          word-break: break-all;
          border: 1px solid var(--border-color);
        }
        .correct {
          border-left: 3px solid var(--success);
        }
        .incorrect {
          border-left: 3px solid var(--error);
          text-decoration: line-through;
          color: var(--text-secondary);
        }
        .arrow {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
          color: var(--accent-color);
        }
        .final-link {
          background: var(--accent-gradient);
          color: white;
          font-weight: bold;
        }
      `}</style>

      <div className="guide-header">
        <FiLink size={28} />
        <h2>Como Gerar seu Link Mágico (Passo a Passo)</h2>
      </div>

      <div className="step">
        <div className="step-title">1. Copie a URL "Limpa" do Produto</div>
        <p>Vá até a página do produto e copie o endereço, apagando tudo a partir do "?".</p>
        <div className="url-box correct">
          https://www.amazon.com.br/dp/B0DG5CDDF9
        </div>
        <div className="url-box incorrect">
          https://www.amazon.com.br/dp/B0DG5CDDF9?tag=...&ref=...
        </div>
      </div>

      <div className="arrow">
        <FiArrowDown size={24} />
      </div>

      <div className="step">
        <div className="step-title">2. Cole no seu Painel e Gere o Link</div>
        <p>O sistema irá criar um **novo link** no seu domínio.</p>
      </div>

      <div className="arrow">
        <FiArrowDown size={24} />
      </div>

      <div className="step">
        <div className="step-title">3. Copie e Compartilhe o Link Gerado (O Link Mágico ✨)</div>
        <p>É **ESTE** link que você deve usar em suas postagens. Ele contém toda a tecnologia de rastreamento.</p>
        <div className="url-box final-link">
          https://[seu-dominio].com/r/xyz123
        </div>
        <div className="url-box incorrect">
          <FiXCircle /> Não compartilhe o link da Amazon diretamente!
        </div>
      </div>
    </div>
  );
};

export default HowToGenerateLinkGuide;