/**
 * 📱 FIREBASE INSTAGRAM - Funções do Firestore para Instagram Automation
 *
 * Gerencia as collections:
 * - instagram_products: Produtos extraídos
 * - instagram_posts: Posts criados/agendados/publicados
 * - instagram_settings: Configurações do usuário
 * - instagram_analytics_daily: Métricas diárias
 * - product_cache: Cache de scraping
 *
 * @version 1.0.0
 * @author BuscaBusca Brasil
 */

import { db, auth } from '../../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// ==================== INSTAGRAM PRODUCTS ====================

/**
 * 📦 Salvar produto extraído no Firestore
 *
 * @param {Object} productData - Dados do produto (do scraper)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 *
 * @example
 * const result = await saveInstagramProduct({
 *   title: 'Notebook Gamer',
 *   price: 3499.90,
 *   images: ['url1', 'url2'],
 *   platform: 'mercadolivre',
 *   sourceUrl: 'https://...'
 * });
 */
export async function saveInstagramProduct(productData) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const docRef = doc(collection(db, 'instagram_products'));

    const product = {
      ...productData,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now(),
      lastUsedAt: null, // Quando foi usado em um post
      usageCount: 0 // Quantas vezes foi usado
    };

    await setDoc(docRef, product);

    console.log('✅ [Instagram] Produto salvo:', docRef.id);

    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao salvar produto:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📋 Buscar produtos do usuário
 *
 * @param {Object} options - Opções de filtragem
 * @param {string} options.platform - Filtrar por plataforma
 * @param {number} options.limitCount - Limite de resultados (padrão: 50)
 * @returns {Promise<{success: boolean, products?: Array, error?: string}>}
 */
export async function getInstagramProducts({ platform = null, limitCount = 50 } = {}) {
  try {
    if (!auth.currentUser) {
      return { success: true, products: [] };
    }

    const productsRef = collection(db, 'instagram_products');
    let q = query(
      productsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Filtrar por plataforma se especificado
    if (platform) {
      q = query(q, where('platform', '==', platform));
    }

    // Aplicar limite
    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    const products = [];

    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      });
    });

    console.log(`✅ [Instagram] ${products.length} produtos encontrados`);

    return { success: true, products };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar produtos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🗑️ Deletar produto
 */
export async function deleteInstagramProduct(productId) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const productRef = doc(db, 'instagram_products', productId);
    await deleteDoc(productRef);

    console.log('✅ [Instagram] Produto deletado:', productId);

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao deletar produto:', error);
    return { success: false, error: error.message };
  }
}

// ==================== INSTAGRAM POSTS ====================

/**
 * 📝 Criar novo post (draft)
 *
 * @param {Object} postData - Dados do post
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 *
 * @example
 * const result = await createInstagramPost({
 *   productId: 'ABC123',
 *   caption: 'Confira esta oferta incrível!',
 *   hashtags: ['#ofertas', '#mercadolivre'],
 *   template: 'moderno',
 *   status: 'draft'
 * });
 */
export async function createInstagramPost(postData) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const docRef = doc(collection(db, 'instagram_posts'));

    const post = {
      ...postData,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: postData.status || 'draft', // draft, scheduled, publishing, published, failed
      publishedAt: null,
      scheduledFor: postData.scheduledFor ? Timestamp.fromDate(new Date(postData.scheduledFor)) : null,
      instagramPostId: null, // ID do post no Instagram (após publicar)
      imageUrl: null, // URL da imagem gerada (Firebase Storage)
      error: null // Mensagem de erro se falhar
    };

    await setDoc(docRef, post);

    console.log('✅ [Instagram] Post criado:', docRef.id);

    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao criar post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📋 Buscar posts do usuário
 *
 * @param {Object} options - Opções de filtragem
 * @param {string} options.status - Filtrar por status (draft, scheduled, published)
 * @param {number} options.limitCount - Limite de resultados
 * @returns {Promise<{success: boolean, posts?: Array, error?: string}>}
 */
