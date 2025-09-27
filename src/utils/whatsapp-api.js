/**
 * 🔥 INTEGRAÇÃO WHATSAPP BUSINESS API (GRATUITA)
 * Sistema de remarketing via WhatsApp sem custo
 */

/**
 * CONFIGURAÇÃO WHATSAPP BUSINESS
 *
 * OPÇÃO 1: WhatsApp Business API (Gratuito até 1000 msgs/mês)
 * - Criar conta em: https://business.whatsapp.com
 * - Verificar número comercial
 * - Obter API Key gratuita
 *
 * OPÇÃO 2: WhatsApp Web JS (100% Gratuito)
 * - npm install whatsapp-web.js
 * - Escanear QR Code uma vez
 * - Envio ilimitado
 *
 * OPÇÃO 3: Twilio WhatsApp (Sandbox Gratuito)
 * - Criar conta em: https://www.twilio.com
 * - Ativar WhatsApp Sandbox
 * - Receber credenciais gratuitas
 */

export class WhatsAppBusiness {
  constructor() {
    // Configurações (substitua com suas credenciais)
    this.config = {
      // OPÇÃO 1: WhatsApp Business API Oficial
      businessApiUrl: 'https://api.whatsapp.com/v1',
      businessToken: process.env.REACT_APP_WHATSAPP_TOKEN || '',

      // OPÇÃO 2: WhatsApp Web JS (Recomendado - 100% Grátis)
      webJsEnabled: true,
      webJsEndpoint: 'http://localhost:3001/whatsapp', // Seu servidor Node.js

      // OPÇÃO 3: Twilio Sandbox (Grátis para testes)
      twilioEnabled: false,
      twilioAccountSid: process.env.REACT_APP_TWILIO_SID || '',
      twilioAuthToken: process.env.REACT_APP_TWILIO_TOKEN || '',
      twilioWhatsAppFrom: 'whatsapp:+14155238886', // Número Twilio Sandbox

      // Configurações gerais
      defaultCountryCode: '+55', // Brasil
      retryAttempts: 3,
      retryDelay: 5000 // 5 segundos
    };

    this.messageQueue = [];
    this.rateLimiter = new Map();
  }

