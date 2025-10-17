import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';
import Footer from '../components/Footer';

/**
 * Página FAQ - Perguntas Frequentes
 * Respondendo dúvidas de consumidores sobre o site de ofertas
 */
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "O que é o BuscaBuscaBrasil?",
      answer: "O BuscaBuscaBrasil é um site de divulgação de ofertas e produtos selecionados da Amazon e Mercado Livre. Ajudamos consumidores brasileiros a encontrar os melhores produtos com os melhores preços, direcionando para as plataformas oficiais."
    },
    {
      question: "Vocês vendem produtos?",
      answer: "NÃO vendemos produtos. Somos um site de divulgação de ofertas. Quando você clica em um link de produto, é direcionado para a Amazon ou Mercado Livre (plataformas oficiais) onde a compra é realizada de forma 100% segura."
    },
    {
      question: "Por que o site está 'em desenvolvimento'?",
      answer: "Nosso catálogo completo está sendo preparado. Estamos aguardando a liberação da API oficial da Amazon (Product Advertising API) para exibir produtos com informações atualizadas em tempo real, preços oficiais e avaliações de clientes. Optamos por não usar métodos inadequados (como scraping) para garantir conformidade com as políticas da Amazon."
    },
    {
      question: "Como acompanhar as ofertas enquanto o site está em desenvolvimento?",
      answer: "Publicamos diariamente ofertas selecionadas no Instagram @buscabuscabr. Lá você encontra produtos, dicas de compras, lançamentos e promoções relâmpago."
    },
    {
      question: "Vocês são a loja física 'Busca Busca' do Shopping Plaza Polo (Brás)?",
      answer: "NÃO! Não temos nenhuma relação com a loja física 'Busca Busca' localizada no Shopping Plaza Polo no Brás, São Paulo. Somos um site de divulgação de ofertas, totalmente diferente e independente. Não temos lojas físicas em nenhum lugar do Brasil."
    },
    {
      question: "Vocês são um marketplace ou e-commerce?",
      answer: "NÃO. Não somos marketplace nem e-commerce. Somos um site de divulgação de ofertas. Não vendemos nada, não processamos pagamentos e não entregamos produtos. Apenas direcionamos você para as plataformas oficiais onde a compra é realizada."
    },
    {
      question: "Como funciona o processo de compra?",
      answer: "1) Você encontra um produto em nosso site ou Instagram. 2) Clica no link do produto. 3) É direcionado para a Amazon ou Mercado Livre (loja oficial). 4) Realiza sua compra diretamente na plataforma oficial. 5) Recebe todas as garantias e benefícios das lojas oficiais."
    },
    {
      question: "É seguro comprar através dos links do BuscaBuscaBrasil?",
      answer: "SIM! Todos os nossos links direcionam para plataformas 100% seguras: Amazon.com.br e MercadoLivre.com.br. Sua compra é processada diretamente nas lojas oficiais. Não armazenamos dados de pagamento nem processamos transações."
    },
    {
      question: "Preciso pagar algo para usar o BuscaBuscaBrasil?",
      answer: "NÃO! Nosso serviço é 100% GRATUITO para consumidores. Você não paga nada para acessar nossas ofertas e links."
    },
    {
      question: "Vocês têm relação com @buscabuscaoficial no Instagram?",
      answer: "NÃO. Não temos relação com esse perfil ou qualquer outro perfil de loja física. Nosso Instagram oficial é @buscabuscabr, focado em divulgação de ofertas e produtos da Amazon e Mercado Livre."
    },
    {
      question: "O que vou encontrar no site após o catálogo ficar pronto?",
      answer: "Após a liberação da API da Amazon, você encontrará: ofertas do dia com os melhores descontos, produtos com avaliações e reviews oficiais, comparação de preços entre Amazon e Mercado Livre, categorias diversas (eletrônicos, casa, moda, livros, etc.), informações atualizadas em tempo real e especificações técnicas completas."
    },
    {
      question: "Como vocês selecionam os produtos?",
      answer: "Selecionamos produtos com base em popularidade, avaliações positivas, custo-benefício e descontos interessantes. Priorizamos produtos com boas avaliações na Amazon e Mercado Livre."
    },
    {
      question: "Posso confiar nos preços mostrados?",
      answer: "Quando nosso catálogo estiver ativo (após liberação da API), todos os preços virão diretamente da API oficial da Amazon em tempo real. Atualmente, no Instagram, sempre direcionamos para a página oficial do produto onde você verifica o preço atualizado."
    },
    {
      question: "Vocês garantem o preço ou a disponibilidade dos produtos?",
      answer: "NÃO. Os preços e disponibilidade são de responsabilidade da Amazon e Mercado Livre. Sempre verifique o preço final e disponibilidade na página oficial do produto antes de finalizar a compra."
    },
    {
      question: "Se eu tiver um problema com minha compra, quem devo contatar?",
      answer: "Você deve contatar diretamente a plataforma onde realizou a compra (Amazon ou Mercado Livre). Todas as políticas de devolução, garantia e atendimento ao cliente são de responsabilidade das lojas oficiais."
    },
    {
      question: "Como posso ter certeza que vocês não são uma loja física?",
      answer: "Verifique nosso site (www.buscabuscabrasil.com.br), nossa página Sobre (/sobre) e nosso FAQ (/faq). Todos os nossos canais oficiais deixam claro que somos um SITE DE DIVULGAÇÃO DE OFERTAS, não uma loja física ou marketplace."
    },
    {
      question: "Qual a diferença entre vocês e a loja 'Busca Busca' do Brás?",
      answer: "São empresas COMPLETAMENTE DIFERENTES: 1) Eles: Loja física de varejo / Nós: Site de divulgação de ofertas. 2) Eles: Vendem produtos / Nós: Direcionamos para Amazon/ML. 3) Eles: @buscabuscaoficial / Nós: @buscabuscabr. 4) Eles: Shopping Plaza Polo (Brás, SP) / Nós: Serviço online sem loja física."
    },
    {
      question: "Vocês têm aplicativo mobile?",
      answer: "Atualmente não temos aplicativo. Você pode acessar nosso site pelo navegador do celular ou acompanhar nossas ofertas no Instagram @buscabuscabr."
    },
    {
      question: "Posso sugerir produtos para serem divulgados?",
      answer: "Sim! Entre em contato através do email contato@buscabuscabrasil.com.br com suas sugestões de produtos ou categorias que você gostaria de ver em nossas ofertas."
    },
    {
      question: "Como faço para não perder nenhuma oferta?",
      answer: "Siga nosso Instagram @buscabuscabr onde publicamos ofertas diariamente. Também recomendamos ativar as notificações de posts para receber alertas em tempo real."
    },
    {
      question: "Vocês trabalham com outras plataformas além de Amazon e Mercado Livre?",
      answer: "Atualmente focamos em Amazon e Mercado Livre, as maiores plataformas de e-commerce do Brasil. No futuro, podemos expandir para outras plataformas confiáveis."
    },
    {
      question: "Por que devo usar o BuscaBuscaBrasil ao invés de ir direto para a Amazon?",
      answer: "Fazemos a curadoria de produtos e ofertas para você economizar tempo. Ao invés de procurar entre milhões de produtos, apresentamos uma seleção com os melhores descontos e produtos bem avaliados."
    },
    {
      question: "Quando o catálogo completo estará disponível?",
      answer: "O catálogo estará disponível assim que recebermos a liberação da API oficial da Amazon (Product Advertising API). Estamos aguardando a aprovação da terceira compra para acesso completo à API. Enquanto isso, acompanhe nossas ofertas no Instagram @buscabuscabr."
    },
    {
      question: "Vocês oferecem cupons de desconto?",
      answer: "Divulgamos ofertas e produtos com descontos já aplicados. Quando houver cupons promocionais disponibilizados pela Amazon ou Mercado Livre, compartilhamos em nossas redes sociais."
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
              <strong>NÃO SOMOS UMA LOJA!</strong> Somos um site de divulgação de ofertas.
              Não vendemos produtos e não temos lojas físicas. Direcionamos para Amazon e Mercado Livre oficiais.
            </p>
          </div>
        </div>

        {/* HEADER */}
        <div className="faq-header">
          <h1>❓ Perguntas Frequentes</h1>
          <p>Tire suas dúvidas sobre o BuscaBuscaBrasil</p>
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
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            contato@buscabuscabrasil.com.br
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: 0 }}>
            Ou acompanhe nossas ofertas no Instagram <strong>@buscabuscabr</strong>
          </p>
        </div>
      </div>

      {/* Footer Global */}
      <Footer />
    </div>
  );
};

export default FAQ;
