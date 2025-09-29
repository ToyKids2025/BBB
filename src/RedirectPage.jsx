import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Página de Redirecionamento
 * Busca o link no Firebase e redireciona preservando parâmetros de afiliado
 */
const RedirectPage = () => {
  const { linkId } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

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

        // Salvar referência no localStorage para tracking
        try {
          const trackingData = {
            linkId,
            platform: linkData.platform,
            timestamp: Date.now(),
            url: linkData.url
          };
          localStorage.setItem('bb_last_click', JSON.stringify(trackingData));

          // Histórico de clicks
          const history = JSON.parse(localStorage.getItem('bb_click_history') || '[]');
          history.push(trackingData);
          if (history.length > 20) history.shift(); // Manter últimos 20
          localStorage.setItem('bb_click_history', JSON.stringify(history));
        } catch (e) {
          console.log('LocalStorage não disponível');
        }

        // Aguardar 800ms antes de redirecionar (melhor UX)
        setTimeout(() => {
          // Redirecionar preservando TODOS os parâmetros
          window.location.replace(linkData.url);
        }, 800);

        setStatus('redirecting');

      } catch (err) {
        console.error('Erro ao processar redirect:', err);
        setStatus('error');
        setError('Erro ao processar link');
      }
    };

    handleRedirect();
  }, [linkId]);

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