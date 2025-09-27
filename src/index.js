import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service Worker principal existente
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW principal registrado:', registration.scope);
      })
      .catch(error => {
        console.log('SW principal falhou:', error);
      });

    // Service Worker para Push Notifications
    navigator.serviceWorker.register('/sw-push.js')
      .then(registration => {
        console.log('🔥 Push SW registrado:', registration.scope);

        // Solicitar permissão para notificações
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              console.log('✅ Permissão para Push Notifications concedida!');

              // Mostrar notificação de boas-vindas
              new Notification('🔥 Remarketing FOMO Ativado!', {
                body: 'Você receberá ofertas exclusivas!',
                icon: '/icon-192.png',
                badge: '/icon-72.png'
              });
            }
          });
        }
      })
      .catch(error => {
        console.log('Push SW falhou:', error);
      });
  });
}