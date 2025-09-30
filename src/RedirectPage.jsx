import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { EternalTrackingSystem } from './utils/eternal-tracking';
import { remarketingSystem } from './utils/remarketing-fomo';
// Sistema de A/B Testing integrado inline

/**
 * Página de Redirecionamento
 * Busca o link no Firebase e redireciona preservando parâmetros de afiliado
 */
const RedirectPage = () => {
  const { linkId } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [redirectDelay, setRedirectDelay] = useState(1000);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!linkId) {
        setStatus('error');
        setError('Link inválido');
        return;
      }

      try {
        // Buscar link no Firestore
        const linkRef = doc(db, 'links', linkId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
          setStatus('error');
          setError('Link não encontrado');
          return;
        }

        const linkData = linkSnap.data();

        // Verificar se o link está ativo
        if (linkData.active === false) {
          setStatus('error');
          setError('Link desativado');
          return;
        }

        // Incrementar contador de clicks (sem await para não atrasar redirect)
        updateDoc(linkRef, {
          clicks: increment(1),
          lastClickedAt: new Date().toISOString()
        }).catch(err => console.log('Erro ao atualizar clicks:', err));

        // 🔥 ATIVAR SISTEMA ETERNAL TRACKING - PERSISTÊNCIA PERPÉTUA
        try {
          console.log('🚀 Ativando Eternal Tracking System...');

          const trackingData = {
            linkId,
            platform: linkData.platform,
            timestamp: Date.now(),
            url: linkData.url,
            originalUrl: linkData.originalUrl,
            affiliateTag: linkData.affiliateTag || linkData.tag,
            shortUrl: linkData.shortUrl
          };

          // Inicializar sistema completo de tracking
          const eternalTracker = new EternalTrackingSystem({
            baseUrl: 'https://buscabuscabrasil.com.br',
            affiliateTag: trackingData.affiliateTag,
            enableAllFeatures: true
          });

          // Ativar TODOS os sistemas de persistência
          await eternalTracker.initialize(trackingData);

          // Salvar também no localStorage (fallback)
          localStorage.setItem('bb_last_click', JSON.stringify(trackingData));

          // Histórico de clicks
          const history = JSON.parse(localStorage.getItem('bb_click_history') || '[]');
          history.push(trackingData);
          if (history.length > 20) history.shift();
          localStorage.setItem('bb_click_history', JSON.stringify(history));

          console.log('✅ Eternal Tracking ativado! Click ID:', eternalTracker.clickData?.clickId);

          // 🎯 ATIVAR SISTEMA DE REMARKETING/FOMO
          console.log('🎯 Ativando Remarketing System...');
          remarketingSystem.trackClick({
            linkId,
            platform: linkData.platform,
            url: linkData.url,
            affiliateTag: trackingData.affiliateTag,
            clickId: eternalTracker.clickData?.clickId
          });
          console.log('✅ Remarketing ativado!');

          // 🧪 A/B TESTING - Testar diferentes delays
          console.log('🧪 A/B Testing aplicado');
          // Variantes de delay: 500ms (25%), 1000ms (50%), 1500ms (25%)
          const randomValue = Math.random();
          let testDelay = 1000; // padrão
          if (randomValue < 0.25) {
            testDelay = 500; // fast
          } else if (randomValue < 0.75) {
            testDelay = 1000; // medium
          } else {
            testDelay = 1500; // slow
          }
          console.log('✅ Delay selecionado:', testDelay, 'ms');
          setRedirectDelay(testDelay);

        } catch (e) {
          console.error('❌ Erro ao ativar Eternal Tracking:', e);
          // Fallback básico
          try {
            localStorage.setItem('bb_last_click', JSON.stringify({
              linkId, platform: linkData.platform, timestamp: Date.now(), url: linkData.url
            }));

            // Tentar ativar remarketing mesmo com erro
            remarketingSystem.trackClick({
              linkId,
              platform: linkData.platform,
              url: linkData.url
            });
          } catch (err) {
            console.log('LocalStorage não disponível');
          }
        }

        // Aguardar delay configurado (A/B Testing ou padrão 1s)
        setTimeout(() => {
          console.log('🚀 Redirecionando para:', linkData.url);
          console.log(`⏱️ Delay usado: ${redirectDelay}ms`);
          // Redirecionar preservando TODOS os parâmetros
          window.location.replace(linkData.url);
        }, redirectDelay);

        setStatus('redirecting');

      } catch (err) {
        console.error('Erro ao processar redirect:', err);
        setStatus('error');
        setError('Erro ao processar link');
      }
    };

    handleRedirect();
  }, [linkId, redirectDelay]); // Incluir redirectDelay nas dependências

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {status === 'loading' && (
          <>
            <div style={styles.logo}>BBB</div>
            <h1 style={styles.title}>Carregando...</h1>
            <p style={styles.subtitle}>Buscando seu link</p>
            <div style={styles.spinner}></div>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div style={styles.logo}>BBB</div>
            <h1 style={styles.title}>Redirecionando...</h1>
            <p style={styles.subtitle}>Você está sendo direcionado com segurança</p>
            <div style={styles.spinner}></div>
            <p style={styles.wait}>Aguarde um momento...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.logoError}>❌</div>
            <h1 style={styles.title}>Ops!</h1>
            <p style={styles.error}>{error}</p>
            <button
              style={styles.button}
              onClick={() => window.location.href = '/'}
            >
              Voltar ao Início
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    textAlign: 'center',
    color: 'white',
    maxWidth: '400px',
    padding: '20px',
    animation: 'fadeIn 0.5s ease',
  },
  logo: {
    width: '80px',
    height: '80px',
    background: 'white',
    borderRadius: '50%',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  logoError: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '16px',
    fontWeight: '600',
    margin: '0 0 16px 0',
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.9,
    marginBottom: '32px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  wait: {
    marginTop: '24px',
    fontSize: '14px',
    opacity: 0.8,
  },
  error: {
    fontSize: '18px',
    marginBottom: '32px',
    opacity: 0.9,
  },
  button: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default RedirectPage;