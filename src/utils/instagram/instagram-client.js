/**
 * 📱 INSTAGRAM CLIENT - Cliente para Instagram Graph API
 *
 * Funções:
 * - Autenticação OAuth
 * - Publicação de posts
 * - Upload de imagens
 * - Renovação de token
 * - Buscar métricas
 *
 * @version 1.0.0
 * @author BuscaBusca Brasil
 */

import axios from 'axios';

// Configurações da API
const INSTAGRAM_API_BASE = 'https://graph.instagram.com';
const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * 🔐 PASSO 1: Gerar URL de autenticação OAuth
 *
 * @param {string} appId - ID do app do Facebook
 * @param {string} redirectUri - URL de redirect (https://buscabuscabrasil.com.br/auth/instagram)
 * @returns {string} URL de autenticação
 *
 * @example
 * const authUrl = getAuthorizationUrl('123456789', 'https://buscabuscabrasil.com.br/auth/instagram');
 * window.location.href = authUrl;
 */
export function getAuthorizationUrl(appId, redirectUri) {
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'business_management'
  ].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code'
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * 🔐 PASSO 2: Trocar código por Access Token
 *
 * @param {string} code - Código de autorização (da URL callback)
 * @param {string} appId - ID do app
 * @param {string} appSecret - Secret do app
 * @param {string} redirectUri - URL de redirect
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
export async function exchangeCodeForToken(code, appId, appSecret, redirectUri) {
  console.log('🔐 [Instagram] Trocando código por token...');

  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/oauth/access_token`, {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code
      }
    });

    console.log('✅ [Instagram] Token obtido!');

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao trocar código:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Erro ao obter token');
  }
}

/**
 * 🔐 PASSO 3: Converter token de curta duração para longa duração (60 dias)
 *
 * @param {string} shortLivedToken - Token de curta duração
 * @param {string} appId - ID do app
 * @param {string} appSecret - Secret do app
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
export async function getLongLivedToken(shortLivedToken, appId, appSecret) {
  console.log('🔐 [Instagram] Convertendo para token de longa duração...');

  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    console.log('✅ [Instagram] Token de longa duração obtido! (válido por 60 dias)');

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in // 5184000 segundos = 60 dias
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao obter token de longa duração:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Erro ao renovar token');
  }
}

/**
 * 📱 PASSO 4: Buscar Instagram Business Account ID
 *
 * @param {string} accessToken - Access token do usuário
 * @returns {Promise<{instagramAccountId: string, username: string}>}
 */
export async function getInstagramAccountId(accessToken) {
  console.log('📱 [Instagram] Buscando Instagram Account ID...');

  try {
    // 1. Buscar Facebook Pages do usuário
    const pagesResponse = await axios.get(`${FACEBOOK_API_BASE}/me/accounts`, {
      params: {
        access_token: accessToken
      }
    });

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      throw new Error('Nenhuma página do Facebook encontrada. Você precisa ter uma Página conectada ao Instagram.');
    }

    const page = pagesResponse.data.data[0]; // Usar primeira página
    const pageId = page.id;
    const pageAccessToken = page.access_token;

    // 2. Buscar Instagram Business Account vinculado à página
    const igResponse = await axios.get(`${FACEBOOK_API_BASE}/${pageId}`, {
      params: {
        fields: 'instagram_business_account',
        access_token: pageAccessToken
      }
    });

    const instagramAccountId = igResponse.data.instagram_business_account?.id;

    if (!instagramAccountId) {
      throw new Error('Nenhuma conta Instagram Business encontrada. Certifique-se de ter uma conta Business vinculada à sua Página do Facebook.');
    }

    // 3. Buscar username do Instagram
    const usernameResponse = await axios.get(`${FACEBOOK_API_BASE}/${instagramAccountId}`, {
      params: {
        fields: 'username',
        access_token: pageAccessToken
      }
    });

    console.log('✅ [Instagram] Conta encontrada:', usernameResponse.data.username);

    return {
      instagramAccountId,
      username: usernameResponse.data.username,
      pageAccessToken // Salvar para uso futuro
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar account ID:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

/**
 * 📤 PUBLICAR POST NO INSTAGRAM
 *
 * Fluxo de 2 etapas:
 * 1. Criar container de mídia (upload imagem)
 * 2. Publicar container
 *
 * @param {Object} postData - Dados do post
 * @param {string} postData.imageUrl - URL pública da imagem (Firebase Storage)
 * @param {string} postData.caption - Legenda do post
 * @param {string} postData.instagramAccountId - ID da conta Instagram
 * @param {string} postData.accessToken - Access token
 * @returns {Promise<{success: boolean, postId?: string, error?: string}>}
 */
export async function publishInstagramPost({ imageUrl, caption, instagramAccountId, accessToken }) {
  console.log('📤 [Instagram] Iniciando publicação de post...');

  try {
    // ETAPA 1: Criar container de mídia
    console.log('📤 [Instagram] Etapa 1/2: Criando container de mídia...');

    const containerResponse = await axios.post(
      `${INSTAGRAM_API_BASE}/${instagramAccountId}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        }
      }
    );

    const containerId = containerResponse.data.id;
    console.log('✅ [Instagram] Container criado:', containerId);

    // ETAPA 2: Publicar container (aguardar alguns segundos)
    console.log('📤 [Instagram] Etapa 2/2: Aguardando processamento...');
    await sleep(5000); // Esperar 5 segundos para Instagram processar

    console.log('📤 [Instagram] Publicando post...');

    const publishResponse = await axios.post(
      `${INSTAGRAM_API_BASE}/${instagramAccountId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken
        }
      }
    );

    const postId = publishResponse.data.id;
    console.log('✅ [Instagram] Post publicado com sucesso!', postId);

    return {
      success: true,
      postId: postId
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao publicar post:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * 📊 BUSCAR MÉTRICAS DE UM POST
 *
 * @param {string} postId - ID do post no Instagram
 * @param {string} accessToken - Access token
 * @returns {Promise<{likes: number, comments: number, shares: number, reach: number, impressions: number}>}
 */
export async function getPostMetrics(postId, accessToken) {
  console.log('📊 [Instagram] Buscando métricas do post:', postId);

  try {
    const response = await axios.get(
      `${INSTAGRAM_API_BASE}/${postId}/insights`,
      {
        params: {
          metric: 'engagement,impressions,reach,saved',
          access_token: accessToken
        }
      }
    );

    const metrics = {};
    response.data.data.forEach((item) => {
      metrics[item.name] = item.values[0].value;
    });

    // Buscar likes e comments separadamente
    const postResponse = await axios.get(
      `${INSTAGRAM_API_BASE}/${postId}`,
      {
        params: {
          fields: 'like_count,comments_count',
          access_token: accessToken
        }
      }
    );

    console.log('✅ [Instagram] Métricas obtidas');

    return {
      likes: postResponse.data.like_count || 0,
      comments: postResponse.data.comments_count || 0,
      engagement: metrics.engagement || 0,
      impressions: metrics.impressions || 0,
      reach: metrics.reach || 0,
      saved: metrics.saved || 0
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar métricas:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Erro ao buscar métricas');
  }
}

/**
 * 📊 BUSCAR POSTS RECENTES DA CONTA
 *
 * @param {string} instagramAccountId - ID da conta Instagram
 * @param {string} accessToken - Access token
 * @param {number} limit - Número de posts (padrão: 25)
 * @returns {Promise<Array<{id: string, caption: string, timestamp: string, media_url: string}>>}
 */
export async function getRecentPosts(instagramAccountId, accessToken, limit = 25) {
  console.log('📊 [Instagram] Buscando posts recentes...');

  try {
    const response = await axios.get(
      `${INSTAGRAM_API_BASE}/${instagramAccountId}/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          limit: limit,
          access_token: accessToken
        }
      }
    );

    console.log(`✅ [Instagram] ${response.data.data.length} posts encontrados`);

    return response.data.data;

  } catch (error) {
    console.error('❌ [Instagram] Erro ao buscar posts:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Erro ao buscar posts');
  }
}

