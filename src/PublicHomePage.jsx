import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiInstagram, FiLock } from 'react-icons/fi';
import { FaAmazon } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';
import Footer from './components/Footer';

/**
 * 🏠 HOMEPAGE PÚBLICA - BuscaBuscaBrasil
 * Landing page profissional com Instagram + Produtos Amazon
 */
const PublicHomePage = () => {
  const navigate = useNavigate();

  // SEO - Atualizar meta tags
  React.useEffect(() => {
    document.title = 'BuscaBuscaBrasil - Melhores Ofertas da Amazon e Mercado Livre';

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Encontre as melhores ofertas da Amazon e Mercado Livre com descontos de até 45%. Produtos selecionados diariamente pela nossa equipe.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Encontre as melhores ofertas da Amazon e Mercado Livre com descontos de até 45%. Produtos selecionados diariamente pela nossa equipe.';
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
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🔍</span>
            <span style={styles.logoText}>BuscaBuscaBrasil</span>
          </div>

          <div style={styles.navActions}>
            <button
              onClick={() => navigate('/sobre')}
              style={styles.sobreBtn}
            >
              Sobre
            </button>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.instagramBtn}
            >
              <FiInstagram size={20} />
              <span>Siga no Instagram</span>
            </a>

            <button
              onClick={() => navigate('/admin')}
              style={styles.adminBtn}
              title="Acesso Restrito"
            >
              <FiLock size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Encontre as <span style={styles.highlight}>Melhores Ofertas</span> da Amazon
          </h1>
          <p style={styles.heroSubtitle}>
            Produtos selecionados diariamente pela nossa equipe com os maiores descontos
          </p>

          <div style={styles.heroButtons}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.ctaButton}
            >
              <FiInstagram size={20} />
              Siga no Instagram
            </a>

            <a
              href="https://www.amazon.com.br/?tag=buscabusca0f-20"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.secondaryButton}
            >
              <FaAmazon size={20} />
              Ver Amazon
            </a>

            <a
              href="https://www.mercadolivre.com.br/?matt_word=wa20250726131129&matt_tool=88344921"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.secondaryButton}
            >
              <SiMercadopago size={20} />
              Ver Mercado Livre
            </a>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section style={styles.productsSection}>
        <div style={styles.comingSoonBox}>
          <div style={styles.comingSoonIcon}>🚀</div>
          <h2 style={styles.comingSoonTitle}>Ofertas em Breve</h2>
          <p style={styles.comingSoonText}>
            Estamos preparando as melhores ofertas da Amazon e Mercado Livre para você.
            <br />
            Acompanhe no Instagram para não perder nenhuma promoção!
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.comingSoonButton}
          >
            <FiInstagram size={20} style={{ marginRight: '8px' }} />
            Seguir @buscabuscabr
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            📱 Receba ofertas exclusivas no Instagram
          </h2>
          <p style={styles.ctaText}>
            Siga @buscabuscabrasil e fique por dentro das melhores promoções em tempo real
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.ctaButton}
          >
            <FiInstagram size={20} />
            Seguir Agora
          </a>
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Navbar
  navbar: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
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
    color: '#667eea',
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
    gap: '15px',
  },
  sobreBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  instagramBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.2s ease',
  },

  // Hero Section
  hero: {
    padding: '80px 20px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  highlight: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: '#718096',
    marginBottom: '40px',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 30px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Products Section
  productsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
  },
  comingSoonBox: {
    background: 'white',
    borderRadius: '24px',
    padding: '80px 40px',
    textAlign: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  comingSoonIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  comingSoonTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '20px',
  },
  comingSoonText: {
    fontSize: '18px',
    color: '#718096',
    lineHeight: '1.6',
    marginBottom: '30px',
    maxWidth: '600px',
    margin: '0 auto 30px',
  },
  comingSoonButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '10px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: '#718096',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
  },
  productCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  productImageWrapper: {
    position: 'relative',
    paddingTop: '100%',
    background: '#f9f9f9',
    overflow: 'hidden',
  },
  productImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '20px',
  },
  discountBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  productInfo: {
    padding: '20px',
  },
  productCategory: {
    fontSize: '12px',
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  productTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '12px',
    minHeight: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  productPrice: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: '15px',
  },
  productButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #FF9900 0%, #FFB84D 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },

  // CTA Section
  ctaSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '60px 20px',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '15px',
  },
  ctaText: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '30px',
  },

  // Footer
  footer: {
    background: '#2d3748',
    color: 'white',
    padding: '40px 20px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  footerLinks: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  footerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
  footerCopy: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
};

export default PublicHomePage;
