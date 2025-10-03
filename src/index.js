import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

// Registrar Service Worker PWA
if ('serviceWorker' in navigator) {
  let updatePromptShown = false; // Evitar múltiplos prompts

  window.addEventListener('load', async () => {
    try {
      // Não mostrar prompt de atualização em páginas de redirect
      const isRedirectPage = window.location.pathname.startsWith('/r/');

      // Registrar SW principal
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Forçar verificação de atualizações
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Verificar atualizações (apenas se não for página de redirect)
      if (!isRedirectPage) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nova versão do SW encontrada');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' &&
                navigator.serviceWorker.controller &&
                !updatePromptShown) {

              updatePromptShown = true; // Marcar que já mostrou o prompt

              // Aguardar 2 segundos antes de mostrar o prompt
              setTimeout(() => {
                // Verificar novamente se não está em página de redirect
                if (!window.location.pathname.startsWith('/r/')) {
                  if (confirm('Nova versão disponível! Atualizar agora?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  } else {
                    // Se usuário recusar, não perguntar de novo nesta sessão
                    console.log('⏭️ Atualização adiada');
                  }
                } else {
                  console.log('⏭️ Atualização silenciosa (página de redirect)');
                }
              }, 2000);
            }
          });
        });
      } else {
        // Em páginas de redirect, fazer skipWaiting silencioso
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      }

      // Solicitar permissão para notificações (opcional)
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notificações permitidas');
        }
      }

      // Solicitar persistent storage
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(isPersisted ? '✅ Storage persistente' : '⚠️ Storage não persistente');
      }

      // Registrar para Background Sync
      if ('sync' in registration) {
        console.log('✅ Background Sync disponível');
      }

    } catch (error) {
      console.error('❌ Erro ao registrar SW:', error);
    }
  });

  // Listener para mensagens do SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 Mensagem do SW:', event.data);
  });
}