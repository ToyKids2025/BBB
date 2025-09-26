// Teste de notificação Telegram
const botToken = '8412872348:AAHqvLQyWC2ruzEJf8EzxiAa0rgGTfZqAdM';
const chatId = '834836872';

async function sendTestNotification() {
  console.log('📤 Enviando notificação de teste para o Telegram...\n');

  const message = `🚀 <b>SISTEMA BBB ATUALIZADO!</b>

✅ Firebase integrado
✅ Firestore configurado
✅ Analytics funcionando
✅ Telegram Bot ativo
✅ Tags de afiliado OK

🛒 Amazon: <code>buscabusca0f-20</code>
🏪 ML: <code>WA20250726131129</code>

⚡ Sistema 100% operacional!
🔒 Segurança implementada
📊 Dados na nuvem

Acesse: http://localhost:3000`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Notificação enviada com sucesso!');
      console.log('📱 Verifique seu Telegram!');
      console.log('\n💬 Mensagem enviada para o chat:', chatId);
    } else {
      console.log('❌ Erro ao enviar:', data.description);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

sendTestNotification();