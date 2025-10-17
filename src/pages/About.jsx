import React from 'react';
import { FiShoppingCart, FiTag, FiAlertCircle, FiInstagram } from 'react-icons/fi';
import Footer from '../components/Footer';

/**
 * Página SOBRE NÓS
 * Explica o que é o BuscaBuscaBrasil (catálogo de ofertas)
 */
const About = () => {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <style>{`
        .about-container {
          background: var(--card-background);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .about-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .about-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .about-header p {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }
        .warning-box {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .warning-box h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
        }
        .development-box {
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
          border: 3px solid #FFC107;
          color: var(--text-primary);
          padding: 1.5rem;
          borderRadius: 12px;
          margin-bottom: 2rem;
        }
        .development-box h3 {
          margin: 0 0 1rem 0;
          color: #F57C00;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .feature-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        .feature-card h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--accent-color);
        }
        .info-section {
          margin: 2rem 0;
        }
        .info-section h2 {
          color: var(--accent-color);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .info-section ul {
          list-style: none;
          padding: 0;
        }
        .info-section li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }
        .info-section li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #4CAF50;
          font-weight: bold;
        }
        .contact-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }
        .disclaimer {
          background: #fff3cd;
          border: 2px solid #ffc107;
          color: #856404;
          padding: 1rem;
          border-radius: 8px;
          margin: 2rem 0;
          font-size: 0.95rem;
        }
      `}</style>

      {/* AVISO IMPORTANTE */}
      <div className="warning-box">
        <FiAlertCircle size={32} style={{ flexShrink: 0, marginTop: '4px' }} />
        <div>
          <h3>⚠️ AVISO IMPORTANTE</h3>
          <p style={{ margin: 0 }}>
            <strong>NÃO SOMOS A LOJA FÍSICA "Busca Busca"</strong> localizada no Shopping Plaza Polo (Brás, São Paulo).
            Somos um site de divulgação de ofertas de produtos Amazon e Mercado Livre, totalmente independente.
            Não temos relação com @buscabuscaoficial ou qualquer estabelecimento físico.
          </p>
        </div>
      </div>

      <div className="about-container">
        {/* CABEÇALHO */}
        <div className="about-header">
          <h1>🔍 BuscaBuscaBrasil</h1>
          <p>
            Seu guia para encontrar as melhores ofertas da Amazon e Mercado Livre
          </p>
        </div>

        {/* SITE EM DESENVOLVIMENTO */}
        <div className="development-box">
          <h3>🚧 Site em Desenvolvimento</h3>
          <p style={{ marginBottom: '1rem' }}>
            Nosso catálogo completo de produtos está sendo preparado. Estamos aguardando a
            <strong> liberação da API oficial da Amazon (Product Advertising API)</strong> para poder exibir:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Produtos com informações atualizadas em tempo real</li>
            <li>Preços oficiais diretamente da Amazon</li>
            <li>Avaliações e reviews de clientes</li>
            <li>Especificações técnicas completas</li>
            <li>Disponibilidade em estoque</li>
          </ul>
          <p style={{ margin: 0 }}>
            <strong>Por que aguardamos a API oficial?</strong> Optamos por não utilizar métodos inadequados
            (como scraping ou dados não oficiais) para garantir que todas as informações sejam precisas e
            estejam em conformidade com as políticas da Amazon.
          </p>
        </div>

        {/* QUEM SOMOS */}
        <div className="info-section">
          <h2><FiShoppingCart /> Quem Somos</h2>
          <p>
            O <strong>BuscaBuscaBrasil</strong> é um site de divulgação de ofertas e produtos
            selecionados da Amazon e Mercado Livre. Nossa missão é ajudar consumidores brasileiros
            a encontrar os melhores produtos com os melhores preços.
          </p>
        </div>

        {/* O QUE FAZEMOS */}
        <div className="info-section">
          <h2><FiTag /> O Que Fazemos</h2>
          <ul>
            <li>Divulgamos ofertas e produtos selecionados da Amazon e Mercado Livre</li>
            <li>Compartilhamos dicas de compras e guias de produtos</li>
            <li>Mantemos você informado sobre promoções e descontos</li>
            <li>Direcionamos você para as plataformas oficiais para compra segura</li>
            <li>Publicamos ofertas diárias no Instagram @buscabuscabr</li>
          </ul>
        </div>

        {/* O QUE VOCÊ VAI ENCONTRAR (FUTURO) */}
        <div className="info-section">
          <h2>🎯 O Que Você Vai Encontrar (Após Liberação da API)</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3><FiTag size={24} /> Ofertas do Dia</h3>
              <p>
                Produtos com os melhores descontos, atualizados diariamente com informações oficiais da Amazon.
              </p>
            </div>

            <div className="feature-card">
              <h3>⭐ Reviews e Avaliações</h3>
              <p>
                Avaliações reais de clientes da Amazon para ajudar você a tomar a melhor decisão de compra.
              </p>
            </div>

            <div className="feature-card">
              <h3>💰 Comparação de Preços</h3>
              <p>
                Compare preços e encontre as melhores ofertas entre Amazon e Mercado Livre.
              </p>
            </div>

            <div className="feature-card">
              <h3>📦 Categorias Diversas</h3>
              <p>
                Eletrônicos, casa e cozinha, moda, livros, games e muito mais em um só lugar.
              </p>
            </div>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="info-section">
          <h2>🛍️ Como Funciona</h2>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Você encontra produtos e ofertas em nosso site ou Instagram
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Clica no link do produto que te interessa
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              É direcionado para a Amazon ou Mercado Livre (plataformas oficiais)
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Realiza sua compra diretamente na plataforma oficial
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Recebe todas as garantias e benefícios das lojas oficiais
            </li>
          </ol>
        </div>

        {/* ENQUANTO O SITE ESTÁ EM DESENVOLVIMENTO */}
        <div className="info-section">
          <h2><FiInstagram /> Acompanhe no Instagram</h2>
          <p>
            Enquanto nosso catálogo está em desenvolvimento, publicamos diariamente
            ofertas selecionadas no Instagram:
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            marginTop: '1rem',
            color: 'white'
          }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
              <strong>@buscabuscabr</strong>
            </p>
            <p style={{ margin: 0 }}>
              Ofertas diárias • Dicas de compras • Lançamentos • Promoções relâmpago
            </p>
          </div>
        </div>

        {/* DISCLAIMER LEGAL */}
        <div className="disclaimer">
          <strong>📋 Informações Legais:</strong><br/><br/>
          • Este é um site de DIVULGAÇÃO de ofertas e produtos<br/>
          • NÃO vendemos produtos físicos ou digitais<br/>
          • NÃO temos lojas físicas<br/>
          • NÃO somos marketplace ou e-commerce<br/>
          • Todos os links direcionam para plataformas oficiais (Amazon, Mercado Livre)<br/>
          • Sua compra é realizada diretamente na plataforma oficial<br/>
          • Você conta com todas as garantias e políticas das lojas oficiais
        </div>

        {/* DIFERENCIAÇÃO */}
        <div className="info-section">
          <h2>⚠️ Não Confunda</h2>
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <p style={{ margin: '0 0 1rem 0' }}>
              <strong>NÃO SOMOS:</strong>
            </p>
            <ul style={{ margin: 0 }}>
              <li>A loja física "Busca Busca" do Shopping Plaza Polo (Brás, SP)</li>
              <li>O perfil @buscabuscaoficial do Instagram</li>
              <li>Uma loja de varejo online ou física</li>
              <li>Um marketplace ou e-commerce</li>
            </ul>
            <p style={{ margin: '1.5rem 0 0 0' }}>
              <strong>SOMOS:</strong>
            </p>
            <ul style={{ margin: 0 }}>
              <li>Um site de divulgação de ofertas</li>
              <li>Um guia de produtos Amazon e Mercado Livre</li>
              <li>Um serviço GRATUITO para consumidores</li>
            </ul>
          </div>
        </div>

        {/* SEGURANÇA */}
        <div className="info-section">
          <h2>🔒 Segurança e Confiança</h2>
          <p>
            <strong>Todos os nossos links direcionam para plataformas 100% seguras:</strong>
          </p>
          <ul>
            <li>Amazon.com.br - Loja oficial da Amazon no Brasil</li>
            <li>MercadoLivre.com.br - Marketplace oficial do Mercado Livre</li>
          </ul>
          <p>
            Ao clicar em nossos links, você é direcionado para as lojas oficiais onde sua compra
            é processada com total segurança. Não armazenamos dados de pagamento nem processamos transações.
          </p>
        </div>

        {/* CONTATO */}
        <div className="contact-box">
          <h2 style={{ marginTop: 0 }}>📧 Contato</h2>
          <p>
            Site de divulgação de ofertas e produtos Amazon e Mercado Livre
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Email:</strong> contato@buscabuscabrasil.com.br<br/>
            <strong>Site:</strong> https://www.buscabuscabrasil.com.br<br/>
            <strong>Instagram:</strong> @buscabuscabr
          </p>
        </div>
      </div>

      {/* Footer Global com Avisos SEO */}
      <Footer />
    </div>
  );
};

export default About;
