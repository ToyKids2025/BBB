import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDP-2TOFuq_7zB78shhA4AGXvKJ166DYaw",
  authDomain: "afiliador-inteligente.firebaseapp.com",
  projectId: "afiliador-inteligente",
  storageBucket: "afiliador-inteligente.firebasestorage.app",
  messagingSenderId: "215123809953",
  appId: "1:215123809953:web:573e5e71ad1b2d3bb902e0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Funções de Autenticação
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
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
    const docRef = doc(collection(db, 'links'));
    await setDoc(docRef, {
      ...linkData,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid
    });

    // Log analytics
    if (analytics) {
      logEvent(analytics, 'link_created', {
        platform: linkData.platform,
        user_id: auth.currentUser?.uid
      });
    }

    // Enviar notificação Telegram
    await sendTelegramNotification(`🔗 Novo link criado!\nPlataforma: ${linkData.platform}\nTítulo: ${linkData.title || 'Sem título'}`);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar link:', error);
    return { success: false, error: error.message };
  }
};

export const getLinks = async () => {
  try {
    const q = query(
      collection(db, 'links'),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const links = [];
    snapshot.forEach((doc) => {
      links.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, links };
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    return { success: false, error: error.message };
  }
};

export const updateLinkClick = async (linkId) => {
  try {
    const linkRef = doc(db, 'links', linkId);
    const linkDoc = await getDoc(linkRef);

    if (linkDoc.exists()) {
      const currentClicks = linkDoc.data().clicks || 0;
      await updateDoc(linkRef, {
        clicks: currentClicks + 1,
        lastClickedAt: new Date().toISOString()
      });

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'link_clicked', {
          link_id: linkId,
          platform: linkDoc.data().platform
        });
      }

      return { success: true };
    }
    return { success: false, error: 'Link não encontrado' };
  } catch (error) {
    console.error('Erro ao atualizar clicks:', error);
    return { success: false, error: error.message };
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

    // Buscar links
    const linksQuery = query(
      collection(db, 'links'),
      where('userId', '==', userId)
    );
    const linksSnapshot = await getDocs(linksQuery);

    // Buscar conversões
    const conversionsQuery = query(
      collection(db, 'conversions'),
      where('userId', '==', userId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);

    // Calcular métricas
    let totalClicks = 0;
    let totalLinks = 0;
    linksSnapshot.forEach((doc) => {
      totalLinks++;
      totalClicks += doc.data().clicks || 0;
    });

    let totalRevenue = 0;
    let totalConversions = 0;
    conversionsSnapshot.forEach((doc) => {
      totalConversions++;
      totalRevenue += doc.data().value || 0;
    });

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
  const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '8412872348:AAHqvLQyWC2ruzEJf8EzxiAa0rgGTfZqAdM';
  const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID || '834836872';

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

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar notificação Telegram:', error);
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