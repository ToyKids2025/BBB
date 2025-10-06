import React from 'react';
import { FiAlertCircle, FiShield, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * Footer Global - Aparece em TODAS as páginas
 * AVISO IMPORTANTE de diferenciação
 */
const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
      borderTop: '1px solid var(--border-color)',
      marginTop: '4rem',
      paddingTop: '2rem'
    }}>
      <style>{`
        .footer-warning {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 1.5rem 2rem;
          margin: 0 auto 2rem auto;
          max-width: 1200px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        .footer-warning-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .footer-warning h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }
        .footer-warning p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem 2rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .footer-section h5 {
          color: var(--accent-color);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-section li {
          margin-bottom: 0.5rem;
        }
        .footer-section a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-section a:hover {
          color: var(--accent-color);
        }
        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .footer-bottom p {
          margin: 0.5rem 0;
        }
        .footer-disclaimer {
          background: #fff3cd;
          border: 2px solid #ffc107;
          color: #856404;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }
        @media (max-width: 768px) {
          .footer-warning {
            padding: 1rem;
            flex-direction: column;
          }
          .footer-content {
            padding: 0 1rem 1rem 1rem;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>

      {/* AVISO DESTACADO - NÃO SOMOS LOJA FÍSICA */}
      <div className="footer-warning">
        <FiAlertCircle size={28} className="footer-warning-icon" />
        <div>
          <h4>⚠️ ATENÇÃO - LEIA COM CUIDADO</h4>
          <p>
            <strong>NÃO SOMOS A LOJA "BUSCA BUSCA"</strong> do Shopping Plaza Polo (Brás, São Paulo).
            Somos uma <strong>plataforma de tecnologia</strong> independente para gestão de links de afiliados.
            Não temos lojas físicas. Não vendemos produtos. Não temos relação com @buscabuscaoficial ou
            qualquer estabelecimento comercial de nome similar.
          </p>
        </div>
      </div>

      <div className="footer-content">
        {/* DISCLAIMER LEGAL */}
        <div className="footer-disclaimer">
          <strong>📋 Este é um serviço de SOFTWARE:</strong> Plataforma de tecnologia para gestão de links de afiliados.
          Não somos marketplace, e-commerce ou loja física.
        </div>

        {/* GRID DE INFORMAÇÕES */}
        <div className="footer-grid">
          {/* SOBRE */}
          <div className="footer-section">
            <h5><FiInfo size={18} /> Sobre o Serviço</h5>
            <ul>
              <li><Link to="/sobre">Quem Somos</Link></li>
              <li><Link to="/about">About Us (English)</Link></li>
              <li><Link to="/faq">Perguntas Frequentes (FAQ)</Link></li>
              <li><a href="mailto:contato@buscabuscabrasil.com.br">Contato</a></li>
            </ul>
            <p style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              Plataforma de tecnologia para afiliados Amazon, Mercado Livre e outras plataformas.
            </p>
          </div>

          {/* O QUE FAZEMOS */}
          <div className="footer-section">
            <h5><FiShield size={18} /> Nosso Serviço</h5>
            <ul>
              <li>✓ Gestão de links de afiliados</li>
              <li>✓ Otimização de URLs</li>
              <li>✓ Analytics profissional</li>
              <li>✓ Proteção de comissões</li>
            </ul>
            <p style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              Para influenciadores, criadores de conteúdo e profissionais de marketing digital.
            </p>
          </div>

          {/* NÃO SOMOS */}
          <div className="footer-section">
            <h5><FiAlertCircle size={18} /> NÃO Confunda</h5>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <strong>NÃO somos:</strong><br/>
              ✗ Loja física "Busca Busca" (Brás)<br/>
              ✗ @buscabuscaoficial (Instagram)<br/>
              ✗ Marketplace ou e-commerce<br/>
              ✗ Loja de varejo<br/><br/>

              <strong>SOMOS:</strong><br/>
              ✓ Plataforma de tecnologia<br/>
              ✓ Ferramenta para afiliados<br/>
              ✓ Software de marketing digital
            </p>
          </div>
        </div>

        {/* RODAPÉ FINAL */}
        <div className="footer-bottom">
          <p>
            <strong>BuscaBusca Brasil</strong> - Plataforma de Gestão de Links de Afiliados
          </p>
          <p>
            Serviço de Tecnologia | Marketing Digital | Affiliate Links Manager
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} BuscaBusca Brasil. Todos os direitos reservados.
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Este site não possui relação com estabelecimentos físicos ou lojas de mesmo nome.<br/>
            Desenvolvido com React.js + Firebase + Vercel
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
