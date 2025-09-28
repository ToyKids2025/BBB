/**
 * Sistema de Notificações Multi-Canal
 * Discord, Telegram, WhatsApp, Email
 */

class NotificationSystem {
  constructor() {
    this.channels = {
      discord: this.sendDiscordNotification.bind(this),
      telegram: this.sendTelegramNotification.bind(this),
      whatsapp: this.sendWhatsAppNotification.bind(this),
      email: this.sendEmailNotification.bind(this)
    };

    this.config = {
      discord: {
        webhook: process.env.REACT_APP_DISCORD_WEBHOOK || '',
        enabled: true
      },
      telegram: {
        botToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.REACT_APP_TELEGRAM_CHAT_ID || '',
        enabled: true
      },
      whatsapp: {
        apiUrl: 'http://localhost:3001/whatsapp',
        enabled: false // Ativar quando servidor estiver rodando
      },
      email: {
        apiUrl: '/api/email',
        enabled: false
      }
    };
  }

  /**
   * Enviar notificação para todos os canais ativos
   */
  async notifyAll(message, data = {}) {
    const results = {};

    for (const [channel, sender] of Object.entries(this.channels)) {
      if (this.config[channel].enabled) {
        try {
          results[channel] = await sender(message, data);
        } catch (error) {
          console.error(`Erro ao enviar para ${channel}:`, error);
          results[channel] = { success: false, error: error.message };
        }
      }
    }

    return results;
  }

  /**
   * Discord Webhook
   */
  async sendDiscordNotification(message, data = {}) {
    const webhook = this.config.discord.webhook;

    // Se não houver webhook configurado, retornar silenciosamente
    if (!webhook || webhook === '' || webhook.includes('YOUR_WEBHOOK_HERE')) {
      return { success: false, error: 'Discord webhook não configurado' };
    }

    const embed = {
      title: data.title || '🔔 Notificação BuscaBuscaBrasil',
      description: message,
      color: data.color || 0x667eea, // Cor roxa padrão
      timestamp: new Date().toISOString(),
      fields: [],
      footer: {
        text: 'BBB Link System',
        icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
      }
    };

    // Adicionar campos extras se fornecidos
    if (data.fields) {
      embed.fields = data.fields.map(field => ({
        name: field.name,
        value: field.value,
        inline: field.inline !== false
      }));
    }

    // Adicionar thumbnail se fornecida
    if (data.thumbnail) {
      embed.thumbnail = { url: data.thumbnail };
    }

    // Adicionar imagem se fornecida
    if (data.image) {
      embed.image = { url: data.image };
    }

    // Criar payload
    const payload = {
      username: 'BBB Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [embed]
    };

    // Adicionar conteúdo fora do embed se necessário
    if (data.content) {
      payload.content = data.content;
    }

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      return { success: true, channel: 'discord' };
    } catch (error) {
      console.error('Erro Discord:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Telegram Bot
   */
  async sendTelegramNotification(message, data = {}) {
    const { botToken, chatId } = this.config.telegram;

    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram não configurado' };
    }

    // Formatar mensagem em HTML
    let formattedMessage = `<b>${data.title || '🔔 BuscaBuscaBrasil'}</b>\n\n`;
    formattedMessage += message;

    // Adicionar campos se fornecidos
    if (data.fields) {
      formattedMessage += '\n\n';
      data.fields.forEach(field => {
        formattedMessage += `<b>${field.name}:</b> ${field.value}\n`;
      });
    }

    // Adicionar botões inline se fornecidos
    const keyboard = data.buttons ? {
      inline_keyboard: [data.buttons.map(btn => ({
        text: btn.text,
        url: btn.url || undefined,
        callback_data: btn.callback || undefined
      }))]
    } : undefined;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
          reply_markup: keyboard
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.description);
      }

