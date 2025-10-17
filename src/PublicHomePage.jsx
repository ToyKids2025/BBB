import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInstagram, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FaAmazon } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';
import Footer from './components/Footer';

/**
 * 🏠 HOMEPAGE PÚBLICA - BuscaBuscaBrasil
 * Catálogo de Ofertas Amazon e Mercado Livre
 */
const PublicHomePage = () => {
  const navigate = useNavigate();

  // SEO - Atualizar meta tags
  React.useEffect(() => {
    document.title = 'BuscaBuscaBrasil - Melhores Ofertas Amazon e Mercado Livre';

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Encontre as melhores ofertas da Amazon e Mercado Livre. Produtos selecionados com os melhores preços. Acompanhe ofertas exclusivas no Instagram @buscabuscabr');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Encontre as melhores ofertas da Amazon e Mercado Livre. Produtos selecionados com os melhores preços. Acompanhe ofertas exclusivas no Instagram @buscabuscabr';
      document.head.appendChild(meta);
    }

    // Cleanup ao desmontar
    return () => {
      document.title = 'BuscaBuscaBrasil';
    };
  }, []);

  // Instagram do projeto
  const INSTAGRAM_URL = 'https://www.instagram.com/buscabuscabr/';

  return (
    <div style={styles.container} className="public-homepage">
      {/* Navbar */}
      <nav style={styles.navbar} className="navbar">
        <div style={styles.navContent} className="nav-content">
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🔍</span>
            <span style={styles.logoText}>BuscaBuscaBrasil</span>
          </div>

          <div style={styles.navActions} className="nav-actions">
            <button
              onClick={() => navigate('/sobre')}
              style={styles.sobreBtn}
            >
              Sobre
            </button>

            <button
              onClick={() => navigate('/faq')}
              style={styles.faqBtn}
            >
              FAQ
            </button>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.instagramBtn}
            >
              <FiInstagram size={20} />
              <span>Instagram</span>
            </a>

            <button
              onClick={() => navigate('/admin')}
              style={styles.adminBtn}
              title="Acesso Restrito"
              aria-label="Acesso Restrito à Área Administrativa"
            >
              <FiLock size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle} className="hero-title">
            Encontre as <span style={styles.highlight}>Melhores Ofertas</span>
          </h1>
          <p style={styles.heroSubtitle} className="hero-subtitle">
            Produtos selecionados da Amazon e Mercado Livre com os melhores preços e descontos
          </p>

          <div style={styles.heroButtons} className="hero-buttons">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.ctaButton}
            >
              <FiInstagram size={20} />
              Ver Ofertas no Instagram
            </a>

            <a
              href="https://www.amazon.com.br/?tag=buscabusca0f-20"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.secondaryButton}
            >
              <FaAmazon size={20} />
              Ir para Amazon
            </a>

            <a
              href="https://www.mercadolivre.com.br/?matt_word=wa20250726131129&matt_tool=88344921"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.secondaryButton}
            >
              <SiMercadopago size={20} />
              Ir para Mercado Livre
            </a>
          </div>
        </div>
      </section>

      {/* Banner: Site em Desenvolvimento */}
      <section style={styles.developmentBanner}>
        <div style={styles.developmentContent}>
          <div style={styles.developmentIcon}>
            <FiAlertCircle size={40} />
          </div>
          <div style={styles.developmentText}>
            <h2 style={styles.developmentTitle}>🚧 Site em Desenvolvimento</h2>
            <p style={styles.developmentDescription}>
              Nosso catálogo completo de produtos está sendo preparado.
              Estamos aguardando a <strong>liberação da API oficial da Amazon (Product Advertising API)</strong> para
              exibir produtos com informações atualizadas, preços em tempo real e avaliações oficiais.
            </p>
            <p style={styles.developmentDescription}>
              <strong>Por que aguardamos a API oficial?</strong><br />
              Optamos por não utilizar métodos inadequados (como scraping ou dados não oficiais) para
              garantir que todas as informações apresentadas sejam precisas, atualizadas e estejam em
              conformidade com as políticas da Amazon.
            </p>
            <div style={styles.developmentCta}>
              <p style={styles.developmentCtaText}>
                📱 <strong>Enquanto isso, acompanhe nossas ofertas diárias no Instagram:</strong>
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.developmentButton}
              >
                <FiInstagram size={20} style={{ marginRight: '8px' }} />
                Seguir @buscabuscabr
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* O Que Oferecemos (Futuro) */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresContent}>
          <h2 style={styles.featuresTitle}>O Que Você Vai Encontrar</h2>
          <p style={styles.featuresSubtitle}>
            Após a liberação da API, nosso catálogo incluirá:
          </p>

          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🏷️</div>
              <h3 style={styles.featureCardTitle}>Ofertas do Dia</h3>
              <p style={styles.featureCardText}>
                Produtos selecionados com os melhores descontos atualizados diariamente
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>⭐</div>
              <h3 style={styles.featureCardTitle}>Produtos Avaliados</h3>
              <p style={styles.featureCardText}>
                Avaliações e reviews oficiais da Amazon para ajudar na sua escolha
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💰</div>
              <h3 style={styles.featureCardTitle}>Melhores Preços</h3>
              <p style={styles.featureCardText}>
                Comparação de preços e histórico para você encontrar as melhores ofertas
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h3 style={styles.featureCardTitle}>Categorias Diversas</h3>
              <p style={styles.featureCardText}>
                Eletrônicos, casa, moda, livros e muito mais em um só lugar
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔔</div>
              <h3 style={styles.featureCardTitle}>Alertas de Ofertas</h3>
              <p style={styles.featureCardText}>
                Acompanhe pelo Instagram ofertas especiais e relâmpago
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={styles.featureCardTitle}>Informações Oficiais</h3>
              <p style={styles.featureCardText}>
                Todos os dados vindos diretamente da API oficial da Amazon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section style={styles.instagramSection}>
        <div style={styles.instagramContent}>
          <h2 style={styles.instagramTitle}>
            📱 Siga no Instagram para Ofertas Diárias
          </h2>
          <p style={styles.instagramText}>
            Enquanto nosso catálogo está em desenvolvimento, publicamos diariamente
            ofertas selecionadas da Amazon e Mercado Livre no Instagram.
          </p>
          <p style={styles.instagramText}>
            <strong>@buscabuscabr</strong> - Ofertas, dicas e lançamentos
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.instagramButton}
          >
            <FiInstagram size={24} />
            Seguir Agora
          </a>
        </div>
      </section>

      {/* CTA Final Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            🛍️ Compre com Confiança
          </h2>
          <p style={styles.ctaText}>
            Todos os links direcionam para as plataformas oficiais Amazon e Mercado Livre.
            Sua compra é 100% segura e você conta com todas as garantias e políticas de devolução das lojas oficiais.
          </p>
          <p style={styles.ctaText}>
            <strong>NÃO somos loja física.</strong> Somos um site de divulgação de ofertas.
            Não vendemos produtos diretamente.
          </p>
        </div>
      </section>

      {/* Footer Global com Avisos SEO */}
      <Footer />
    </div>
  );
};

