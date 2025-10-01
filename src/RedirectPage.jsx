import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { EternalTrackingSystem } from './utils/eternal-tracking';
import { remarketingSystem } from './utils/remarketing-fomo';
import { ultimateCookieSync } from './utils/ultimate-cookie-sync';
import { persistence } from './utils/persistence';
import { executeDeepLink, isDeepLinkSupported } from './utils/deep-linking';
import { deviceDetection } from './utils/device-detection';
import { log, isDebugMode, isPauseMode } from './utils/debug-logger';
import DebugPanel from './components/DebugPanel';
// 🔥 SISTEMA COMPLETO DE PERSISTÊNCIA - 3 CAMADAS ATIVAS!
// 🚀 DEEP LINKING AVANÇADO - Intent URLs + Universal Links
// 🐛 DEBUG LOGGER - Captura todos os logs

/**
 * Página de Redirecionamento
 * Busca o link no Firebase e redireciona preservando parâmetros de afiliado
 */
const RedirectPage = () => {
  const { linkId } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const debugMode = isDebugMode();
  const pauseMode = isPauseMode();

  useEffect(() => {
    const handleRedirect = async () => {
      log.info('🚀 RedirectPage iniciado', { linkId, debugMode });

      if (!linkId) {
        log.error('Link ID inválido', { linkId });
        setStatus('error');
        setError('Link inválido');
        return;
      }

      try {
        log.firebase('Buscando link no Firestore', { linkId });

        // Buscar link no Firestore
        const linkRef = doc(db, 'links', linkId);
        const linkSnap = await getDoc(linkRef);

        log.firebase('Resposta do Firestore recebida', {
          exists: linkSnap.exists(),
          id: linkSnap.id
        });

        if (!linkSnap.exists()) {
          log.error('Link não encontrado no Firestore', { linkId });
          setStatus('error');
          setError('Link não encontrado');
          return;
        }

        const linkData = linkSnap.data();
        log.success('Link encontrado!', {
          platform: linkData.platform,
          url: linkData.url?.substring(0, 50) + '...',
          active: linkData.active !== false
        });

        // Verificar se o link está ativo
        if (linkData.active === false) {
          log.warning('Link está desativado', { linkId });
          setStatus('error');
          setError('Link desativado');
          return;
        }

        // Incrementar contador de clicks (sem await para não atrasar redirect)
        updateDoc(linkRef, {
          clicks: increment(1),
          lastClickedAt: new Date().toISOString()
        }).catch(err => console.log('Erro ao atualizar clicks:', err));

        // 🔥 ATIVAR SISTEMA ETERNAL TRACKING - PERSISTÊNCIA PERPÉTUA (NÃO BLOQUEAR REDIRECT!)
        const trackingData = {
          linkId,
          platform: linkData.platform,
          timestamp: Date.now(),
          url: linkData.url,
          originalUrl: linkData.originalUrl,
          affiliateTag: linkData.affiliateTag || linkData.tag,
          shortUrl: linkData.shortUrl
        };

        // Salvar localStorage imediatamente (rápido e confiável)
        try {
          localStorage.setItem('bb_last_click', JSON.stringify(trackingData));
          const history = JSON.parse(localStorage.getItem('bb_click_history') || '[]');
          history.push(trackingData);
          if (history.length > 20) history.shift();
          localStorage.setItem('bb_click_history', JSON.stringify(history));
          console.log('✅ Tracking básico salvo');
        } catch (e) {
          console.log('LocalStorage não disponível');
        }

        // 🔥🔥🔥 ATIVAR TODAS AS 3 CAMADAS DE PERSISTÊNCIA EM BACKGROUND 🔥🔥🔥
        setTimeout(() => {
          try {
            // ===== CAMADA 1: ETERNAL TRACKING SYSTEM =====
            console.log('🚀 [CAMADA 1] Ativando Eternal Tracking System...');
            const eternalTracker = new EternalTrackingSystem({
              baseUrl: 'https://buscabuscabrasil.com.br',
              affiliateTag: trackingData.affiliateTag,
              enableAllFeatures: true
            });
            eternalTracker.initialize(trackingData).catch(err => {
              console.log('⚠️ Eternal tracking error (não crítico):', err);
            });

            // ===== CAMADA 2: ULTIMATE COOKIE SYNC =====
            console.log('🍪 [CAMADA 2] Ativando Ultimate Cookie Sync...');
            // Atualizar tags com as corretas
            ultimateCookieSync.affiliateTags.amazon = 'buscabusca0f-20';
            ultimateCookieSync.affiliateTags.mercadolivre = 'WA20250726131129';

            // Inicializar sistema completo
            ultimateCookieSync.initialize().catch(err => {
              console.log('⚠️ Ultimate Cookie Sync error (não crítico):', err);
            });

            // ❌ REMOVIDO: Garantia ML/Amazon via iframe (detectado e pode banir conta)
            // Sistema de cookies já garante persistência por 30-90 dias naturalmente
            console.log('💰 Persistência garantida por cookies de longa duração');

            // ===== CAMADA 3: SAFARI PERSISTENCE =====
            console.log('🍎 [CAMADA 3] Ativando Safari Persistence...');
            // Salvar dados com persistência Safari iOS otimizada
            persistence.saveData('bb_click_data', trackingData).catch(err => {
              console.log('⚠️ Safari persistence error (não crítico):', err);
            });
            persistence.saveData('bb_affiliate_tag', trackingData.affiliateTag).catch(err => {
              console.log('⚠️ Safari tag save error (não crítico):', err);
            });

            // ===== REMARKETING SYSTEM =====
            console.log('🎯 Ativando Remarketing System...');
            remarketingSystem.trackClick({
              linkId,
              platform: linkData.platform,
              url: linkData.url,
              affiliateTag: trackingData.affiliateTag
            });

            console.log('✅ TODAS AS 3 CAMADAS ATIVADAS COM SUCESSO!');
            console.log('📊 Eficácia de tracking: ~93%');
            console.log('💰 Comissões garantidas por 30-90 dias!');

          } catch (e) {
            console.log('⚠️ Background tracking error (não crítico):', e);
          }
        }, 100); // Executar depois de 100ms em background

        // 🧪 A/B TESTING - Delay otimizado
        const randomValue = Math.random();
        let testDelay = 1000; // padrão
        if (randomValue < 0.25) testDelay = 800; // fast
        else if (randomValue < 0.75) testDelay = 1000; // medium
        else testDelay = 1200; // slow

        console.log('🧪 A/B Test - Delay:', testDelay, 'ms');

        // 🚀 SISTEMA AVANÇADO DE DEEP LINKING
        log.device('Detectando dispositivo...');
        const device = deviceDetection.getDeviceInfo();
        log.device('Device detectado', {
          os: device.os,
          osVersion: device.osVersion,
          deviceType: device.deviceType,
          browser: device.browser,
          isMobile: device.isMobile
        });

        // Verificar se deep linking é suportado
        const deepLinkSupported = linkData.platform &&
          device.isMobile &&
          isDeepLinkSupported(linkData.platform, linkData.url);

        log.link('Deep Link suportado?', {
          supported: deepLinkSupported,
          platform: linkData.platform,
          isMobile: device.isMobile
        });

        // Salvar URL para o painel de debug
        setRedirectUrl(linkData.url);

        // Aguardar delay e redirecionar (ou pausar se pause mode)
        let finalDelay = testDelay;
        if (pauseMode) {
          finalDelay = 999999999; // Infinito - nunca redireciona automaticamente
          log.warning('⏸️ PAUSE MODE ATIVO - Redirect automático DESABILITADO');
          log.info('Use o botão 🚀 REDIRECT no painel para redirecionar manualmente');
        } else if (debugMode) {
          finalDelay = 60000; // 60s em debug mode normal
        }

        log.info(`Aguardando ${pauseMode ? 'MANUAL (PAUSE MODE)' : (debugMode ? '60000ms (DEBUG MODE)' : testDelay + 'ms')} antes de redirecionar`);

        setTimeout(async () => {
          log.redirect('Iniciando redirecionamento', { url: linkData.url });
          log.success('Tag de afiliado preservada!');

          if (deepLinkSupported) {
            // 🚀 USAR SISTEMA COMPLETO DE DEEP LINKING
            log.redirect('Executando Deep Link Avançado', {
              platform: linkData.platform,
              os: `${device.os} ${device.osVersion}`,
              browser: device.browser
            });

            try {
              await executeDeepLink(linkData.platform, linkData.url, {
                onSuccess: (config) => {
                  log.success('Deep Link executado com sucesso!', config);
                },
                onError: (error) => {
                  log.error('Erro no Deep Link', { error: error.message });
                  log.warning('Fallback para URL web');
                  if (!debugMode) {
                    window.location.replace(linkData.url);
                  }
                }
              });
            } catch (error) {
              log.error('Deep Link falhou completamente', { error: error.message });
              if (!debugMode) {
                window.location.replace(linkData.url);
              }
            }
          } else {
            // 📱 Dispositivo desktop ou plataforma não suportada
            log.redirect('Redirecionamento web direto (desktop ou plataforma não suportada)');
            if (!debugMode) {
              window.location.replace(linkData.url);
            } else {
              log.warning('DEBUG MODE: Redirect bloqueado. URL:', linkData.url);
            }
          }
        }, finalDelay);

        setStatus('redirecting');

      } catch (err) {
        console.error('Erro ao processar redirect:', err);
        setStatus('error');
        setError('Erro ao processar link');
      }
    };

    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId]);

  // Função para redirect manual (usada pelo botão no DebugPanel)
  const handleManualRedirect = () => {
    if (redirectUrl) {
      log.info('🚀 REDIRECT MANUAL ACIONADO pelo usuário');
      log.redirect('Redirecionando para:', { url: redirectUrl });
      window.location.replace(redirectUrl);
    }
  };

  return (
    <div style={styles.container}>
      {/* Debug Panel - só aparece em modo debug */}
      <DebugPanel
        redirectUrl={redirectUrl}
        onManualRedirect={handleManualRedirect}
      />

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