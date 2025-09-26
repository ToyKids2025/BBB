// Script de teste do Firebase
const { initializeApp } = require('firebase/app');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDP-2TOFuq_7zB78shhA4AGXvKJ166DYaw",
  authDomain: "afiliador-inteligente.firebaseapp.com",
  projectId: "afiliador-inteligente",
  storageBucket: "afiliador-inteligente.firebasestorage.app",
  messagingSenderId: "215123809953",
  appId: "1:215123809953:web:573e5e71ad1b2d3bb902e0"
};

console.log('🔥 Testando conexão com Firebase...\n');

try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado com sucesso!');
  console.log('📱 App Name:', app.name);
  console.log('🔗 Project ID:', app.options.projectId);
  console.log('🌐 Auth Domain:', app.options.authDomain);

  // Testar Telegram Bot
  console.log('\n🤖 Testando Telegram Bot...');
  const botToken = '8412872348:AAHqvLQyWC2ruzEJf8EzxiAa0rgGTfZqAdM';
  const chatId = '834836872';

  fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        console.log('✅ Telegram Bot conectado!');
        console.log('🤖 Bot Username:', data.result.username);
        console.log('📝 Bot Name:', data.result.first_name);
      } else {
        console.log('❌ Erro no Telegram Bot:', data.description);
      }
    })
    .catch(err => {
      console.log('❌ Erro ao conectar Telegram:', err.message);
    });

  console.log('\n📊 Tags de Afiliado configuradas:');
  console.log('🛒 Amazon: buscabusca0f-20');
  console.log('🏪 Mercado Livre: WA20250726131129');

  console.log('\n✨ Sistema pronto para uso!');

} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}