export async function getInstagramPosts({ status = null, limitCount = 100 } = {}) {
  try {
    if (!auth.currentUser) {
      return { success: true, posts: [] };
    }

    const postsRef = collection(db, 'instagram_posts');
    let q = query(
      postsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Filtrar por status se especificado
    if (status) {
      q = query(q, where('status', '==', status));
    }

    // Aplicar limite
    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        publishedAt: data.publishedAt?.toDate()?.toISOString() || null,
        scheduledFor: data.scheduledFor?.toDate()?.toISOString() || null
      });
    });

    console.log(`✅ [Instagram] ${posts.length} posts encontrados`);

    return { success: true, posts };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar posts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ✏️ Atualizar post
 *
 * @param {string} postId - ID do post
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateInstagramPost(postId, updates) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const postRef = doc(db, 'instagram_posts', postId);

    await updateDoc(postRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    console.log('✅ [Instagram] Post atualizado:', postId);

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao atualizar post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🗑️ Deletar post
 */
export async function deleteInstagramPost(postId) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const postRef = doc(db, 'instagram_posts', postId);
    await deleteDoc(postRef);

    console.log('✅ [Instagram] Post deletado:', postId);

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao deletar post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📅 Buscar posts agendados (para cron job)
 *
 * @returns {Promise<{success: boolean, posts?: Array, error?: string}>}
 */
export async function getScheduledPosts() {
  try {
    if (!auth.currentUser) {
      return { success: true, posts: [] };
    }

    const postsRef = collection(db, 'instagram_posts');
    const now = Timestamp.now();

    // Buscar posts agendados para NOW ou antes
    const q = query(
      postsRef,
      where('userId', '==', auth.currentUser.uid),
      where('status', '==', 'scheduled'),
      where('scheduledFor', '<=', now)
    );

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        scheduledFor: data.scheduledFor?.toDate()?.toISOString()
      });
    });

    console.log(`✅ [Instagram] ${posts.length} posts agendados prontos para publicar`);

    return { success: true, posts };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar posts agendados:', error);
    return { success: false, error: error.message };
  }
}

// ==================== INSTAGRAM SETTINGS ====================

/**
 * ⚙️ Salvar configurações do Instagram
 *
 * @param {Object} settings - Configurações
 * @returns {Promise<{success: boolean, error?: string}>}
 *
 * @example
 * await saveInstagramSettings({
 *   accessToken: 'encrypted-token',
 *   instagramAccountId: '123456789',
 *   postsPerDay: 5,
 *   publishHours: [9, 12, 15, 18, 21],
 *   defaultTemplate: 'moderno',
 *   defaultTone: 'entusiasta'
 * });
 */
export async function saveInstagramSettings(settings) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const settingsRef = doc(db, 'instagram_settings', auth.currentUser.uid);

    const settingsData = {
      ...settings,
      userId: auth.currentUser.uid,
      updatedAt: Timestamp.now()
    };

    await setDoc(settingsRef, settingsData, { merge: true });

    console.log('✅ [Instagram] Configurações salvas');

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao salvar configurações:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ⚙️ Buscar configurações do Instagram
 *
 * @returns {Promise<{success: boolean, settings?: Object, error?: string}>}
 */
export async function getInstagramSettings() {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const settingsRef = doc(db, 'instagram_settings', auth.currentUser.uid);
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      // Retornar configurações padrão
      return {
        success: true,
        settings: {
          accessToken: null,
          instagramAccountId: null,
          postsPerDay: 5,
          publishHours: [9, 12, 15, 18, 21],
          defaultTemplate: 'moderno',
          defaultTone: 'entusiasta',
          autoHashtags: true,
          useAI: false
        }
      };
    }

    const settings = settingsDoc.data();

    console.log('✅ [Instagram] Configurações carregadas');

    return { success: true, settings };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar configurações:', error);
    return { success: false, error: error.message };
  }
}