  /**
   * ENVIAR MENSAGEM WHATSAPP
   */
  async sendMessage(phoneNumber, message, options = {}) {
    try {
      // Formatar número
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Verificar rate limit (máx 30 msgs/min por número)
      if (!this.checkRateLimit(formattedPhone)) {
        console.log('⚠️ Rate limit excedido para', formattedPhone);
        return this.queueMessage(formattedPhone, message, options);
      }

      // Escolher método de envio baseado na configuração
      let result;

      if (this.config.webJsEnabled) {
        result = await this.sendViaWebJs(formattedPhone, message, options);
      } else if (this.config.twilioEnabled) {
        result = await this.sendViaTwilio(formattedPhone, message, options);
      } else {
        result = await this.sendViaBusinessAPI(formattedPhone, message, options);
      }

      // Registrar sucesso
      if (result.success) {
        console.log('✅ WhatsApp enviado para', formattedPhone);
        this.updateRateLimit(formattedPhone);
      }

      return result;

    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MÉTODO 1: WhatsApp Web JS (100% Gratuito - RECOMENDADO)
   */
  async sendViaWebJs(phoneNumber, message, options) {
    try {
      // Fazer requisição para seu servidor Node.js local
      const response = await fetch(this.config.webJsEndpoint + '/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
          ...options
        })
      });

      const result = await response.json();
      return { success: result.success, messageId: result.messageId };

    } catch (error) {
      console.error('Erro WhatsApp Web JS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MÉTODO 2: Twilio Sandbox (Gratuito para testes)
   */
  async sendViaTwilio(phoneNumber, message, options) {
    try {
      const accountSid = this.config.twilioAccountSid;
      const authToken = this.config.twilioAuthToken;

      // URL da API Twilio
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      // Autenticação básica
      const auth = btoa(`${accountSid}:${authToken}`);

      // Enviar mensagem
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.config.twilioWhatsAppFrom,
          To: `whatsapp:${phoneNumber}`,
          Body: message
        })
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, messageId: result.sid };
      } else {
        return { success: false, error: result.message };
      }

    } catch (error) {
      console.error('Erro Twilio:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MÉTODO 3: WhatsApp Business API Oficial
   */
  async sendViaBusinessAPI(phoneNumber, message, options) {
    try {
      const response = await fetch(`${this.config.businessApiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.businessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        })
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, messageId: result.messages[0].id };
      } else {
        return { success: false, error: result.error.message };
      }

    } catch (error) {
      console.error('Erro Business API:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * TEMPLATES DE MENSAGENS FOMO
   */
  generateFOMOMessage(type, data) {
    const templates = {
      scarcity: `🔥 *ATENÇÃO ${data.userName || 'Amigo'}!*

Vi que você estava interessado no ${data.productName}.

⚠️ *ALERTA: Só restam ${data.stock || '7'} unidades!*
📊 ${data.views || '89'} pessoas viram isso hoje

_Não queria que você perdesse..._

👉 ${data.url}

*Válido apenas hoje*`,

      social_proof: `😱 *TÁ TODO MUNDO COMPRANDO!*

${data.userName || 'Amigo'},

O ${data.productName} está VOANDO!

📈 *Dados em tempo real:*
• ${data.buyers || '31'} compraram nas últimas 3h
• ${data.inCarts || '124'} têm no carrinho agora
• Avaliação: ⭐⭐⭐⭐⭐ (${data.rating || '4.8'})

🎁 *Cupom exclusivo: VOLTA10*

👉 ${data.url}

_PS: ${data.watching || '18'} pessoas estão vendo agora_`,

      discount: `💸 *DESCONTO EXCLUSIVO PRA VOCÊ*

${data.userName || 'Amigo'}, consegui algo especial!

🎁 *Oferta Relâmpago:*
❌ De: ~R$ ${data.originalPrice || '299,90'}~
✅ Por: *R$ ${data.discountPrice || '199,90'}*
💰 Economia: R$ ${data.savings || '100,00'}

⏰ *Válido por: ${data.remaining || '4h23min'}*

📦 + Frete Grátis
🔄 + Parcelamento s/ juros

👉 ${data.url}

*Use o código: ESPECIAL20*`,

      final_warning: `🚨 *URGENTE - ${data.remaining || '1 HORA'} RESTANTE*

${data.userName || 'Amigo'}, é SÉRIO!

⏰ *O link expira em ${data.remaining || '1 HORA'}*

Depois disso:
❌ Preço volta para R$ ${data.originalPrice || '299,90'}
❌ Frete pago
❌ Sem parcelamento

✅ *Garantir agora:* ${data.url}

⚠️ Não vai ter segunda chance!

_${data.recentBuyers || '3'} pessoas compraram enquanto você lia isso_`,

      cart_reminder: `🛒 *VOCÊ ESQUECEU ISSO NO CARRINHO*

${data.userName || 'Amigo'},

O ${data.productName} ainda está te esperando!

💡 *Complete agora e ganhe:*
• Frete grátis
• 5% de desconto extra
• Brindes surpresa

👉 ${data.url}

_Reservamos por mais 2 horas_`
    };

    return templates[type] || templates.scarcity;
  }

  /**
   * ENVIAR CAMPANHA EM MASSA (com throttling)
   */
  async sendBulkCampaign(recipients, messageTemplate, options = {}) {
    const results = {
      sent: 0,
      failed: 0,
      queued: 0,
      errors: []
    };

    // Processar em lotes de 10 para evitar sobrecarga
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(recipient => {
        const message = this.personalizeMessage(messageTemplate, recipient);
        return this.sendMessage(recipient.phone, message, options);
      });

      const batchResults = await Promise.allSettled(promises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            phone: batch[index].phone,
            error: result.reason || result.value.error
          });
        }
      });

      // Aguardar entre lotes para evitar rate limit
      await this.sleep(2000); // 2 segundos entre lotes
    }

    console.log(`📊 Campanha finalizada: ${results.sent} enviados, ${results.failed} falhas`);
    return results;
  }

  /**
   * FUNÇÕES AUXILIARES
   */

  formatPhoneNumber(phone) {
    // Remover caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Adicionar código do país se necessário
    if (!cleaned.startsWith('55') && cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }

    // Formato internacional
    return '+' + cleaned;
  }

  checkRateLimit(phone) {
    const limit = this.rateLimiter.get(phone);
    if (!limit) return true;

    const now = Date.now();
    const minuteAgo = now - 60000;

    // Limpar mensagens antigas
    limit.timestamps = limit.timestamps.filter(t => t > minuteAgo);

    // Verificar se excedeu o limite (30 msgs/min)
    return limit.timestamps.length < 30;
  }

  updateRateLimit(phone) {
    const limit = this.rateLimiter.get(phone) || { timestamps: [] };
    limit.timestamps.push(Date.now());
    this.rateLimiter.set(phone, limit);
  }

  queueMessage(phone, message, options) {
    this.messageQueue.push({ phone, message, options, timestamp: Date.now() });

    // Processar fila depois do delay
    setTimeout(() => this.processQueue(), this.config.retryDelay);

    return { success: false, queued: true };
  }

  async processQueue() {
    if (this.messageQueue.length === 0) return;

    const message = this.messageQueue.shift();
    await this.sendMessage(message.phone, message.message, message.options);

    // Processar próxima mensagem da fila
    if (this.messageQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  personalizeMessage(template, recipient) {
    return template
      .replace(/{nome}/g, recipient.name || 'Amigo')
      .replace(/{produto}/g, recipient.product || 'Produto')
      .replace(/{preco}/g, recipient.price || '99,90')
      .replace(/{link}/g, recipient.url || '#');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * WEBHOOK PARA RECEBER RESPOSTAS
   */
  async setupWebhook(webhookUrl) {
    // Configurar webhook para receber respostas dos usuários
    console.log('📥 Webhook configurado:', webhookUrl);

    // Implementar processamento de respostas
    // Ex: "PARAR" = remover da lista
    // Ex: "COMPRAR" = redirecionar para link
  }

  /**
   * ANALYTICS DE CAMPANHAS
   */
  async getCampaignStats(campaignId) {
    // Retornar estatísticas da campanha
    return {
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      clicked: 0,
      converted: 0,
      revenue: 0
    };
  }
}

// Exportar instância única
export const whatsappAPI = new WhatsAppBusiness();

/**
 * SERVIDOR NODE.JS PARA WHATSAPP-WEB.JS (CRIAR SEPARADAMENTE)
 *
 * Crie um arquivo server-whatsapp.js:
 *
 * ```javascript
 * const express = require('express');
 * const { Client } = require('whatsapp-web.js');
 * const qrcode = require('qrcode-terminal');
 *
 * const app = express();
 * app.use(express.json());
 *
 * const client = new Client();
 *
 * client.on('qr', qr => {
 *   qrcode.generate(qr, { small: true });
 * });
 *
 * client.on('ready', () => {
 *   console.log('✅ WhatsApp conectado!');
 * });
 *
 * client.initialize();
 *
 * app.post('/whatsapp/send', async (req, res) => {
 *   const { phone, message } = req.body;
 *
 *   try {
 *     const chatId = phone.replace('+', '') + '@c.us';
 *     const msg = await client.sendMessage(chatId, message);
 *     res.json({ success: true, messageId: msg.id });
 *   } catch (error) {
 *     res.json({ success: false, error: error.message });
 *   }
 * });
 *
 * app.listen(3001, () => {
 *   console.log('🚀 WhatsApp server rodando na porta 3001');
 * });
 * ```
 *
 * Para instalar:
 * npm install express whatsapp-web.js qrcode-terminal
 *
 * Para rodar:
 * node server-whatsapp.js
 */