// Estilos inline (melhor performance para landing page)
const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Navbar
  navbar: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-neon)',
    border: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '20px',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sobreBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: 'var(--neon-cyan)',
    border: '2px solid var(--neon-cyan)',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textShadow: '0 0 10px var(--neon-cyan)',
    minHeight: '44px',
  },
  faqBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: 'var(--neon-cyan)',
    border: '2px solid var(--neon-cyan)',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textShadow: '0 0 10px var(--neon-cyan)',
    minHeight: '44px',
  },
  instagramBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'var(--accent-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    boxShadow: 'var(--shadow-neon)',
    minHeight: '44px',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    width: '48px',
    height: '48px',
    background: 'rgba(176, 38, 255, 0.1)',
    border: '2px solid var(--neon-cyan)',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'var(--neon-cyan)',
    transition: 'all 0.2s ease',
    fontSize: '20px',
  },

  // Hero Section
  hero: {
    padding: '80px 20px 60px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  highlight: {
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: 'var(--glow-cyan)',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  heroButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 30px',
    background: 'var(--accent-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    boxShadow: 'var(--shadow-neon)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 30px',
    background: 'transparent',
    color: 'var(--neon-cyan)',
    border: '2px solid var(--neon-cyan)',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textShadow: '0 0 10px var(--neon-cyan)',
  },

  // Development Banner
  developmentBanner: {
    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
    borderTop: '3px solid #FFC107',
    borderBottom: '3px solid #FFC107',
    padding: '40px 20px',
    margin: '40px 0',
  },
  developmentContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
  },
  developmentIcon: {
    color: '#FFC107',
    flexShrink: 0,
    marginTop: '5px',
  },
  developmentText: {
    flex: 1,
  },
  developmentTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '15px',
    marginTop: 0,
  },
  developmentDescription: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: '1.8',
    marginBottom: '15px',
  },
  developmentCta: {
    marginTop: '25px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    border: '2px dashed #FFC107',
  },
  developmentCtaText: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    marginBottom: '15px',
  },
  developmentButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'var(--accent-gradient)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'transform 0.3s ease',
    boxShadow: 'var(--shadow-neon)',
  },

  // Features Section
  featuresSection: {
    padding: '60px 20px',
    background: 'var(--bg-card)',
  },
  featuresContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featuresTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    color: 'var(--text-primary)',
    marginBottom: '15px',
  },
  featuresSubtitle: {
    fontSize: '18px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginBottom: '50px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    background: 'var(--bg-primary)',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  featureCardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '10px',
  },
  featureCardText: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },

  // Instagram Section
  instagramSection: {
    background: 'var(--accent-gradient)',
    padding: '60px 20px',
    textAlign: 'center',
  },
  instagramContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  instagramTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '20px',
  },
  instagramText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: '15px',
    lineHeight: '1.6',
  },
  instagramButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },

  // CTA Section
  ctaSection: {
    padding: '60px 20px',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border-color)',
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  },
  ctaText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: '1.8',
    marginBottom: '15px',
  },
};

