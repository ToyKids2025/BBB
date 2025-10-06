import React from 'react';
import { FiLink, FiShield, FiTarget, FiZap, FiAlertCircle } from 'react-icons/fi';
import Footer from '../components/Footer';

/**
 * Página SOBRE NÓS
 * Explica claramente o que é o serviço e diferencia de outras empresas
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
            Somos um serviço de tecnologia independente especializado em links inteligentes de afiliados.
            Não temos relação com @buscabuscaoficial ou qualquer estabelecimento físico.
          </p>
        </div>
      </div>

      <div className="about-container">
        {/* CABEÇALHO */}
        <div className="about-header">
          <h1>🚀 BuscaBusca Brasil</h1>
          <p>
            Plataforma Profissional de Gestão de Links de Afiliados para Marketing Digital
          </p>
        </div>

        {/* QUEM SOMOS */}
        <div className="info-section">
          <h2><FiTarget /> Quem Somos</h2>
          <p>
            O <strong>BuscaBusca Brasil</strong> é uma plataforma tecnológica especializada em
            otimização e gestão de links de afiliados. Desenvolvemos ferramentas para
            profissionais de marketing digital, influenciadores e criadores de conteúdo
            que trabalham com programas de afiliados da Amazon, Mercado Livre e outras plataformas.
          </p>
        </div>

        {/* O QUE FAZEMOS */}
        <div className="info-section">
          <h2><FiZap /> O Que Fazemos</h2>
          <ul>
            <li>Geramos links encurtados e rastreáveis para produtos de afiliados</li>
            <li>Otimizamos URLs mantendo todos os parâmetros de comissão</li>
            <li>Fornecemos analytics e monitoramento de cliques</li>
            <li>Garantimos que suas tags de afiliado sejam preservadas</li>
            <li>Oferecemos ferramentas profissionais para gestão de campanhas</li>
          </ul>
        </div>

        {/* NOSSOS SERVIÇOS */}
        <div className="feature-grid">
          <div className="feature-card">
            <h3><FiLink size={24} /> Link Enhancer</h3>
            <p>
              Sistema avançado que preserva e otimiza seus parâmetros de afiliado,
              garantindo que você receba suas comissões corretamente.
            </p>
          </div>

          <div className="feature-card">
            <h3><FiShield size={24} /> Proteção de Comissão</h3>
            <p>
              Tecnologia que garante a atribuição correta das vendas,
              protegendo suas comissões de afiliado.
            </p>
          </div>

          <div className="feature-card">
            <h3><FiTarget size={24} /> Analytics Profissional</h3>
            <p>
              Dashboard completo com métricas de cliques, conversões
              e performance de suas campanhas.
            </p>
          </div>

          <div className="feature-card">
            <h3><FiZap size={24} /> Redirects Instantâneos</h3>
            <p>
              Sistema otimizado com redirects ultra-rápidos (100ms)
              para melhor experiência do usuário.
            </p>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="info-section">
          <h2>🔧 Como Funciona</h2>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Você cola o link do produto (Amazon, Mercado Livre, etc.) com sua tag de afiliado
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Nosso sistema otimiza e gera um link curto rastreável
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Você compartilha o link encurtado nas suas redes sociais
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Quando alguém clica, é redirecionado para o produto com SUA tag de afiliado
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Você recebe suas comissões normalmente através do programa de afiliados
            </li>
          </ol>
        </div>

        {/* PÚBLICO-ALVO */}
        <div className="info-section">
          <h2>👥 Para Quem é Este Serviço</h2>
          <ul>
            <li>Afiliados da Amazon Associates</li>
            <li>Parceiros do Mercado Livre</li>
            <li>Influenciadores digitais</li>
            <li>Criadores de conteúdo</li>
            <li>Profissionais de marketing digital</li>
            <li>Blogueiros e produtores de conteúdo</li>
          </ul>
        </div>

        {/* DISCLAIMER LEGAL */}
        <div className="disclaimer">
          <strong>📋 Informações Legais:</strong><br/><br/>
          • Este é um serviço de TECNOLOGIA para gestão de links de afiliados<br/>
          • NÃO vendemos produtos físicos ou digitais<br/>
          • NÃO temos lojas físicas<br/>
          • NÃO somos marketplace<br/>
          • Redirecionamos para plataformas oficiais (Amazon, Mercado Livre, etc.)<br/>
          • Sua compra é realizada diretamente na plataforma oficial<br/>
          • Suas comissões são pagas pelo programa de afiliados oficial
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
              <li>Uma plataforma de TECNOLOGIA para afiliados</li>
              <li>Um serviço de gestão e otimização de links</li>
              <li>Uma ferramenta profissional para marketing digital</li>
            </ul>
          </div>
        </div>

        {/* TECNOLOGIA */}
        <div className="info-section">
          <h2>💻 Tecnologia</h2>
          <p>
            Desenvolvido com as mais modernas tecnologias web:
          </p>
          <ul>
            <li>React.js para interface responsiva</li>
            <li>Firebase para infraestrutura confiável</li>
            <li>Vercel para deploy instantâneo</li>
            <li>Sistema de cache avançado</li>
            <li>Analytics em tempo real</li>
            <li>Segurança SSL/HTTPS</li>
          </ul>
        </div>

        {/* CONTATO */}
        <div className="contact-box">
          <h2 style={{ marginTop: 0 }}>📧 Contato</h2>
          <p>
            Este é um projeto de tecnologia para gestão de links de afiliados.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Email:</strong> contato@buscabuscabrasil.com.br<br/>
            <strong>Site:</strong> https://www.buscabuscabrasil.com.br
          </p>
        </div>
      </div>

      </div>

      {/* Footer Global com Avisos SEO */}
      <Footer />
    </div>
  );
};

export default About;
