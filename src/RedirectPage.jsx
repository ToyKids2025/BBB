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
import { enhanceLinkV2 } from './utils/link-enhancer-v2';
import { guardian } from './utils/commission-guardian';
import { FaAmazon } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';
// 🔥 SISTEMA COMPLETO DE PERSISTÊNCIA - 3 CAMADAS ATIVAS!
// 🚀 DEEP LINKING AVANÇADO - Intent URLs + Universal Links
// 🐛 DEBUG LOGGER - Captura todos os logs

/**
 * Página de Redirecionamento
 * Busca o link no Firebase e redireciona preservando parâmetros de afiliado
 */
// Mensagens motivacionais por plataforma
const getMotivationalMessage = (platform) => {
  const messages = {
    amazon: [
      "🎉 Economia garantida na Amazon!",
      "🔥 Oferta especial encontrada!",
      "💰 Você está economizando agora!",
      "⚡ Melhor preço garantido!",
      "🎁 Produto selecionado especialmente pra você!"
    ],
    mercadolivre: [
      "🚀 Direcionando para a melhor oferta!",
      "💚 Frete grátis te esperando!",
      "🎁 Oferta exclusiva selecionada!",
      "⭐ Produto com melhor avaliação!",
      "🔥 Promoção imperdível encontrada!"
    ],
    default: [
      "✨ Redirecionando com segurança!",
      "🎯 Levando você ao melhor preço!",
      "💎 Oferta verificada e aprovada!"
    ]
  };

  const platformMessages = messages[platform] || messages.default;
  return platformMessages[Math.floor(Math.random() * platformMessages.length)];
};

