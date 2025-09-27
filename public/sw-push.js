/**
 * 🔥 SERVICE WORKER - PUSH NOTIFICATIONS REMARKETING FOMO
 * Sistema de notificações push para recuperar vendas perdidas
 */

// Configurações
const NOTIFICATION_DEFAULTS = {
  badge: '/icon-72.png',
  icon: '/icon-192.png',
  vibrate: [200, 100, 200],
  requireInteraction: true,
  renotify: true,
  tag: 'remarketing-fomo'
};

/**
 * INSTALAÇÃO - Configurar Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🔥 Push Service Worker instalado');
  self.skipWaiting();
});

/**
 * ATIVAÇÃO - Limpar cache antigo
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Push Service Worker ativado');
  event.waitUntil(clients.claim());
});

/**
 * PUSH EVENT - Receber notificação push
 */
self.addEventListener('push', (event) => {
  console.log('📨 Push notification recebida:', event);

  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error('Erro ao parsear dados push:', error);
    data = {
      title: '🔥 Oferta Especial!',
      body: 'Você tem uma nova oferta disponível',
      type: 'default'
    };
  }

  // Gerar notificação baseada no tipo
  const notification = generateFOMONotification(data);

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options)
  );
});

/**
 * GERAR NOTIFICAÇÃO FOMO
 */
function generateFOMONotification(data) {
  const templates = {
    // ESCASSEZ - 6 horas
    scarcity: {
      title: '🔥 Quase Esgotado!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `Só ${data.stock || '5'} unidades do ${data.product || 'produto'} restantes!`,
        image: data.image,
        data: { url: data.url, type: 'scarcity', clickId: data.clickId },
        actions: [
          { action: 'buy', title: '🛒 Comprar Agora', icon: '/icon-cart.png' },
          { action: 'later', title: 'Depois', icon: '/icon-clock.png' }
        ],
        badge: '/badge-fire.png'
      }
    },

    // PROVA SOCIAL - 12 horas
    social_proof: {
      title: '👥 Muito Procurado!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `${data.buyers || '31'} pessoas compraram ${data.product || 'este produto'} hoje!`,
        image: data.image,
        data: { url: data.url, type: 'social_proof', clickId: data.clickId },
        actions: [
          { action: 'view', title: '👁️ Ver Produto', icon: '/icon-eye.png' },
          { action: 'dismiss', title: '❌ Ignorar', icon: '/icon-x.png' }
        ],
        badge: '/badge-trending.png'
      }
    },

    // DESCONTO - 20 horas
    discount: {
      title: '💰 Desconto Exclusivo!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `R$ ${data.discount || '50'} OFF no ${data.product || 'produto'} - Só hoje!`,
        image: data.image,
        data: { url: data.url, type: 'discount', clickId: data.clickId },
        actions: [
          { action: 'claim', title: '💰 Resgatar', icon: '/icon-money.png' },
          { action: 'later', title: '⏰ Depois', icon: '/icon-clock.png' }
        ],
        vibrate: [100, 200, 100, 200, 100],
        badge: '/badge-sale.png'
      }
    },

    // URGÊNCIA FINAL - 23 horas
    final_warning: {
      title: '🚨 ÚLTIMA CHANCE!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `Link expira em ${data.remaining || '1 hora'}! ${data.product || 'Produto'}`,
        image: data.image,
        data: { url: data.url, type: 'final_warning', clickId: data.clickId },
        actions: [
          { action: 'buy_now', title: '🔥 COMPRAR JÁ!', icon: '/icon-urgent.png' }
        ],
        vibrate: [500, 200, 500, 200, 500],
        requireInteraction: true,
        badge: '/badge-alert.png',
        silent: false
      }
    },

    // CARRINHO ABANDONADO
    cart_reminder: {
      title: '🛒 Você Esqueceu Algo!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `${data.product || 'Item'} ainda está no seu carrinho`,
        image: data.image,
        data: { url: data.url, type: 'cart_reminder', clickId: data.clickId },
        actions: [
          { action: 'checkout', title: '✅ Finalizar', icon: '/icon-check.png' },
          { action: 'remove', title: '🗑️ Remover', icon: '/icon-trash.png' }
        ],
        badge: '/badge-cart.png'
      }
    },

    // PRICE DROP
    price_drop: {
      title: '📉 Preço Caiu!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `${data.product || 'Produto'} agora R$ ${data.newPrice || '199,90'}!`,
        image: data.image,
        data: { url: data.url, type: 'price_drop', clickId: data.clickId },
        actions: [
          { action: 'buy', title: '💰 Aproveitar', icon: '/icon-money.png' },
          { action: 'track', title: '📊 Acompanhar', icon: '/icon-chart.png' }
        ],
        badge: '/badge-discount.png'
      }
    },

    // BACK IN STOCK
    back_in_stock: {
      title: '✅ Voltou ao Estoque!',
      options: {
        ...NOTIFICATION_DEFAULTS,
        body: `${data.product || 'Produto'} disponível novamente!`,
        image: data.image,
        data: { url: data.url, type: 'back_in_stock', clickId: data.clickId },
        actions: [
          { action: 'buy', title: '🛒 Comprar', icon: '/icon-cart.png' },
          { action: 'save', title: '❤️ Salvar', icon: '/icon-heart.png' }
        ],
        badge: '/badge-check.png'
      }
    }
  };

  // Selecionar template baseado no tipo ou usar padrão
  const template = templates[data.type] || templates.scarcity;

  // Adicionar timestamp
  if (template.options.body) {
    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    template.options.body += ` • ${now}`;
  }

  return template;
}