/**
 * 🔄 RENOVAR TOKEN ANTES DE EXPIRAR
 *
 * Tokens expiram em 60 dias. Renovar antes!
 *
 * @param {string} currentToken - Token atual
 * @returns {Promise<{accessToken: string, expiresIn: number}>}
 */
export async function refreshToken(currentToken) {
  console.log('🔄 [Instagram] Renovando token...');

  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: currentToken
      }
    });

    console.log('✅ [Instagram] Token renovado! Válido por mais 60 dias');

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };

  } catch (error) {
    console.error('❌ [Instagram] Erro ao renovar token:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Erro ao renovar token');
  }
}

/**
 * ✅ VALIDAR TOKEN
 *
 * Verifica se token ainda é válido
 *
 * @param {string} accessToken - Token a validar
 * @returns {Promise<{valid: boolean, expiresAt?: number}>}
 */
export async function validateToken(accessToken) {
  console.log('✅ [Instagram] Validando token...');

  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/debug_token`, {
      params: {
        input_token: accessToken,
        access_token: accessToken
      }
    });

    const data = response.data.data;

    console.log('✅ [Instagram] Token válido até:', new Date(data.expires_at * 1000).toLocaleString('pt-BR'));

    return {
      valid: data.is_valid,
      expiresAt: data.expires_at,
      scopes: data.scopes
    };

  } catch (error) {
    console.error('❌ [Instagram] Token inválido:', error.response?.data || error.message);

    return {
      valid: false
    };
  }
}

/**
 * 🔧 UTILIDADE: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔧 UTILIDADE: Verificar se token vai expirar em breve (7 dias)
 *
 * @param {number} expiresAt - Timestamp de expiração
 * @returns {boolean} True se vai expirar em 7 dias
 */
export function willExpireSoon(expiresAt) {
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
  const now = Date.now();
  const expirationDate = expiresAt * 1000; // Converter para ms

  return (expirationDate - now) < sevenDays;
}

/**
 * 🔧 FLUXO COMPLETO DE AUTENTICAÇÃO
 *
 * @param {string} appId - ID do app
 * @param {string} appSecret - Secret do app
 * @param {string} redirectUri - URL de redirect
 * @returns {Object} Funções de autenticação
 */
export function createAuthFlow(appId, appSecret, redirectUri) {
  return {
    // Passo 1: Redirecionar usuário para autorizar
    authorize: () => {
      const authUrl = getAuthorizationUrl(appId, redirectUri);
      window.location.href = authUrl;
    },

    // Passo 2: Processar callback (chamar após redirect)
    handleCallback: async (code) => {
      try {
        // Trocar código por token de curta duração
        const shortLived = await exchangeCodeForToken(code, appId, appSecret, redirectUri);

        // Converter para token de longa duração
        const longLived = await getLongLivedToken(shortLived.accessToken, appId, appSecret);

        // Buscar Instagram Account ID
        const accountInfo = await getInstagramAccountId(longLived.accessToken);

        return {
          success: true,
          accessToken: longLived.accessToken,
          expiresIn: longLived.expiresIn,
          instagramAccountId: accountInfo.instagramAccountId,
          username: accountInfo.username
        };

      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  };
}

// Exportar todas as funções
export default {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getLongLivedToken,
  getInstagramAccountId,
  publishInstagramPost,
  getPostMetrics,
  getRecentPosts,
  refreshToken,
  validateToken,
  willExpireSoon,
  createAuthFlow
};
