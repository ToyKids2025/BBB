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
  window.addEventListener('load', async () => {
    try {
      // Registrar SW principal
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Nova versão do SW encontrada');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            if (confirm('Nova versão disponível! Atualizar agora?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });

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