/**
 * NOTIFICATION CLICK - Quando usuário clica na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🎯 Notificação clicada:', event.action);

  event.notification.close();

  const data = event.notification.data;
  let targetUrl = data?.url || 'https://buscabuscabrasil.com.br';

  // Adicionar tracking parameters
  const trackingParams = new URLSearchParams({
    utm_source: 'push_notification',
    utm_medium: 'remarketing',
    utm_campaign: data?.type || 'fomo',
    click_id: data?.clickId || 'unknown',
    action: event.action || 'click'
  });

  targetUrl += (targetUrl.includes('?') ? '&' : '?') + trackingParams.toString();

  // Ações específicas
  switch (event.action) {
    case 'buy':
    case 'buy_now':
    case 'checkout':
    case 'claim':
      // Conversão - abrir direto no produto
      event.waitUntil(
        clients.openWindow(targetUrl).then(() => {
          // Registrar conversão
          trackConversion(data.clickId, 'push_notification');
        })
      );
      break;

    case 'view':
    case 'track':
      // Visualização - abrir em nova aba
      event.waitUntil(clients.openWindow(targetUrl));
      break;

    case 'save':
      // Salvar para depois
      saveForLater(data);
      break;

    case 'later':
      // Adiar - reagendar notificação
      rescheduleNotification(data);
      break;

    case 'dismiss':
    case 'remove':
      // Ignorar/Remover - marcar como não interessado
      markNotInterested(data.clickId);
      break;

    default:
      // Click na notificação sem ação específica
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          // Se já tem aba aberta, focar nela
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }
          // Senão, abrir nova aba
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
      );
  }
});

/**
 * NOTIFICATION CLOSE - Quando notificação é fechada
 */
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada');

  const data = event.notification.data;

  // Registrar que foi fechada sem ação
  if (data?.clickId) {
    trackEvent('notification_closed', {
      clickId: data.clickId,
      type: data.type
    });
  }
});

/**
 * FUNÇÕES AUXILIARES
 */

// Rastrear conversão
async function trackConversion(clickId, source) {
  try {
    await fetch('/api/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clickId,
        source,
        timestamp: Date.now()
      })
    });

    console.log('💰 Conversão registrada:', clickId);
  } catch (error) {
    console.error('Erro ao registrar conversão:', error);
  }
}

// Salvar para depois
async function saveForLater(data) {
  try {
    // Salvar no IndexedDB ou localStorage via postMessage
    const allClients = await clients.matchAll();
    allClients.forEach(client => {
      client.postMessage({
        type: 'save_for_later',
        data: data
      });
    });
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
}

// Reagendar notificação
async function rescheduleNotification(data) {
  try {
    // Reagendar para 6 horas depois
    const delay = 6 * 60 * 60 * 1000;

    setTimeout(() => {
      self.registration.showNotification(
        '⏰ Lembrete: Oferta ainda disponível!',
        {
          ...NOTIFICATION_DEFAULTS,
          body: `${data.product || 'Produto'} ainda está esperando por você`,
          data: data
        }
      );
    }, delay);

    console.log('⏰ Notificação reagendada');
  } catch (error) {
    console.error('Erro ao reagendar:', error);
  }
}

// Marcar como não interessado
async function markNotInterested(clickId) {
  try {
    await fetch('/api/not-interested', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clickId })
    });

    console.log('❌ Marcado como não interessado:', clickId);
  } catch (error) {
    console.error('Erro ao marcar:', error);
  }
}

// Rastrear evento
async function trackEvent(eventName, data) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        ...data,
        timestamp: Date.now()
      })
    });
  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
  }
}

/**
 * SINCRONIZAÇÃO PERIÓDICA
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-pending-conversions') {
    event.waitUntil(checkPendingConversions());
  }
});

async function checkPendingConversions() {
  try {
    // Buscar conversões pendentes do servidor
    const response = await fetch('/api/pending-conversions');
    const pending = await response.json();

    // Processar cada conversão pendente
    for (const item of pending) {
      const timeSinceClick = Date.now() - item.clickTime;
      const schedule = getNotificationSchedule(item.platform);

      // Verificar qual notificação enviar baseado no tempo
      for (const notification of schedule) {
        if (timeSinceClick >= notification.delay &&
            !item.notifications?.includes(notification.type)) {

          // Enviar notificação
          await self.registration.showNotification(
            notification.title,
            {
              ...NOTIFICATION_DEFAULTS,
              ...notification.options,
              data: {
                clickId: item.clickId,
                url: item.url,
                type: notification.type,
                product: item.productName
              }
            }
          );

          // Marcar como enviada
          await markNotificationSent(item.clickId, notification.type);

          break; // Enviar apenas uma notificação por vez
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar conversões pendentes:', error);
  }
}

// Obter agenda de notificações
function getNotificationSchedule(platform) {
  const schedules = {
    amazon: [
      { delay: 6 * 3600000, type: 'scarcity', title: '🔥 Estoque Baixo!' },
      { delay: 12 * 3600000, type: 'social_proof', title: '👥 Muito Procurado!' },
      { delay: 20 * 3600000, type: 'discount', title: '💰 Desconto Especial!' },
      { delay: 23 * 3600000, type: 'final_warning', title: '🚨 ÚLTIMA CHANCE!' }
    ],
    mercadolivre: [
      { delay: 2 * 3600000, type: 'cart_reminder', title: '🛒 Carrinho Esperando!' },
      { delay: 8 * 3600000, type: 'price_drop', title: '📉 Preço Caiu!' },
      { delay: 16 * 3600000, type: 'scarcity', title: '🔥 Últimas Unidades!' }
    ]
  };

  return schedules[platform] || schedules.amazon;
}

// Marcar notificação como enviada
async function markNotificationSent(clickId, type) {
  try {
    await fetch('/api/notifications/sent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clickId, type })
    });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
  }
}

console.log('🔥 Push Service Worker carregado e pronto!');