// ==================== INSTAGRAM ANALYTICS ====================

/**
 * 📊 Salvar analytics diário
 *
 * @param {Object} analyticsData - Dados de analytics
 * @returns {Promise<{success: boolean, error?: string}>}
 *
 * @example
 * await saveInstagramAnalytics({
 *   date: '2025-10-13',
 *   postId: 'ABC123',
 *   likes: 150,
 *   comments: 25,
 *   shares: 10,
 *   reach: 5000,
 *   impressions: 8000,
 *   engagement: 3.7
 * });
 */
export async function saveInstagramAnalytics(analyticsData) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const docRef = doc(collection(db, 'instagram_analytics_daily'));

    const analytics = {
      ...analyticsData,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now()
    };

    await setDoc(docRef, analytics);

    console.log('✅ [Instagram] Analytics salvo');

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao salvar analytics:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📊 Buscar analytics por período
 *
 * @param {Object} options - Opções de filtragem
 * @param {string} options.startDate - Data inicial (YYYY-MM-DD)
 * @param {string} options.endDate - Data final (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, analytics?: Array, error?: string}>}
 */
export async function getInstagramAnalytics({ startDate, endDate } = {}) {
  try {
    if (!auth.currentUser) {
      return { success: true, analytics: [] };
    }

    const analyticsRef = collection(db, 'instagram_analytics_daily');
    let q = query(
      analyticsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    // Filtrar por período se especificado
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const snapshot = await getDocs(q);
    const analytics = [];

    snapshot.forEach((doc) => {
      analytics.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ [Instagram] ${analytics.length} registros de analytics encontrados`);

    return { success: true, analytics };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar analytics:', error);
    return { success: false, error: error.message };
  }
}

// ==================== PRODUCT CACHE ====================

/**
 * 💾 Salvar no cache de produtos
 *
 * @param {string} url - URL do produto
 * @param {Object} productData - Dados extraídos
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveProductCache(url, productData) {
  try {
    // Usar URL como ID do documento para fácil lookup
    const cacheRef = doc(db, 'product_cache', btoa(url).substring(0, 100)); // Base64 da URL

    const cache = {
      url,
      data: productData,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000) // 24h
    };

    await setDoc(cacheRef, cache);

    console.log('✅ [Instagram] Cache de produto salvo');

    return { success: true };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao salvar cache:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 💾 Buscar do cache de produtos
 *
 * @param {string} url - URL do produto
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getProductCache(url) {
  try {
    const cacheRef = doc(db, 'product_cache', btoa(url).substring(0, 100));
    const cacheDoc = await getDoc(cacheRef);

    if (!cacheDoc.exists()) {
      return { success: false, error: 'Cache não encontrado' };
    }

    const cache = cacheDoc.data();

    // Verificar se expirou
    const now = Timestamp.now();
    if (cache.expiresAt.toMillis() < now.toMillis()) {
      console.log('⏰ [Instagram] Cache expirado');
      // Deletar cache expirado
      await deleteDoc(cacheRef);
      return { success: false, error: 'Cache expirado' };
    }

    console.log('✅ [Instagram] Cache de produto encontrado');

    return { success: true, data: cache.data };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar cache:', error);
    return { success: false, error: error.message };
  }
}

// ==================== EXPORTAR FUNÇÕES ====================

export default {
  // Products
  saveInstagramProduct,
  getInstagramProducts,
  deleteInstagramProduct,

  // Posts
  createInstagramPost,
  getInstagramPosts,
  updateInstagramPost,
  deleteInstagramPost,
  getScheduledPosts,

  // Settings
  saveInstagramSettings,
  getInstagramSettings,

  // Analytics
  saveInstagramAnalytics,
  getInstagramAnalytics,

  // Cache
  saveProductCache,
  getProductCache
};
