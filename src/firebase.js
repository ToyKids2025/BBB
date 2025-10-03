import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { detectPlatform, addAffiliateTag } from './config';
import { enhanceLink } from './utils/link-enhancer';

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

// 🔐 CONFIGURAR PERSISTÊNCIA LOCAL (LOGIN PERMANENTE NO CELULAR)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('❌ Erro ao configurar persistência:', error);
});

/**
 * Realiza o login de um usuário com email e senha.
 * @param {string} email - O email do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
// Funções de Autenticação
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Falha na tentativa de login:', error.code, error.message);

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

/**
 * Realiza o logout do usuário atual.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Falha na tentativa de logout:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Salva um novo link no Firestore.
 * @param {object} linkData - Os dados do link a serem salvos.
 * @returns {Promise<{success: boolean, id?: string, link?: object, error?: string}>}
 */
// Funções do Firestore - Links
export const saveLink = async (linkData) => {
  try {
    if (!linkData?.url) {
      return { success: false, error: 'Dados do link inválidos' };
    }

    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 🔥 DETECTAR PLATAFORMA E PROCESSAR LINK COM LINK ENHANCER
    const platform = linkData.platform || detectPlatform(linkData.url);
    const originalUrl = linkData.url; // Salvar URL original

    console.log('🔧 [Firebase] Iniciando processamento de link...');
    console.log('   Original:', originalUrl);
    console.log('   Platform:', platform);

    // PASSO 1: Adicionar tag básica via config.js (fallback)
    let urlWithTag = addAffiliateTag(linkData.url, platform);

    // PASSO 2: Aplicar Link Enhancer (expande amzn.to, /sec/, adiciona OneLink, etc)
    try {
      urlWithTag = await enhanceLink(urlWithTag, platform);
      console.log('✅ [Firebase] Link processado pelo Enhancer!');
      console.log('   Enhanced:', urlWithTag);
    } catch (error) {
      console.error('⚠️ [Firebase] Erro no Link Enhancer, usando fallback:', error);
      // Se falhar, urlWithTag já tem a tag básica do config.js
    }

    const docRef = doc(collection(db, 'links'));
    const linkToSave = {
      ...linkData,
      platform, // Garantir que platform está salvo
      url: urlWithTag, // SALVAR URL COM TAG!
      originalUrl: originalUrl, // Salvar original também
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

    const shortUrl = `${window.location.origin}/r/${docRef.id}`;

    // Botões de ação para o Telegram
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '🔗 Abrir Link', url: shortUrl },
          { text: '📊 Ver no Painel', url: `${window.location.origin}` }
        ]
      ]
    };

    // Enviar notificação Telegram (não-bloqueante)
    sendTelegramNotification(
      `<b>🔗 Novo Link Criado!</b>\n\n` +
      `<b>Título:</b> ${linkData.title || 'Sem título'}\n` +
      `<b>Plataforma:</b> ${linkData.platform}\n` +
      `<b>URL:</b> <code>${shortUrl}</code>`,
      replyMarkup
    ).catch(err => console.log('Erro ao enviar notificação:', err));

    return { success: true, id: docRef.id, link: linkToSave };
  } catch (error) {
    console.error('Falha ao salvar link no Firestore:', error.code, error.message);

    let errorMessage = 'Erro ao salvar link';
    if (error.code === 'permission-denied') {
      errorMessage = 'Sem permissão para salvar links';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporáriamente indisponível';
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Busca todos os links associados ao usuário autenticado.
 * @returns {Promise<{success: boolean, links: Array<object>}>}
 */
export const getLinks = async () => {
  try {
    if (!auth.currentUser) {
      return { success: true, links: [] };
    }

    // Otimização: Usar query do Firestore com o índice configurado em CONFIGURAR-FIREBASE-INDICES.md
    // Isso busca apenas os links do usuário logado, em vez de todos os links do banco.
    // É mais rápido, mais barato e mais escalável.
    const linksRef = collection(db, 'links');
    const q = query(linksRef, where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const links = [];
    snapshot.forEach((doc) => {
      links.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, links };
  } catch (error) {
    console.error('Falha ao buscar links do Firestore:', error.code, error.message);
    // Se for qualquer erro, retornar array vazio para não quebrar a interface
    return { success: true, links: [] };
  }
};

/**
 * Atualiza um link existente no Firestore.
 * @param {string} linkId - O ID do link a ser atualizado.
 * @param {object} dataToUpdate - Os campos a serem atualizados.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateLink = async (linkId, dataToUpdate) => {
  try {
    if (!auth.currentUser) return { success: false, error: 'Usuário não autenticado' };

    const linkRef = doc(db, 'links', linkId);
    // Adicionar verificação de permissão seria ideal aqui, mas as regras do Firestore já protegem.
    await updateDoc(linkRef, dataToUpdate);

    return { success: true };
  } catch (error) {
    console.error('Falha ao atualizar link:', error.code, error.message);
    return { success: false, error: 'Não foi possível atualizar o link.' };
  }
};

/**
 * Deleta um link do Firestore.
 * @param {string} linkId - O ID do link a ser deletado.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteLink = async (linkId) => {
  try {
    if (!auth.currentUser) return { success: false, error: 'Usuário não autenticado' };

    const linkRef = doc(db, 'links', linkId);
    // Adicionar verificação de permissão seria ideal aqui, mas as regras do Firestore já protegem.
    await deleteDoc(linkRef);

    return { success: true };
  } catch (error) {
    console.error('Falha ao deletar link:', error.code, error.message);
    return { success: false, error: 'Não foi possível deletar o link.' };
  }
};

/**
 * Incrementa a contagem de cliques de um link.
 * @param {string} linkId - O ID do documento do link no Firestore.
 * @returns {Promise<{success: boolean, clicks?: number, error?: string}>}
 */
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

    // Notificação de marco de 100 cliques
    if (newClicks === 100) {
      const linkData = linkDoc.data();
      const milestoneReplyMarkup = {
        inline_keyboard: [
          [{ text: '📊 Ver Analytics do Link', url: `${window.location.origin}` }]
        ]
      };
      sendTelegramNotification(
        `<b>🎉 Marco Atingido!</b>\n\n` +
        `O link "<b>${linkData.title || 'Sem título'}</b>" alcançou <b>100 cliques</b>!`,
        milestoneReplyMarkup
      ).catch(err => console.log('Erro ao enviar notificação de marco:', err));
    }

    return { success: true, clicks: newClicks };
  } catch (error) {
    console.error('Falha ao atualizar cliques do link:', error.code, error.message);

    // Não falhar silenciosamente - registrar o erro mas continuar
    if (error.code === 'permission-denied') {
      return { success: false, error: 'Sem permissão para atualizar' };
    }

    return { success: false, error: 'Erro ao registrar click' };
  }
};

/**
 * Registra um evento de conversão no Analytics e no Firestore.
 * @param {string} linkId - O ID do link que gerou a conversão.
 * @param {number} value - O valor da conversão.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
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

    // Buscar dados do link para notificação mais rica
    const linkRef = doc(db, 'links', linkId);
    const linkDoc = await getDoc(linkRef);
    const linkData = linkDoc.exists() ? linkDoc.data() : null;

    const notificationTitle = linkData ? `\n<b>Link:</b> ${linkData.title || 'Sem título'}` : '';
    const notificationPlatform = linkData ? `\n<b>Plataforma:</b> ${linkData.platform}` : '';

    // Salvar conversão no Firestore
    await setDoc(doc(collection(db, 'conversions')), {
      linkId,
      value,
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid
    });

    // Botões de ação para o Telegram
    const conversionReplyMarkup = {
      inline_keyboard: [
        [{ text: '📈 Ver Analytics', url: `${window.location.origin}` }]
      ]
    };

    // Notificar no Telegram
    await sendTelegramNotification(
      `<b>💰 NOVA CONVERSÃO!</b>\n\n` +
      `<b>Valor:</b> R$ ${value.toFixed(2)}` +
      `${notificationTitle}${notificationPlatform}`,
      conversionReplyMarkup
    );

    return { success: true };
  } catch (error) {
    console.error('Falha ao rastrear conversão:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Busca dados agregados de analytics para o dashboard.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
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

    // Otimização: Usar queries do Firestore para buscar apenas dados do usuário.
    const linksQuery = query(collection(db, 'links'), where("userId", "==", userId));
    const conversionsQuery = query(collection(db, 'conversions'), where("userId", "==", userId));

    // Executar as queries em paralelo para melhor performance
    const [linksSnapshot, conversionsSnapshot] = await Promise.all([
      getDocs(linksQuery),
      getDocs(conversionsQuery)
    ]);

    // Calcular métricas
    let totalClicks = 0;
    const totalLinks = linksSnapshot.size;

    linksSnapshot.forEach((doc) => {
      totalClicks += doc.data().clicks || 0;
    });

    let totalRevenue = 0;
    const totalConversions = conversionsSnapshot.size;

    conversionsSnapshot.forEach((doc) => {
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
    console.error('Falha ao buscar dados de analytics:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envia uma mensagem de notificação para um chat do Telegram.
 * @param {string} message A mensagem a ser enviada.
 * @param {object|null} replyMarkup O objeto de teclado inline (opcional).
 * @returns {Promise<object|null>}
 */
// Telegram Notifications
const sendTelegramNotification = async (message, replyMarkup = null) => {
  const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

  // Verificar se as credenciais existem
  if (!botToken || !chatId) {
    console.log('Telegram não configurado');
    return null;
  }

  const body = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
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

/**
 * Monitora o estado de autenticação do usuário.
 * @param {function} callback - A função a ser chamada quando o estado de auth mudar.
 * @returns {import('firebase/auth').Unsubscribe}
 */
// Monitor de Auth State
export const monitorAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Exportar funções específicas se necessário em outros locais
export { sendTelegramNotification };

export default app;