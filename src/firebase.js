import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Funções de Autenticação
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no login:', error);

    // Mensagens de erro mais amigáveis
    let errorMessage = 'Erro ao fazer login';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Usuário não encontrado';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Senha incorreta';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Aguarde um momento';
    }

    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: error.message };
  }
};

// Funções do Firestore - Links
export const saveLink = async (linkData) => {
  try {
    if (!linkData || !linkData.url) {
      return { success: false, error: 'Dados do link inválidos' };
    }

    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const docRef = doc(collection(db, 'links'));
    const linkToSave = {
      ...linkData,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser.uid,
      clicks: linkData.clicks || 0
    };

    await setDoc(docRef, linkToSave);

    // Log analytics com try-catch separado
    try {
      if (analytics) {
        logEvent(analytics, 'link_created', {
          platform: linkData.platform,
          user_id: auth.currentUser.uid
        });
      }
    } catch (analyticsError) {
      console.log('Erro ao registrar analytics:', analyticsError);
      // Não falhar a operação por causa do analytics
    }

    // Enviar notificação Telegram (não-bloqueante)
    sendTelegramNotification(
      `🔗 Novo link criado!\n` +
      `Plataforma: ${linkData.platform}\n` +
      `Título: ${linkData.title || 'Sem título'}`
    ).catch(err => console.log('Erro ao enviar notificação:', err));

    return { success: true, id: docRef.id, link: linkToSave };
  } catch (error) {
    console.error('Erro ao salvar link:', error);

    let errorMessage = 'Erro ao salvar link';
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar links';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporáriamente indisponível';
    }

    return { success: false, error: errorMessage };
  }
};

export const getLinks = async () => {
  try {
    if (!auth.currentUser) {
      return { success: true, links: [] };
    }

    // Buscar links sem query complexa para evitar erro de índice
    const linksRef = collection(db, 'links');
    const snapshot = await getDocs(linksRef);

    const links = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar apenas links do usuário atual
      if (data.userId === auth.currentUser.uid) {
        links.push({ id: doc.id, ...data });
      }
    });

    // Ordenar manualmente por data
    links.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return { success: true, links };
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    // Se for qualquer erro, retornar array vazio para não quebrar a interface
    return { success: true, links: [] };
  }
};

export const updateLinkClick = async (linkId) => {
  try {
    if (!linkId) {
      return { success: false, error: 'ID do link inválido' };
    }

    const linkRef = doc(db, 'links', linkId);
    const linkDoc = await getDoc(linkRef);

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link não encontrado' };
    }

    const currentClicks = linkDoc.data().clicks || 0;
    const newClicks = currentClicks + 1;

    await updateDoc(linkRef, {
      clicks: newClicks,
      lastClickedAt: new Date().toISOString()
    });

    // Log analytics (não-bloqueante)
    try {
      if (analytics) {
        logEvent(analytics, 'link_clicked', {
          link_id: linkId,
          platform: linkDoc.data().platform,
          total_clicks: newClicks
        });
      }
    } catch (analyticsError) {
      console.log('Erro ao registrar click no analytics:', analyticsError);
    }

    return { success: true, clicks: newClicks };
  } catch (error) {
    console.error('Erro ao atualizar clicks:', error);

    // Não falhar silenciosamente - registrar o erro mas continuar
    if (error.code === 'permission-denied') {
      return { success: false, error: 'Sem permissão para atualizar' };
    }

    return { success: false, error: 'Erro ao registrar click' };
  }
};

// Funções de Analytics
export const trackConversion = async (linkId, value) => {
  try {
    if (analytics) {
      logEvent(analytics, 'conversion', {
        link_id: linkId,
        value: value,
        currency: 'BRL'
      });
    }

    // Salvar conversão no Firestore
    await setDoc(doc(collection(db, 'conversions')), {
      linkId,
      value,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid
    });

    // Notificar no Telegram
    await sendTelegramNotification(`💰 CONVERSÃO!\nValor: R$ ${value.toFixed(2)}\nLink ID: ${linkId}`);

    return { success: true };
  } catch (error) {
    console.error('Erro ao rastrear conversão:', error);
    return { success: false, error: error.message };
  }
};

export const getAnalyticsData = async () => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      return {
        success: true,
        data: {
          totalLinks: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0
        }
      };
    }

    // Buscar links sem query complexa
    let linksSnapshot = { docs: [] };
    try {
      const linksRef = collection(db, 'links');
      const allLinks = await getDocs(linksRef);
      const userLinks = [];

      if (allLinks && allLinks.forEach) {
        allLinks.forEach((doc) => {
          if (doc.data().userId === userId) {
            userLinks.push(doc);
          }
        });
      }

      linksSnapshot = { docs: userLinks };
    } catch (e) {
      console.log('Erro ao buscar links para analytics:', e.message);
      linksSnapshot = { docs: [] };
    }

    // Buscar conversões sem query complexa
    let conversionsSnapshot = { docs: [] };
    try {
      const conversionsRef = collection(db, 'conversions');
      const allConversions = await getDocs(conversionsRef);
      const userConversions = [];

      if (allConversions && allConversions.forEach) {
        allConversions.forEach((doc) => {
          if (doc.data().userId === userId) {
            userConversions.push(doc);
          }
        });
      }

      conversionsSnapshot = { docs: userConversions };
    } catch (e) {
      console.log('Erro ao buscar conversões:', e.message);
      conversionsSnapshot = { docs: [] };
    }

    // Calcular métricas
    let totalClicks = 0;
    let totalLinks = 0;

    if (linksSnapshot.docs && Array.isArray(linksSnapshot.docs)) {
      linksSnapshot.docs.forEach((doc) => {
        totalLinks++;
        totalClicks += doc.data().clicks || 0;
      });
    }

    let totalRevenue = 0;
    let totalConversions = 0;

    if (conversionsSnapshot.docs && Array.isArray(conversionsSnapshot.docs)) {
      conversionsSnapshot.docs.forEach((doc) => {
        totalConversions++;
        totalRevenue += doc.data().value || 0;
      });
    }

    return {
      success: true,
      data: {
        totalLinks,
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0
      }
    };
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return { success: false, error: error.message };
  }
};

// Telegram Notifications
const sendTelegramNotification = async (message) => {
  const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

  // Verificar se as credenciais existem
  if (!botToken || !chatId) {
    console.log('Telegram não configurado');
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();

    if (!result.ok) {
      console.log('Erro na resposta do Telegram:', result.description);
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar notificação Telegram:', error);
    // Não lançar erro - apenas registrar
    return null;
  }
};

// Monitor de Auth State
export const monitorAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Exportar função de notificação Telegram
export { sendTelegramNotification };

export default app;