// Injetar estilos de media query no head (necessário para estilos inline)
if (typeof window !== 'undefined') {
  const mediaQueryStyles = `
    @media (max-width: 768px) {
      .public-homepage .nav-content {
        flex-direction: column !important;
        gap: 15px !important;
        padding: 15px !important;
      }
      .public-homepage .nav-actions {
        width: 100% !important;
        justify-content: center !important;
        flex-wrap: wrap !important;
      }
      .public-homepage .hero-title {
        font-size: 32px !important;
        line-height: 1.3 !important;
      }
      .public-homepage .hero-subtitle {
        font-size: 16px !important;
      }
      .public-homepage .hero-buttons {
        flex-direction: column !important;
        width: 100% !important;
      }
      .public-homepage .hero-buttons > * {
        width: 100% !important;
        justify-content: center !important;
      }
      .public-homepage .navbar {
        position: sticky !important;
      }
      /* Prevenir overflow horizontal */
      .public-homepage {
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }
      .public-homepage * {
        max-width: 100% !important;
      }
      /* Safe area para iPhone */
      @supports (padding: env(safe-area-inset-top)) {
        .public-homepage .navbar {
          padding-top: max(20px, env(safe-area-inset-top)) !important;
        }
      }
    }
  `;

  // Verificar se o estilo já foi injetado
  if (!document.getElementById('public-homepage-mobile-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'public-homepage-mobile-styles';
    styleTag.textContent = mediaQueryStyles;
    document.head.appendChild(styleTag);
  }
}

export default PublicHomePage;