      return { success: true, channel: 'telegram', messageId: result.result.message_id };
    } catch (error) {
      console.error('Erro Telegram:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * WhatsApp (via servidor local)
   */
  async sendWhatsAppNotification(message, data = {}) {
    const { apiUrl } = this.config.whatsapp;

    try {
      const response = await fetch(`${apiUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone || process.env.REACT_APP_DEFAULT_PHONE,
          message: message,
          media: data.media || null
        })
      });

      const result = await response.json();

      return { success: result.success, channel: 'whatsapp' };
    } catch (error) {
      console.error('Erro WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email (placeholder para implementação futura)
   */
  async sendEmailNotification(message, data = {}) {
    // Implementar integração com SendGrid, AWS SES, etc.
    return { success: false, error: 'Email não implementado' };
  }

  /**
   * Notificações específicas de eventos
   */
  async notifyNewLink(linkData) {
    const message = `🔗 Novo link criado!\n\nPlataforma: ${linkData.platform}\nURL: ${linkData.url}`;

    const data = {
      title: '🔗 Novo Link Criado',
      color: 0x4CAF50,
      fields: [
        { name: '📱 Plataforma', value: linkData.platform },
        { name: '🔗 URL Original', value: linkData.originalUrl },
        { name: '✨ URL com Tag', value: linkData.url },
        { name: '📅 Criado em', value: new Date().toLocaleString('pt-BR') }
      ],
      buttons: [
        { text: '🔗 Abrir Link', url: linkData.url }
      ]
    };

    return this.notifyAll(message, data);
  }

  async notifyConversion(conversionData) {
    const message = `💰 CONVERSÃO REALIZADA!\n\nValor: R$ ${conversionData.value.toFixed(2)}\nProduto: ${conversionData.product}`;

    const data = {
      title: '💰 CONVERSÃO!',
      color: 0xFFD700,
      fields: [
        { name: '💵 Valor', value: `R$ ${conversionData.value.toFixed(2)}` },
        { name: '📦 Produto', value: conversionData.product },
        { name: '🏪 Plataforma', value: conversionData.platform },
        { name: '💳 Comissão Estimada', value: `R$ ${(conversionData.value * 0.05).toFixed(2)}` }
      ],
      thumbnail: conversionData.productImage
    };

    return this.notifyAll(message, data);
  }

  async notifyMilestone(milestone) {
    const emojis = {
      clicks: '👆',
      conversions: '💰',
      revenue: '💵',
      links: '🔗'
    };

    const message = `🎉 MARCO ATINGIDO!\n\n${emojis[milestone.type]} ${milestone.description}`;

    const data = {
      title: '🎉 Marco Atingido!',
      color: 0xFF69B4,
      fields: [
        { name: '🏆 Conquista', value: milestone.description },
        { name: '📊 Tipo', value: milestone.type },
        { name: '🎯 Meta Atingida', value: milestone.value.toString() },
        { name: '📅 Data', value: new Date().toLocaleString('pt-BR') }
      ]
    };

    return this.notifyAll(message, data);
  }

  async notifyError(error) {
    const message = `⚠️ ERRO NO SISTEMA\n\n${error.message}`;

    const data = {
      title: '⚠️ Erro Detectado',
      color: 0xFF0000,
      fields: [
        { name: '❌ Erro', value: error.message },
        { name: '📍 Local', value: error.location || 'Desconhecido' },
        { name: '🕐 Horário', value: new Date().toLocaleString('pt-BR') }
      ]
    };

    return this.notifyAll(message, data);
  }

  async notifyDailySummary(stats) {
    const message = `📊 RESUMO DIÁRIO\n\nCliques: ${stats.clicks}\nConversões: ${stats.conversions}\nReceita: R$ ${stats.revenue.toFixed(2)}`;

    const data = {
      title: '📊 Resumo Diário',
      color: 0x00BCD4,
      fields: [
        { name: '👆 Cliques Hoje', value: stats.clicks.toString() },
        { name: '💰 Conversões', value: stats.conversions.toString() },
        { name: '💵 Receita Total', value: `R$ ${stats.revenue.toFixed(2)}` },
        { name: '📈 Taxa de Conversão', value: `${stats.conversionRate.toFixed(2)}%` },
        { name: '🔗 Links Criados', value: stats.linksCreated.toString() },
        { name: '⭐ Melhor Produto', value: stats.topProduct || 'N/A' }
      ]
    };

    return this.notifyAll(message, data);
  }
}

// Exportar instância única
export const notifications = new NotificationSystem();

// Helpers para uso rápido
export const notify = {
  success: (message, data) => notifications.notifyAll(`✅ ${message}`, { ...data, color: 0x4CAF50 }),
  error: (message, data) => notifications.notifyAll(`❌ ${message}`, { ...data, color: 0xFF0000 }),
  warning: (message, data) => notifications.notifyAll(`⚠️ ${message}`, { ...data, color: 0xFFA500 }),
  info: (message, data) => notifications.notifyAll(`ℹ️ ${message}`, { ...data, color: 0x00BCD4 })
};

// Função para testar notificações
export async function testNotifications() {
  console.log('🔔 Testando sistema de notificações...');

  const results = await notifications.notifyAll('Teste do sistema de notificações', {
    title: '🧪 Teste de Notificação',
    fields: [
      { name: 'Status', value: 'Testando' },
      { name: 'Timestamp', value: new Date().toISOString() }
    ]
  });

  console.log('Resultados dos testes:', results);
  return results;
}