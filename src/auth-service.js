import { auth, loginUser, logoutUser, monitorAuthState } from './firebase';
import { sendTelegramNotification } from './firebase';

// Configuração de autenticação segura
export const AUTH_SERVICE = {
  // Email autorizado (você pode criar no Firebase Console)
  AUTHORIZED_EMAIL: 'alexandre@bbbrasil.com',

  // Validar login
  login: async (email, password) => {
    try {
      // Tentar fazer login no Firebase
      const result = await loginUser(email, password);

      if (result.success) {
        // Notificar login no Telegram
        await sendTelegramNotification(
          `🔐 <b>Login realizado</b>\n` +
          `📧 Email: ${email}\n` +
          `🕐 Hora: ${new Date().toLocaleString('pt-BR')}\n` +
          `📍 IP: ${await getIpAddress()}`
        );

        // Salvar dados do usuário
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Alexandre',
          lastLogin: new Date().toISOString()
        };

        localStorage.setItem('bb_user', JSON.stringify(userData));

        return {
          success: true,
          user: userData
        };
      }

      return {
        success: false,
        error: result.error || 'Falha no login'
      };
    } catch (error) {
      console.error('Erro no login:', error);

      // Notificar tentativa de login falhada
      await sendTelegramNotification(
        `⚠️ <b>Tentativa de login falhada</b>\n` +
        `📧 Email: ${email}\n` +
        `🕐 Hora: ${new Date().toLocaleString('pt-BR')}`
      );

      return {
        success: false,
        error: 'Email ou senha incorretos'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await logoutUser();
      localStorage.removeItem('bb_user');
      localStorage.removeItem('bb_token');
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return auth.currentUser !== null;
  },

  // Obter usuário atual
  getCurrentUser: () => {
    if (auth.currentUser) {
      return {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || 'Alexandre'
      };
    }

    const savedUser = localStorage.getItem('bb_user');
    return savedUser ? JSON.parse(savedUser) : null;
  },

  // Monitor de estado de autenticação
  onAuthStateChange: (callback) => {
    return monitorAuthState(callback);
  }
};

// Função auxiliar para obter IP
async function getIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Desconhecido';
  }
}

// Função para criar primeiro usuário (executar apenas uma vez)
export const createFirstUser = async () => {
  // Esta função deve ser executada manualmente no console do navegador
  // para criar o primeiro usuário no Firebase
  console.log(`
    Para criar seu usuário no Firebase:

    1. Acesse: https://console.firebase.google.com
    2. Vá para Authentication > Users
    3. Clique em "Add user"
    4. Email: alexandre@bbbrasil.com
    5. Senha: (crie uma senha forte)

    Ou execute no console:

    import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, 'alexandre@bbbrasil.com', 'SUA_SENHA_FORTE')
      .then((userCredential) => {
        console.log('Usuário criado:', userCredential.user);
      })
      .catch((error) => {
        console.error('Erro:', error);
      });
  `);
};

export default AUTH_SERVICE;