import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import Footer from '../components/Footer';

/**
 * Página FAQ - Perguntas Frequentes
 * Responde dúvidas comuns e diferencia de lojas físicas
 */
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "O que é o BuscaBusca Brasil?",
      answer: "O BuscaBusca Brasil é uma PLATAFORMA DE TECNOLOGIA para gestão e otimização de links de afiliados. Somos um serviço de software (SaaS) para profissionais de marketing digital, influenciadores e criadores de conteúdo que trabalham com programas de afiliados da Amazon, Mercado Livre e outras plataformas."
    },
    {
      question: "Vocês são a loja física 'Busca Busca' do Shopping Plaza Polo (Brás)?",
      answer: "NÃO! Não temos nenhuma relação com a loja física 'Busca Busca' localizada no Shopping Plaza Polo no Brás, São Paulo. Somos uma empresa de tecnologia totalmente diferente e independente. Não temos lojas físicas em nenhum lugar do Brasil."
    },
    {
      question: "Vocês vendem produtos?",
      answer: "NÃO vendemos produtos. Somos uma plataforma de TECNOLOGIA que gera links otimizados para afiliados. Quando você clica em um link gerado por nós, é redirecionado para a plataforma oficial (Amazon, Mercado Livre, etc.) onde a compra é realizada."
    },
    {
      question: "Vocês são um marketplace ou e-commerce?",
      answer: "NÃO. Não somos marketplace nem e-commerce. Somos uma FERRAMENTA DE SOFTWARE para gestão de links de afiliados. Não vendemos nada, não processamos pagamentos e não entregamos produtos."
    },
    {
      question: "Como funciona o serviço?",
      answer: "1) Você cola o link de um produto (Amazon, Mercado Livre, etc.) com sua tag de afiliado. 2) Nosso sistema otimiza e gera um link curto rastreável. 3) Você compartilha esse link nas suas redes sociais. 4) Quando alguém clica, é redirecionado para o produto com SUA tag de afiliado preservada. 5) Você recebe suas comissões normalmente através do programa de afiliados oficial."
    },
    {
      question: "Para quem é este serviço?",
      answer: "Para afiliados da Amazon Associates, parceiros do Mercado Livre, influenciadores digitais, criadores de conteúdo, profissionais de marketing digital e blogueiros que trabalham com links de afiliados."
    },
    {
      question: "O serviço é gratuito?",
      answer: "Sim, atualmente o serviço básico de gestão de links de afiliados é gratuito."
    },
    {
      question: "Vocês têm relação com @buscabuscaoficial no Instagram?",
      answer: "NÃO. Não temos relação com esse perfil ou qualquer outro perfil de loja física. Nosso Instagram oficial é @buscabuscabr, focado em tecnologia e ferramentas para afiliados."
    },
    {
      question: "Como vocês ganham dinheiro se não vendem produtos?",
      answer: "Somos uma plataforma de tecnologia. Nosso modelo de negócio é baseado em serviços de software (SaaS) para afiliados profissionais. Não ganhamos dinheiro vendendo produtos físicos."
    },
    {
      question: "Posso confiar nos links gerados?",
      answer: "Sim! Todos os links redirecionam para plataformas oficiais (Amazon.com.br, MercadoLivre.com.br, etc.). Preservamos suas tags de afiliado e parâmetros de comissão. Você pode verificar o destino final antes de compartilhar."
    },
    {
      question: "Vocês roubam comissões de afiliados?",
      answer: "JAMAIS! Nossa tecnologia foi desenvolvida especificamente para PROTEGER suas comissões. Preservamos todas as suas tags de afiliado e parâmetros. O Link Enhancer V2 garante que suas comissões sejam mantidas."
    },
    {
      question: "Como posso ter certeza que vocês não são uma loja física?",
      answer: "Verifique nosso site (www.buscabuscabrasil.com.br), nossa página Sobre (/sobre), nosso robots.txt, sitemap.xml e humans.txt. Todos os nossos canais oficiais deixam claro que somos uma PLATAFORMA DE TECNOLOGIA, não uma loja. Além disso, não temos CNPJ de comércio varejista."
    },
    {
      question: "Qual a diferença entre vocês e a loja 'Busca Busca' do Brás?",
      answer: "São empresas COMPLETAMENTE DIFERENTES: 1) Eles: Loja física de varejo / Nós: Plataforma de tecnologia web. 2) Eles: Vendem produtos / Nós: Fornecemos software. 3) Eles: @buscabuscaoficial / Nós: @buscabuscabr. 4) Eles: Shopping Plaza Polo (Brás, SP) / Nós: Serviço online sem loja física."
    },
    {
      question: "Como faço para usar o serviço?",
      answer: "Acesse www.buscabuscabrasil.com.br/admin, faça login com Google, cole o link do produto com sua tag de afiliado, e nosso sistema gera automaticamente um link otimizado para você compartilhar."
    },
    {
      question: "Preciso de conhecimento técnico para usar?",
      answer: "Não! Nossa plataforma foi desenvolvida para ser simples e intuitiva. Basta colar o link, e o sistema faz todo o trabalho de otimização automaticamente."
    },
    {
      question: "Vocês oferecem suporte?",
      answer: "Sim! Entre em contato através do email contato@buscabuscabrasil.com.br para dúvidas sobre a plataforma de tecnologia e gestão de links."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)' }}>
      <style>{`
        .faq-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        .faq-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .faq-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .faq-header p {
          font-size: 1.1rem;
          color: var(--text-secondary);
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
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        .warning-box h3 {
          margin: 0 0 0.5rem 0;
        }
        .faq-list {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .faq-item {
          border-bottom: 1px solid #e9ecef;
          padding: 1.5rem 0;
        }
        .faq-item:last-child {
          border-bottom: none;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          user-select: none;
        }
        .faq-question:hover {
          color: var(--accent-color);
        }
        .faq-answer {
          margin-top: 1rem;
          padding-left: 1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 1rem;
          border-left: 3px solid var(--accent-color);
        }
        .faq-icon {
          color: var(--accent-color);
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .faq-container {
            padding: 1rem;
          }
          .faq-header h1 {
            font-size: 2rem;
          }
          .faq-list {
            padding: 1rem;
          }
          .faq-question {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="faq-container">
        {/* AVISO DESTACADO */}
        <div className="warning-box">
          <FiAlertCircle size={28} style={{ flexShrink: 0, marginTop: '4px' }} />
          <div>
            <h3>⚠️ LEIA ANTES DE PROSSEGUIR</h3>
            <p style={{ margin: 0 }}>
              <strong>NÃO SOMOS UMA LOJA!</strong> Somos uma plataforma de tecnologia para afiliados.
              Não vendemos produtos e não temos lojas físicas.
            </p>
          </div>
        </div>

        {/* HEADER */}
        <div className="faq-header">
          <h1>❓ Perguntas Frequentes</h1>
          <p>Tire suas dúvidas sobre o BuscaBusca Brasil</p>
        </div>

        {/* LISTA DE FAQs */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                <span className="faq-icon">
                  {openIndex === index ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                </span>
              </div>
              {openIndex === index && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Ainda tem dúvidas?</h2>
          <p>Entre em contato conosco através do email:</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 0 }}>
            contato@buscabuscabrasil.com.br
          </p>
        </div>
      </div>

      {/* Footer Global */}
      <Footer />
    </div>
  );
};

export default FAQ;