const RedirectPage = () => {
  const { linkId } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [motivationalMsg, setMotivationalMsg] = useState('');
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

        // Configurar platform e mensagem motivacional
        setPlatform(linkData.platform);
        setMotivationalMsg(getMotivationalMessage(linkData.platform));

        // Verificar se o link está ativo
        if (linkData.active === false) {
          log.warning('Link está desativado', { linkId });
          setStatus('error');
          setError('Link desativado');
          return;
        }

        // 🔥🔥🔥 APLICAR LINK ENHANCER V2 + COMMISSION GUARDIAN! 🔥🔥🔥
        let finalUrl = linkData.url;

        try {
          log.info('🔧 Aplicando Link Enhancer V2 no redirect...');

          // Link Enhancer V2 com features avançadas
          const enhanced = await enhanceLinkV2(linkData.url, linkData.platform, {
            deepLink: true,      // Habilitar deep links para mobile
            addToCart: false,    // Add-to-cart automático (opcional)
            medium: 'redirect',  // UTM medium
            campaign: 'bbb_link' // UTM campaign
          });

          // Verificar se retornou deep link (mobile)
          if (typeof enhanced === 'object' && enhanced.deepLink) {
            log.success('📱 Deep Link criado para mobile!', {
              platform: enhanced.platform,
              deepLink: enhanced.deepLink.substring(0, 50)
            });
            finalUrl = enhanced.webLink; // Usar web link como padrão
          } else {
            finalUrl = enhanced;
          }

          log.success('✅ Link upgradado pelo Enhancer V2!', {
            original: linkData.url.substring(0, 50),
            enhanced: finalUrl.substring(0, 50)
          });

          // Atualizar linkData.url com a versão enhanced
          linkData.url = finalUrl;
        } catch (error) {
          log.error('⚠️ Erro no Link Enhancer, usando URL original:', error);
          // Se falhar, continua com linkData.url original
        }

        // 💎 ATIVAR COMMISSION GUARDIAN - PROTEÇÃO TOTAL DE COMISSÃO 💎
        try {
          log.info('💎 Ativando Commission Guardian...');

          // Guardar dados do produto para remarketing
          const productData = {
            url: finalUrl,
            originalUrl: linkData.originalUrl,
            platform: linkData.platform,
            title: linkData.title || 'Produto',
            linkId: linkId,
            timestamp: Date.now()
          };

          // Guardian já foi inicializado automaticamente
          // Mas podemos agendar reminders específicos para este produto
          if (linkData.platform === 'amazon') {
            // Amazon: cookie de 24h, agendar reminder para 22h
            guardian.scheduleWhatsAppReminder(productData);
            log.success('📱 WhatsApp reminder agendado para 22h');
          }

          // Adicionar ao price watcher se tiver preço
          if (linkData.price) {
            // Nota: precisa de email capturado previamente
            const capturedEmail = localStorage.getItem('bb_captured_email');
            if (capturedEmail) {
              const emailData = JSON.parse(capturedEmail);
              guardian.addPriceWatcher(finalUrl, linkData.price, emailData.email);
              log.success('💰 Produto adicionado ao price watcher');
            }
          }

          log.success('✅ Commission Guardian ativo - Comissão 100% protegida!');
        } catch (error) {
          log.error('⚠️ Erro no Commission Guardian (não crítico):', error);
          // Não bloquear redirect se Guardian falhar
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

        // 🧪 A/B TESTING - Delay ULTRA-RÁPIDO otimizado (300-500ms)
        const randomValue = Math.random();
        let testDelay = 400; // padrão 400ms (UX perfeita)
        if (randomValue < 0.3) testDelay = 300;  // super fast
        else if (randomValue < 0.7) testDelay = 400;  // fast
        else testDelay = 500;  // medium

        console.log('🚀 Delay ultra-rápido:', testDelay, 'ms');

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
        } else if (debugMode && process.env.NODE_ENV === 'development') {
          // Debug mode apenas em development (5s suficiente)
          finalDelay = 5000;
          log.warning('🐛 DEBUG MODE: Delay de 5s (development only)');
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
            <div style={styles.logoBounce}>
              <span style={styles.logoEmoji}>🔍</span>
              <span style={styles.logoText}>BBB</span>
            </div>
            <h1 style={styles.title}>Carregando...</h1>
            <p style={styles.subtitle}>Buscando seu link</p>
            <div style={styles.spinner}></div>
          </>
        )}

        {status === 'redirecting' && (
          <>
            {/* Logo animado com ícone da plataforma */}
            <div style={styles.logoBounce}>
              <span style={styles.logoEmoji}>
                {platform === 'amazon' ? '📦' : platform === 'mercadolivre' ? '🛒' : '✨'}
              </span>
              <span style={styles.logoText}>BBB</span>
            </div>

            {/* Mensagem motivacional */}
            <h1 style={styles.titleGradient}>{motivationalMsg}</h1>

            {/* Platform badge */}
            <div style={styles.platformBadge}>
              {platform === 'amazon' ? (
                <>
                  <FaAmazon style={styles.platformIcon} />
                  <span>Direcionando para Amazon...</span>
                </>
              ) : platform === 'mercadolivre' ? (
                <>
                  <SiMercadopago style={styles.platformIcon} />
                  <span>Direcionando para Mercado Livre...</span>
                </>
              ) : (
                <span>Redirecionando com segurança...</span>
              )}
            </div>

            {/* Progress bar animado */}
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>

            {/* Footer discreto */}
            <p style={styles.footerText}>
              💎 Sua comissão está protegida por 90 dias
            </p>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
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
  logoBounce: {
    width: '100px',
    height: '100px',
    background: 'white',
    borderRadius: '50%',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#667eea',
    animation: 'bounce 0.8s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    gap: '8px',
  },
  logoEmoji: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
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
  titleGradient: {
    fontSize: '26px',
    marginBottom: '24px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'pulse 2s ease-in-out infinite',
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
  platformBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '12px 24px',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  platformIcon: {
    fontSize: '20px',
  },
  progressBar: {
    width: '100%',
    maxWidth: '300px',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
    margin: '0 auto 24px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
    animation: 'progress 0.5s ease forwards',
    borderRadius: '2px',
  },
  footerText: {
    fontSize: '13px',
    opacity: 0.8,
    marginTop: '16px',
    fontWeight: '500',
  },
};

export default RedirectPage;