# 🚀 PLANO DE IMPLEMENTAÇÃO - Sistema de Automação Instagram
## BuscaBusca Brasil - Roadmap Completo

---

## 📊 VISÃO GERAL

**Objetivo**: Criar sistema automatizado de posts no Instagram a partir de links de produtos
**Duração Estimada**: 3-4 semanas
**Metodologia**: Desenvolvimento iterativo com testes em cada fase
**Abordagem**: Expandir sistema React + Firebase atual (não migrar tecnologias)

---

## 🎯 PRINCÍPIOS DO DESENVOLVIMENTO

✅ **SEMPRE TESTAR** antes de avançar
✅ **DOCUMENTAR** cada função criada
✅ **COMMITAR** após cada fase concluída
✅ **VALIDAR** com o desenvolvedor antes de grandes mudanças
✅ **PRESERVAR** código existente (não quebrar funcionalidades)

---

# 📋 FASE 0: PREPARAÇÃO E DOCUMENTAÇÃO

**Duração**: 1 dia
**Status**: ⏳ Pendente

## Objetivos:
- [ ] Documentar arquitetura atual completa
- [ ] Criar backup do código atual
- [ ] Configurar ambiente de desenvolvimento
- [ ] Criar branch de desenvolvimento
- [ ] Definir estrutura de arquivos novos

## Tarefas:

### 0.1 - Backup e Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/instagram-automation
git push -u origin feature/instagram-automation
```

### 0.2 - Documentação de Arquitetura
- [ ] Criar `docs/ARQUITETURA-ATUAL.md`
- [ ] Mapear todas as collections do Firestore
- [ ] Listar todas as APIs já integradas
- [ ] Documentar fluxo de dados atual

### 0.3 - Estrutura de Pastas Nova
```
src/
├── components/
│   └── instagram/              # 🆕 NOVO
│       ├── AutomationDashboard.jsx
│       ├── ProductExtractor.jsx
│       ├── PostEditor.jsx
│       ├── PostQueue.jsx
│       ├── PostPreview.jsx
│       ├── InstagramSettings.jsx
│       └── InstagramAnalytics.jsx
├── utils/
│   ├── instagram-scraper.js    # 🆕 NOVO (expandir product-scraper)
│   ├── instagram-client.js     # 🆕 NOVO
│   ├── caption-generator.js    # 🆕 NOVO
│   └── image-optimizer.js      # 🆕 NOVO
└── pages/ (ou integrar no App.jsx)

functions/                       # 🆕 Firebase Cloud Functions
├── package.json
├── index.js
└── src/
    ├── scraper.js
    ├── image-generator.js
    ├── instagram-publisher.js
    └── scheduler.js
```

## Critérios de Conclusão:
✅ Branch criada e configurada
✅ Backup realizado
✅ Documentação completa
✅ Estrutura de pastas definida

---

# 🔍 FASE 1: SCRAPING AVANÇADO DE PRODUTOS

**Duração**: 3-4 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 0

## Objetivos:
- [ ] Expandir `product-scraper.js` para extrair dados completos
- [ ] Suporte robusto para Mercado Livre
- [ ] Suporte robusto para Amazon
- [ ] Sistema de cache para não refazer scraping
- [ ] Tratamento de erros avançado

## Arquivos a Criar/Modificar:

### 1.1 - `src/utils/instagram-scraper.js` (NOVO)

**Funcionalidades**:
```javascript
// Extrai dados completos do produto
async function extractProductData(url) {
  // RETORNA:
  return {
    titulo: string,
    preco: number,
    precoOriginal: number | null,
    desconto: number | null, // % de desconto
    descricao: string,
    imagens: string[], // Array de URLs
    avaliacoes: {
      nota: number,
      total: number
    },
    plataforma: 'mercadolivre' | 'amazon',
    categoria: string | null,
    linkOriginal: string,
    disponivel: boolean
  }
}
```

**Testes a Realizar**:
```javascript
// Teste 1: Mercado Livre com desconto
const url1 = 'https://produto.mercadolivre.com.br/MLB-XXX';
const data1 = await extractProductData(url1);
console.assert(data1.titulo !== '', 'Título extraído');
console.assert(data1.preco > 0, 'Preço extraído');
console.assert(data1.imagens.length > 0, 'Imagens extraídas');

// Teste 2: Amazon
const url2 = 'https://amazon.com.br/dp/XXX';
const data2 = await extractProductData(url2);
console.assert(data2.plataforma === 'amazon', 'Plataforma identificada');

// Teste 3: Produto indisponível
const url3 = 'https://produto-invalido.com.br';
const data3 = await extractProductData(url3);
console.assert(data3 === null || data3.disponivel === false, 'Erro tratado');
```

### 1.2 - Sistema de Cache
```javascript
// Cache em memória + Firestore
const cache = new Map();

async function getCachedProductData(url) {
  // 1. Verifica cache em memória (rápido)
  if (cache.has(url)) {
    const cached = cache.get(url);
    // Cache válido por 1 hora
    if (Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
  }

  // 2. Verifica Firestore (médio)
  const doc = await getDoc(doc(db, 'product_cache', url));
  if (doc.exists()) {
    const data = doc.data();
    // Cache válido por 24 horas
    if (Date.now() - data.timestamp < 86400000) {
      cache.set(url, data);
      return data.productData;
    }
  }

  // 3. Faz scraping (lento)
  const productData = await extractProductData(url);

  // Salva no cache
  const cacheData = {
    productData,
    timestamp: Date.now()
  };
  cache.set(url, cacheData);
  await setDoc(doc(db, 'product_cache', url), cacheData);

  return productData;
}
```

### 1.3 - Tratamento de Erros
```javascript
class ScraperError extends Error {
  constructor(type, message, url) {
    super(message);
    this.type = type; // 'NETWORK', 'PARSING', 'NOT_FOUND', 'BLOCKED'
    this.url = url;
  }
}

// Retry com backoff exponencial
async function extractWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await extractProductData(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Tentativa ${i + 1} falhou, aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Testes de Validação:

### Teste 1: Mercado Livre - Produto Normal
```
URL: https://produto.mercadolivre.com.br/MLB-3712882303-notebook-gamer-acer-nitro-5
Esperado:
✅ Título extraído
✅ Preço extraído (número)
✅ Pelo menos 1 imagem
✅ Avaliações (nota e total)
```

### Teste 2: Mercado Livre - Produto com Desconto
```
URL: [produto com desconto]
Esperado:
✅ precoOriginal > preco
✅ desconto calculado corretamente (%)
```

### Teste 3: Amazon
```
URL: https://www.amazon.com.br/dp/B0XXXXX
Esperado:
✅ Plataforma = 'amazon'
✅ ASIN extraído
✅ Preço em formato correto
```

### Teste 4: Link Curto (amzn.to, /sec/)
```
URL: https://mercadolivre.com.br/sec/XXX
Esperado:
✅ Link expandido automaticamente
✅ Dados extraídos do link completo
```

### Teste 5: Erro - Produto Inexistente
```
URL: https://produto.mercadolivre.com.br/MLB-invalido
Esperado:
✅ Erro capturado
✅ Mensagem amigável retornada
✅ Não quebra a aplicação
```

## Critérios de Conclusão:
✅ Todos os 5 testes passando
✅ Cache funcionando (verificar velocidade 2ª extração)
✅ Erros tratados sem quebrar app
✅ Código documentado (JSDoc)
✅ Commit realizado

---

# 💾 FASE 2: ESTRUTURA DE BANCO DE DADOS

**Duração**: 1-2 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 0

## Objetivos:
- [ ] Criar novas collections no Firestore
- [ ] Atualizar regras de segurança
- [ ] Criar índices para performance
- [ ] Documentar schema completo

## Collections a Criar:

### 2.1 - Collection: `instagram_products`
```javascript
{
  id: string (auto-gerado),

  // Dados do produto
  titulo: string,
  preco: number,
  precoOriginal: number | null,
  desconto: number | null,
  descricao: string,
  imagens: string[], // URLs das imagens
  categoria: string | null,

  // Dados da plataforma
  plataforma: 'mercadolivre' | 'amazon',
  linkOriginal: string,
  linkRastreado: string, // Link curto gerado (/r/xxx)

  // Avaliações
  avaliacoes: {
    nota: number,
    total: number
  },

  // Status
  status: 'active' | 'inactive' | 'out_of_stock',
  disponivel: boolean,

  // Metadados
  userId: string, // Referência ao usuário
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Scraping
  lastScraped: Timestamp,
  scrapingErrors: number, // Contador de erros
}
```

### 2.2 - Collection: `instagram_posts`
```javascript
{
  id: string (auto-gerado),

  // Relacionamento
  productId: string, // Referência a instagram_products

  // Conteúdo do post
  caption: string, // Legenda
  hashtags: string[], // Array de hashtags
  imageUrl: string, // URL da imagem gerada
  imageTemplate: 'moderno' | 'minimalista' | 'colorido',

  // Instagram
  instagramPostId: string | null, // ID do post no Instagram
  instagramPermalink: string | null, // URL do post

  // Agendamento
  scheduledTime: Timestamp | null,
  publishedTime: Timestamp | null,

  // Status
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed',
  errorMessage: string | null,
  retryCount: number,

  // Engajamento (atualizado periodicamente)
  engagement: {
    likes: number,
    comments: number,
    saves: number,
    reach: number,
    impressions: number,
    lastSync: Timestamp
  },

  // Metadados
  userId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2.3 - Collection: `instagram_settings`
```javascript
{
  id: string (= userId),
  userId: string,

  // Configurações de publicação
  autoPublish: boolean, // Publicar automaticamente ou salvar como rascunho
  postsPerDay: number, // Máximo de posts por dia (ex: 5)
  postingHours: number[], // Horas do dia para postar [9, 12, 15, 18, 21]

  // Templates e estilo
  defaultTemplate: 'moderno' | 'minimalista' | 'colorido',
  captionTone: 'entusiasta' | 'urgencia' | 'informativo' | 'casual',

  // Hashtags
  defaultHashtags: string[], // Hashtags padrão
  hashtagsByCategory: {
    [categoria: string]: string[]
  },

  // Instagram API
  instagramConnected: boolean,
  instagramAccountId: string | null,
  instagramUsername: string | null,
  accessToken: string | null, // Encrypted
  tokenExpiresAt: Timestamp | null,

  // IA (opcional)
  useAICaptions: boolean,
  openaiApiKey: string | null, // Encrypted

  // Notificações
  notifyOnPublish: boolean,
  notifyOnError: boolean,

  // Metadados
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2.4 - Collection: `instagram_analytics_daily`
```javascript
{
  id: string (auto-gerado),
  date: string, // YYYY-MM-DD
  userId: string,

  // Métricas do dia
  postsPublished: number,
  postsScheduled: number,
  postsFailed: number,

  totalLikes: number,
  totalComments: number,
  totalSaves: number,
  totalReach: number,
  totalImpressions: number,

  // Links
  totalClicks: number,
  uniqueVisitors: number,

  // Performance
  avgEngagementRate: number, // %
  bestPostId: string | null,
  worstPostId: string | null,

  createdAt: Timestamp
}
```

## Regras de Segurança (firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar: usuário é dono do documento
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // instagram_products
    match /instagram_products/{productId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // instagram_posts
    match /instagram_posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // instagram_settings
    match /instagram_settings/{userId} {
      allow read, write: if isOwner(userId);
    }

    // instagram_analytics_daily
    match /instagram_analytics_daily/{analyticsId} {
      allow read: if request.auth != null && isOwner(resource.data.userId);
      allow write: if false; // Apenas Cloud Functions podem escrever
    }

    // product_cache (cache de scraping)
    match /product_cache/{url} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Índices Necessários:

```javascript
// Criar no Firebase Console > Firestore > Indexes

// instagram_products
- Collection: instagram_products
  Fields: userId (Ascending), createdAt (Descending)

- Collection: instagram_products
  Fields: userId (Ascending), status (Ascending), createdAt (Descending)

// instagram_posts
- Collection: instagram_posts
  Fields: userId (Ascending), status (Ascending), scheduledTime (Ascending)

- Collection: instagram_posts
  Fields: userId (Ascending), createdAt (Descending)

- Collection: instagram_posts
  Fields: productId (Ascending), createdAt (Descending)

// instagram_analytics_daily
- Collection: instagram_analytics_daily
  Fields: userId (Ascending), date (Descending)
```

## Testes de Validação:

### Teste 1: Criar Produto
```javascript
const productData = {
  titulo: 'Teste Produto',
  preco: 99.90,
  plataforma: 'mercadolivre',
  linkOriginal: 'https://...',
  userId: auth.currentUser.uid,
  createdAt: new Date(),
  status: 'active'
};

const docRef = await addDoc(collection(db, 'instagram_products'), productData);
console.assert(docRef.id !== '', 'Produto criado com sucesso');
```

### Teste 2: Criar Post Draft
```javascript
const postData = {
  productId: 'xxx',
  caption: 'Teste caption',
  hashtags: ['#teste', '#ofertas'],
  status: 'draft',
  userId: auth.currentUser.uid,
  createdAt: new Date()
};

const postRef = await addDoc(collection(db, 'instagram_posts'), postData);
console.assert(postRef.id !== '', 'Post draft criado');
```

### Teste 3: Buscar Produtos do Usuário
```javascript
const q = query(
  collection(db, 'instagram_products'),
  where('userId', '==', auth.currentUser.uid),
  orderBy('createdAt', 'desc'),
  limit(10)
);

const snapshot = await getDocs(q);
console.assert(snapshot.docs.length >= 0, 'Query executada');
```

### Teste 4: Atualizar Status do Post
```javascript
await updateDoc(doc(db, 'instagram_posts', postId), {
  status: 'published',
  publishedTime: new Date()
});

const updated = await getDoc(doc(db, 'instagram_posts', postId));
console.assert(updated.data().status === 'published', 'Status atualizado');
```

### Teste 5: Regras de Segurança
```javascript
// Tentar acessar produto de outro usuário (deve falhar)
try {
  await deleteDoc(doc(db, 'instagram_products', 'produto-de-outro-usuario'));
  console.error('FALHA: Permitiu deletar produto de outro usuário!');
} catch (error) {
  console.assert(error.code === 'permission-denied', 'Regra de segurança funcionando');
}
```

## Critérios de Conclusão:
✅ Todas as collections criadas
✅ Regras de segurança atualizadas e testadas
✅ Índices criados (verificar no console Firebase)
✅ Todos os 5 testes passando
✅ Schema documentado
✅ Commit realizado

---

# 🎨 FASE 3: GERAÇÃO DE IMAGENS PARA POSTS

**Duração**: 3-4 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 1, FASE 2

## Objetivos:
- [ ] Criar Cloud Functions para gerar imagens
- [ ] 3 templates de design diferentes
- [ ] Upload automático para Firebase Storage
- [ ] Otimização de tamanho/qualidade
- [ ] Preview em tempo real

## Arquivos a Criar:

### 3.1 - Setup Firebase Functions
```bash
cd /mnt/c/Users/CARLA/Desktop/ALEXANDRE/SiteBuscaBuscaBrasilOficial
firebase init functions
# Escolher: JavaScript, ESLint Sim, Install dependencies Sim
```

### 3.2 - `functions/package.json`
```json
{
  "name": "functions",
  "description": "Cloud Functions for BuscaBusca Brasil",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.0.0",
    "sharp": "^0.33.0",
    "axios": "^1.6.0"
  }
}
```

### 3.3 - `functions/src/image-generator.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp');
const axios = require('axios');

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Gera imagem do post para Instagram
 *
 * @param {Object} productData - Dados do produto
 * @param {string} template - Template a usar ('moderno', 'minimalista', 'colorido')
 * @returns {Buffer} - Imagem em buffer (JPEG)
 */
async function generatePostImage(productData, template = 'moderno') {
  const { titulo, preco, precoOriginal, imagemProduto } = productData;

  // 1. Baixar imagem do produto
  let productImageBuffer;
  try {
    const response = await axios.get(imagemProduto, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    productImageBuffer = Buffer.from(response.data);
  } catch (error) {
    console.error('Erro ao baixar imagem do produto:', error);
    // Usar imagem placeholder
    productImageBuffer = await createPlaceholderImage();
  }

  // 2. Processar imagem do produto (resize, crop)
  const processedProduct = await sharp(productImageBuffer)
    .resize(800, 800, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toBuffer();

  // 3. Criar background baseado no template
  const background = await createBackground(template);

  // 4. Criar camada de texto
  const textLayer = await createTextLayer(titulo, preco, precoOriginal, template);

  // 5. Compor imagem final
  const finalImage = await sharp(background)
    .composite([
      {
        input: processedProduct,
        top: 150,
        left: 140
      },
      {
        input: textLayer,
        top: 0,
        left: 0
      }
    ])
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();

  return finalImage;
}

/**
 * Cria background baseado no template
 */
async function createBackground(template) {
  const templates = {
    moderno: {
      color1: '#667eea',
      color2: '#764ba2'
    },
    minimalista: {
      color1: '#ffffff',
      color2: '#f7f7f7'
    },
    colorido: {
      color1: '#ff6b6b',
      color2: '#feca57'
    }
  };

  const colors = templates[template] || templates.moderno;

  // SVG com gradiente
  const svg = `
    <svg width="1080" height="1080">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#grad)" />
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Cria camada de texto (SVG)
 */
async function createTextLayer(titulo, preco, precoOriginal, template) {
  const isLight = template === 'minimalista';
  const textColor = isLight ? '#333333' : '#ffffff';

  // Truncar título para 2 linhas (~50 caracteres)
  const tituloTruncado = titulo.substring(0, 50) + (titulo.length > 50 ? '...' : '');

  // Calcular desconto
  let descontoTexto = '';
  if (precoOriginal && precoOriginal > preco) {
    const desconto = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
    descontoTexto = `-${desconto}%`;
  }

  const svg = `
    <svg width="1080" height="1080">
      <!-- Título -->
      <text x="540" y="100"
            font-family="Arial, sans-serif"
            font-size="48"
            font-weight="bold"
            fill="${textColor}"
            text-anchor="middle">
        ${tituloTruncado}
      </text>

      <!-- Preço Original (riscado) -->
      ${precoOriginal ? `
        <text x="540" y="920"
              font-family="Arial"
              font-size="32"
              fill="${isLight ? '#999999' : 'rgba(255,255,255,0.7)'}"
              text-anchor="middle"
              text-decoration="line-through">
          R$ ${precoOriginal.toFixed(2).replace('.', ',')}
        </text>
      ` : ''}

      <!-- Badge de Desconto -->
      ${descontoTexto ? `
        <rect x="440" y="790" width="200" height="60" fill="#ff4757" rx="10"/>
        <text x="540" y="830"
              font-family="Arial"
              font-size="36"
              font-weight="bold"
              fill="#ffffff"
              text-anchor="middle">
          ${descontoTexto}
        </text>
      ` : ''}

      <!-- Preço Atual -->
      <text x="540" y="1000"
            font-family="Arial"
            font-size="84"
            font-weight="bold"
            fill="${textColor}"
            text-anchor="middle">
        R$ ${preco.toFixed(2).replace('.', ',')}
      </text>

      <!-- CTA -->
      <rect x="340" y="1020" width="400" height="50" fill="#ffffff" rx="25"/>
      <text x="540" y="1055"
            font-family="Arial"
            font-size="24"
            font-weight="bold"
            fill="#333333"
            text-anchor="middle">
        LINK NA BIO 👆
      </text>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Cria imagem placeholder
 */
async function createPlaceholderImage() {
  return await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 200, g: 200, b: 200, alpha: 1 }
    }
  })
  .png()
  .toBuffer();
}

/**
 * Cloud Function: Gera imagem do post
 */
exports.generateInstagramPostImage = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }

    try {
      const { productId, template = 'moderno' } = data;

      // 1. Buscar dados do produto no Firestore
      const productDoc = await admin.firestore()
        .collection('instagram_products')
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Produto não encontrado'
        );
      }

      const productData = productDoc.data();

      // Verificar se usuário é dono do produto
      if (productData.userId !== context.auth.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Sem permissão para acessar este produto'
        );
      }

      // 2. Gerar imagem
      const imageBuffer = await generatePostImage({
        titulo: productData.titulo,
        preco: productData.preco,
        precoOriginal: productData.precoOriginal,
        imagemProduto: productData.imagens[0] // Primeira imagem
      }, template);

      // 3. Upload para Firebase Storage
      const bucket = admin.storage().bucket();
      const fileName = `instagram-posts/${context.auth.uid}/${productId}-${Date.now()}.jpg`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            productId: productId,
            userId: context.auth.uid,
            template: template
          }
        }
      });

      // 4. Tornar público e obter URL
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      return {
        success: true,
        imageUrl: publicUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Erro ao gerar imagem do post',
        error.message
      );
    }
  });

module.exports = { generatePostImage };
```

### 3.4 - Cliente no Frontend (`src/utils/image-generator-client.js`)
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Gera imagem do post (chama Cloud Function)
 */
export async function generatePostImage(productId, template = 'moderno') {
  try {
    const generateImage = httpsCallable(functions, 'generateInstagramPostImage');

    const result = await generateImage({
      productId,
      template
    });

    return {
      success: true,
      imageUrl: result.data.imageUrl,
      fileName: result.data.fileName
    };

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Baixa imagem gerada (para preview)
 */
export async function downloadImagePreview(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao baixar preview:', error);
    return null;
  }
}
```

## Deploy das Cloud Functions:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions:generateInstagramPostImage
```

## Testes de Validação:

### Teste 1: Gerar Imagem - Template Moderno
```javascript
const result = await generatePostImage('product123', 'moderno');
console.assert(result.success === true, 'Imagem gerada com sucesso');
console.assert(result.imageUrl.startsWith('https://'), 'URL válida retornada');
```

### Teste 2: Gerar Imagem - Template Minimalista
```javascript
const result = await generatePostImage('product123', 'minimalista');
console.assert(result.success === true, 'Template minimalista funciona');
```

### Teste 3: Gerar Imagem - Template Colorido
```javascript
const result = await generatePostImage('product123', 'colorido');
console.assert(result.success === true, 'Template colorido funciona');
```

### Teste 4: Preview da Imagem
```javascript
const previewUrl = await downloadImagePreview(result.imageUrl);
console.assert(previewUrl !== null, 'Preview carregado');
// Verificar manualmente se imagem aparece corretamente
```

### Teste 5: Produto com Desconto
```javascript
// Criar produto com precoOriginal > preco
const productWithDiscount = {
  titulo: 'Produto com Desconto',
  preco: 99.90,
  precoOriginal: 149.90,
  // ...
};
// Gerar imagem e verificar badge de desconto visualmente
```

### Teste 6: Produto sem Imagem
```javascript
// Produto sem imagem válida (deve usar placeholder)
const result = await generatePostImage('product-sem-imagem', 'moderno');
console.assert(result.success === true, 'Placeholder usado quando sem imagem');
```

## Critérios de Conclusão:
✅ Cloud Function deployada
✅ 3 templates funcionando
✅ Imagens salvas no Storage
✅ URLs públicas geradas
✅ Todos os 6 testes passando
✅ Preview visual validado manualmente
✅ Commit realizado

---

# 📱 FASE 4: INTERFACE DE AUTOMAÇÃO INSTAGRAM

**Duração**: 4-5 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 1, FASE 2, FASE 3

## Objetivos:
- [ ] Criar tab "Automação Instagram" no dashboard
- [ ] Formulário de entrada de link de produto
- [ ] Preview do produto extraído
- [ ] Editor de post (legenda, hashtags, template)
- [ ] Fila de posts (drafts, agendados, publicados)
- [ ] Configurações do Instagram

## Componentes a Criar:

### 4.1 - `src/components/instagram/AutomationDashboard.jsx`
```javascript
import React, { useState } from 'react';
import ProductExtractor from './ProductExtractor';
import PostEditor from './PostEditor';
import PostQueue from './PostQueue';
import InstagramSettings from './InstagramSettings';
import InstagramAnalytics from './InstagramAnalytics';

const AutomationDashboard = () => {
  const [activeTab, setActiveTab] = useState('novo'); // novo, fila, analytics, config
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="automation-dashboard">
      {/* Tabs de navegação */}
      <div className="tabs">
        <button
          className={activeTab === 'novo' ? 'active' : ''}
          onClick={() => setActiveTab('novo')}
        >
          ➕ Novo Post
        </button>
        <button
          className={activeTab === 'fila' ? 'active' : ''}
          onClick={() => setActiveTab('fila')}
        >
          📋 Fila de Posts
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Configurações
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="tab-content">
        {activeTab === 'novo' && (
          <div className="grid-layout">
            <ProductExtractor onProductExtracted={setSelectedProduct} />
            {selectedProduct && (
              <PostEditor product={selectedProduct} />
            )}
          </div>
        )}

        {activeTab === 'fila' && <PostQueue />}
        {activeTab === 'analytics' && <InstagramAnalytics />}
        {activeTab === 'config' && <InstagramSettings />}
      </div>
    </div>
  );
};

export default AutomationDashboard;
```

### 4.2 - `src/components/instagram/ProductExtractor.jsx`
```javascript
import React, { useState } from 'react';
import { getCachedProductData } from '../../utils/instagram-scraper';
import { saveLink } from '../../firebase';

const ProductExtractor = ({ onProductExtracted }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productData, setProductData] = useState(null);

  const handleExtract = async () => {
    if (!url) {
      setError('Digite uma URL válida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Extrair dados do produto
      const data = await getCachedProductData(url);

      if (!data) {
        setError('Não foi possível extrair dados deste produto');
        setLoading(false);
        return;
      }

      // 2. Criar link rastreado (usar sistema existente)
      const linkResult = await saveLink({
        url: data.linkOriginal,
        title: data.titulo,
        platform: data.plataforma
      });

      if (!linkResult.success) {
        setError('Erro ao criar link rastreado');
        setLoading(false);
        return;
      }

      // 3. Adicionar linkRastreado aos dados
      data.linkRastreado = `${window.location.origin}/r/${linkResult.id}`;
      data.linkId = linkResult.id;

      setProductData(data);
      onProductExtracted(data);

    } catch (err) {
      console.error('Erro ao extrair produto:', err);
      setError(err.message || 'Erro ao extrair dados do produto');
    }

    setLoading(false);
  };

  return (
    <div className="card glass product-extractor">
      <h2>🔍 Extrair Produto</h2>

      <div className="form-group">
        <label>URL do Produto (Mercado Livre ou Amazon)</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://produto.mercadolivre.com.br/MLB-..."
          className="input"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button
        onClick={handleExtract}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? '⏳ Extraindo...' : '🔍 Extrair Dados'}
      </button>

      {productData && (
        <div className="product-preview">
          <h3>✅ Produto Extraído!</h3>

          {/* Imagem */}
          {productData.imagens[0] && (
            <img
              src={productData.imagens[0]}
              alt={productData.titulo}
              style={{ maxWidth: '200px', borderRadius: '8px' }}
            />
          )}

          {/* Informações */}
          <div className="product-info">
            <p><strong>Título:</strong> {productData.titulo}</p>
            <p><strong>Preço:</strong> R$ {productData.preco.toFixed(2)}</p>
            {productData.precoOriginal && (
              <p><strong>Preço Original:</strong> R$ {productData.precoOriginal.toFixed(2)}</p>
            )}
            {productData.desconto && (
              <p><strong>Desconto:</strong> {productData.desconto}%</p>
            )}
            <p><strong>Plataforma:</strong> {productData.plataforma}</p>
            <p><strong>Imagens:</strong> {productData.imagens.length}</p>
            {productData.avaliacoes && (
              <p><strong>Avaliação:</strong> ⭐ {productData.avaliacoes.nota} ({productData.avaliacoes.total} avaliações)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductExtractor;
```

### 4.3 - `src/components/instagram/PostEditor.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { generatePostImage } from '../../utils/image-generator-client';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const PostEditor = ({ product }) => {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [template, setTemplate] = useState('moderno');
  const [imageUrl, setImageUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Gerar legenda sugerida automaticamente
  useEffect(() => {
    if (product) {
      const suggestedCaption = generateCaption(product);
      setCaption(suggestedCaption);

      const suggestedHashtags = generateHashtags(product);
      setHashtags(suggestedHashtags.join(' '));
    }
  }, [product]);

  // Gerar imagem quando template mudar
  useEffect(() => {
    if (product) {
      handleGenerateImage();
    }
  }, [template]);

  const generateCaption = (prod) => {
    const desconto = prod.desconto ? `${prod.desconto}% OFF! 🔥` : '';
    return `🛍️ ${prod.titulo}\n\n${desconto}\n💰 R$ ${prod.preco.toFixed(2)}\n\n✅ Link rastreado na bio!\n⚡ Não perca essa oferta!`;
  };

  const generateHashtags = (prod) => {
    const base = ['#ofertas', '#promoção', '#desconto', '#brasil'];
    const platform = prod.plataforma === 'mercadolivre' ? ['#mercadolivre', '#ml'] : ['#amazon'];
    return [...base, ...platform];
  };

  const handleGenerateImage = async () => {
    setGenerating(true);

    try {
      // Salvar produto no Firestore primeiro (se ainda não foi)
      let productId = product.firestoreId;

      if (!productId) {
        const productDoc = await addDoc(collection(db, 'instagram_products'), {
          ...product,
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          status: 'active'
        });
        productId = productDoc.id;
        product.firestoreId = productId;
      }

      // Gerar imagem via Cloud Function
      const result = await generatePostImage(productId, template);

      if (result.success) {
        setImageUrl(result.imageUrl);
      } else {
        alert('Erro ao gerar imagem: ' + result.error);
      }

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar imagem');
    }

    setGenerating(false);
  };

  const handleSaveDraft = async () => {
    setSaving(true);

    try {
      const hashtagArray = hashtags.split(' ').filter(h => h.startsWith('#'));

      const postData = {
        productId: product.firestoreId,
        caption: caption,
        hashtags: hashtagArray,
        imageUrl: imageUrl,
        imageTemplate: template,
        status: 'draft',
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'instagram_posts'), postData);

      alert('✅ Post salvo como rascunho!');

    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho');
    }

    setSaving(false);
  };

  return (
    <div className="card glass post-editor">
      <h2>✍️ Editor de Post</h2>

      {/* Preview da Imagem */}
      <div className="image-preview-section">
        <h3>Preview</h3>

        {generating ? (
          <div className="loading">⏳ Gerando imagem...</div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        ) : (
          <div className="placeholder">Clique em "Gerar Imagem"</div>
        )}
      </div>

      {/* Seleção de Template */}
      <div className="form-group">
        <label>🎨 Template</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="input"
        >
          <option value="moderno">Moderno (Roxo)</option>
          <option value="minimalista">Minimalista (Branco)</option>
          <option value="colorido">Colorido (Vermelho/Amarelo)</option>
        </select>
      </div>

      <button
        onClick={handleGenerateImage}
        disabled={generating}
        className="btn btn-secondary"
      >
        {generating ? '⏳ Gerando...' : '🎨 Gerar Imagem'}
      </button>

      {/* Editor de Legenda */}
      <div className="form-group">
        <label>📝 Legenda</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="input"
          placeholder="Escreva a legenda do post..."
        />
        <small>{caption.length} caracteres</small>
      </div>

      {/* Editor de Hashtags */}
      <div className="form-group">
        <label># Hashtags</label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          className="input"
          placeholder="#ofertas #desconto #brasil"
        />
        <small>{hashtags.split(' ').filter(h => h.startsWith('#')).length} hashtags</small>
      </div>

      {/* Ações */}
      <div className="button-group">
        <button
          onClick={handleSaveDraft}
          disabled={saving || !imageUrl}
          className="btn btn-primary"
        >
          {saving ? '⏳ Salvando...' : '💾 Salvar Rascunho'}
        </button>

        <button
          disabled
          className="btn btn-success"
          title="Será implementado na Fase 5"
        >
          📱 Publicar Agora
        </button>
      </div>
    </div>
  );
};

export default PostEditor;
```

### 4.4 - `src/components/instagram/PostQueue.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const PostQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, draft, scheduled, published

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      let q = query(
        collection(db, 'instagram_posts'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }

      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(postsData);

    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }

    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { emoji: '📝', text: 'Rascunho', color: '#gray' },
      scheduled: { emoji: '⏰', text: 'Agendado', color: '#blue' },
      published: { emoji: '✅', text: 'Publicado', color: '#green' },
      failed: { emoji: '❌', text: 'Erro', color: '#red' }
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="card glass post-queue">
      <h2>📋 Fila de Posts</h2>

      {/* Filtros */}
      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={filter === 'draft' ? 'active' : ''}
          onClick={() => setFilter('draft')}
        >
          📝 Rascunhos
        </button>
        <button
          className={filter === 'scheduled' ? 'active' : ''}
          onClick={() => setFilter('scheduled')}
        >
          ⏰ Agendados
        </button>
        <button
          className={filter === 'published' ? 'active' : ''}
          onClick={() => setFilter('published')}
        >
          ✅ Publicados
        </button>
      </div>

      {/* Lista de Posts */}
      {loading ? (
        <div className="loading">Carregando posts...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum post encontrado</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => {
            const badge = getStatusBadge(post.status);

            return (
              <div key={post.id} className="post-card">
                {/* Imagem */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="post-image"
                  />
                )}

                {/* Badge de Status */}
                <div className="status-badge" style={{ backgroundColor: badge.color }}>
                  {badge.emoji} {badge.text}
                </div>

                {/* Legenda (truncada) */}
                <p className="post-caption">
                  {post.caption.substring(0, 100)}...
                </p>

                {/* Data */}
                <p className="post-date">
                  {new Date(post.createdAt.toDate()).toLocaleDateString('pt-BR')}
                </p>

                {/* Ações */}
                <div className="post-actions">
                  <button className="btn-icon" title="Editar">✏️</button>
                  <button className="btn-icon" title="Ver Detalhes">👁️</button>
                  <button className="btn-icon" title="Deletar">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostQueue;
```

### 4.5 - Integrar no Dashboard Principal (`src/App.jsx`)

Adicionar nova tab no dashboard:

```javascript
// Em App.jsx, adicionar:
import AutomationDashboard from './components/instagram/AutomationDashboard';

// Na seção de tabs (linha ~254):
<button
  className={`nav-btn ${activeTab === 'instagram' ? 'active' : ''}`}
  onClick={() => setActiveTab('instagram')}
>
  📱 Instagram
</button>

// No conteúdo (linha ~290):
{activeTab === 'instagram' && <AutomationDashboard />}
```

## Testes de Validação:

### Teste 1: Extração de Produto
```
1. Abrir tab "Instagram"
2. Clicar em "Novo Post"
3. Colar URL de produto do Mercado Livre
4. Clicar em "Extrair Dados"
✅ Dados extraídos e exibidos corretamente
✅ Link rastreado gerado
✅ Preview do produto visível
```

### Teste 2: Geração de Imagem
```
1. Após extrair produto
2. Selecionar template "Moderno"
3. Clicar em "Gerar Imagem"
✅ Imagem gerada em ~5-10 segundos
✅ Preview exibido
✅ Template aplicado corretamente
```

### Teste 3: Trocar Template
```
1. Com produto extraído
2. Trocar de "Moderno" para "Minimalista"
✅ Nova imagem gerada automaticamente
✅ Estilo visual diferente
```

### Teste 4: Editar Legenda e Hashtags
```
1. Editar texto da legenda
2. Adicionar/remover hashtags
3. Verificar contador de caracteres
✅ Edição funciona em tempo real
✅ Contadores corretos
```

### Teste 5: Salvar Rascunho
```
1. Configurar post completo
2. Clicar em "Salvar Rascunho"
3. Ir para tab "Fila de Posts"
✅ Post salvo no Firestore
✅ Aparece na fila como "Rascunho"
```

### Teste 6: Filtrar Posts na Fila
```
1. Criar vários posts
2. Testar filtros: Todos, Rascunhos, Agendados, Publicados
✅ Filtros funcionam corretamente
✅ Contagem correta
```

### Teste 7: Responsividade
```
1. Testar em desktop (>1024px)
2. Testar em tablet (768-1024px)
3. Testar em mobile (<768px)
✅ Layout adapta corretamente
✅ Tudo funcional em todos os tamanhos
```

## Critérios de Conclusão:
✅ Todos os componentes criados
✅ Integração com App.jsx funcionando
✅ Todos os 7 testes manuais passando
✅ Interface responsiva
✅ Sem erros no console
✅ Commit realizado

---

# 🔗 FASE 5: INTEGRAÇÃO COM INSTAGRAM API

**Duração**: 3-4 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 4

## Objetivos:
- [ ] Configurar OAuth Instagram
- [ ] Criar Cloud Function de publicação
- [ ] Sistema de filas para retry
- [ ] Webhook de métricas
- [ ] Sincronização de analytics

**NOTA**: Esta fase requer aprovação de App no Facebook/Instagram. Pode levar 1-2 semanas.

## Pré-requisitos:

### 5.1 - Criar App no Facebook Developers
```
1. Acessar: https://developers.facebook.com/
2. Criar novo App
3. Tipo: "Business"
4. Adicionar produto: "Instagram Basic Display"
5. Configurar:
   - Redirect URIs: https://buscabuscabrasil.com.br/instagram/callback
   - Deauthorize Callback URL
   - Data Deletion Callback URL
6. Anotar:
   - App ID
   - App Secret
   - Instagram Account ID
```

### 5.2 - Configurar Variáveis de Ambiente

```bash
# .env (adicionar)
REACT_APP_INSTAGRAM_APP_ID=your_app_id
REACT_APP_INSTAGRAM_REDIRECT_URI=https://buscabuscabrasil.com.br/instagram/callback

# functions/.env (criar)
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=long_lived_token
```

## Arquivos a Criar:

### 5.3 - `functions/src/instagram-publisher.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Publica post no Instagram
 */
exports.publishInstagramPost = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Não autenticado');
    }

    try {
      const { postId } = data;

      // 1. Buscar dados do post
      const postDoc = await admin.firestore()
        .collection('instagram_posts')
        .doc(postId)
        .get();

      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Post não encontrado');
      }

      const post = postDoc.data();

      // Verificar permissão
      if (post.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Sem permissão');
      }

      // 2. Buscar configurações do Instagram
      const settingsDoc = await admin.firestore()
        .collection('instagram_settings')
        .doc(context.auth.uid)
        .get();

      if (!settingsDoc.exists || !settingsDoc.data().instagramConnected) {
        throw new functions.https.HttpsError('failed-precondition', 'Instagram não conectado');
      }

      const settings = settingsDoc.data();

      // 3. Atualizar status para "publishing"
      await admin.firestore()
        .collection('instagram_posts')
        .doc(postId)
        .update({
          status: 'publishing',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      // 4. Criar container no Instagram
      const containerResponse = await axios.post(
        `${GRAPH_API_URL}/${settings.instagramAccountId}/media`,
        null,
        {
          params: {
            image_url: post.imageUrl,
            caption: `${post.caption}\n\n${post.hashtags.join(' ')}`,
            access_token: settings.accessToken
          }
        }
      );

      const creationId = containerResponse.data.id;

      // 5. Aguardar processamento
      await waitForProcessing(creationId, settings.accessToken);

      // 6. Publicar
      const publishResponse = await axios.post(
        `${GRAPH_API_URL}/${settings.instagramAccountId}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: settings.accessToken
          }
        }
      );

      const instagramPostId = publishResponse.data.id;

      // 7. Buscar permalink
      const detailsResponse = await axios.get(
        `${GRAPH_API_URL}/${instagramPostId}`,
        {
          params: {
            fields: 'id,permalink,timestamp',
            access_token: settings.accessToken
          }
        }
      );

      const permalink = detailsResponse.data.permalink;

      // 8. Atualizar post no Firestore
      await admin.firestore()
        .collection('instagram_posts')
        .doc(postId)
        .update({
          status: 'published',
          instagramPostId: instagramPostId,
          instagramPermalink: permalink,
          publishedTime: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return {
        success: true,
        instagramPostId: instagramPostId,
        permalink: permalink
      };

    } catch (error) {
      console.error('Erro ao publicar no Instagram:', error);

      // Atualizar post com erro
      if (data.postId) {
        await admin.firestore()
          .collection('instagram_posts')
          .doc(data.postId)
          .update({
            status: 'failed',
            errorMessage: error.message,
            retryCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
      }

      throw new functions.https.HttpsError(
        'internal',
        'Erro ao publicar no Instagram',
        error.message
      );
    }
  });

/**
 * Aguarda processamento da mídia
 */
async function waitForProcessing(creationId, accessToken, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `${GRAPH_API_URL}/${creationId}`,
      {
        params: {
          fields: 'status_code',
          access_token: accessToken
        }
      }
    );

    const statusCode = response.data.status_code;

    if (statusCode === 'FINISHED') {
      return;
    } else if (statusCode === 'ERROR') {
      throw new Error('Erro no processamento da mídia pelo Instagram');
    }

    // Aguarda 3 segundos
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Timeout: mídia não processada a tempo');
}

/**
 * Sincroniza métricas de um post
 */
exports.syncPostMetrics = functions
  .runWith({ timeoutSeconds: 60 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Não autenticado');
    }

    try {
      const { postId } = data;

      const postDoc = await admin.firestore()
        .collection('instagram_posts')
        .doc(postId)
        .get();

      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Post não encontrado');
      }

      const post = postDoc.data();

      if (!post.instagramPostId) {
        throw new functions.https.HttpsError('failed-precondition', 'Post não publicado ainda');
      }

      const settingsDoc = await admin.firestore()
        .collection('instagram_settings')
        .doc(post.userId)
        .get();

      const settings = settingsDoc.data();

      // Buscar insights
      const insightsResponse = await axios.get(
        `${GRAPH_API_URL}/${post.instagramPostId}/insights`,
        {
          params: {
            metric: 'engagement,impressions,reach,saved',
            access_token: settings.accessToken
          }
        }
      );

      // Buscar likes e comments
      const detailsResponse = await axios.get(
        `${GRAPH_API_URL}/${post.instagramPostId}`,
        {
          params: {
            fields: 'like_count,comments_count',
            access_token: settings.accessToken
          }
        }
      );

      const engagement = {
        likes: detailsResponse.data.like_count || 0,
        comments: detailsResponse.data.comments_count || 0,
        impressions: 0,
        reach: 0,
        saves: 0,
        lastSync: admin.firestore.FieldValue.serverTimestamp()
      };

      // Processar insights
      insightsResponse.data.data.forEach(metric => {
        const value = metric.values[0].value;
        if (metric.name === 'impressions') engagement.impressions = value;
        if (metric.name === 'reach') engagement.reach = value;
        if (metric.name === 'saved') engagement.saves = value;
      });

      // Atualizar no Firestore
      await admin.firestore()
        .collection('instagram_posts')
        .doc(postId)
        .update({ engagement });

      return { success: true, engagement };

    } catch (error) {
      console.error('Erro ao sincronizar métricas:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
```

### 5.4 - Cliente Frontend (`src/utils/instagram-publisher-client.js`)

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Publica post no Instagram
 */
export async function publishPost(postId) {
  try {
    const publish = httpsCallable(functions, 'publishInstagramPost');
    const result = await publish({ postId });

    return {
      success: true,
      instagramPostId: result.data.instagramPostId,
      permalink: result.data.permalink
    };

  } catch (error) {
    console.error('Erro ao publicar:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sincroniza métricas de um post
 */
export async function syncMetrics(postId) {
  try {
    const sync = httpsCallable(functions, 'syncPostMetrics');
    const result = await sync({ postId });

    return {
      success: true,
      engagement: result.data.engagement
    };

  } catch (error) {
    console.error('Erro ao sincronizar:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 5.5 - Componente de Configuração Instagram (`src/components/instagram/InstagramSettings.jsx`)

```javascript
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const InstagramSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);

    try {
      const docRef = doc(db, 'instagram_settings', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        // Criar configurações padrão
        const defaultSettings = {
          userId: auth.currentUser.uid,
          autoPublish: false,
          postsPerDay: 5,
          postingHours: [9, 12, 15, 18, 21],
          defaultTemplate: 'moderno',
          captionTone: 'entusiasta',
          instagramConnected: false,
          useAICaptions: false,
          notifyOnPublish: true,
          notifyOnError: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(docRef, defaultSettings);
        setSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const docRef = doc(db, 'instagram_settings', auth.currentUser.uid);
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date()
      });

      alert('✅ Configurações salvas!');

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    }

    setSaving(false);
  };

  const handleConnectInstagram = () => {
    // Redirecionar para OAuth do Instagram
    const appId = process.env.REACT_APP_INSTAGRAM_APP_ID;
    const redirectUri = process.env.REACT_APP_INSTAGRAM_REDIRECT_URI;
    const scope = 'instagram_basic,instagram_content_publish';

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    window.location.href = authUrl;
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="card glass instagram-settings">
      <h2>⚙️ Configurações do Instagram</h2>

      {/* Status da Conexão */}
      <div className="connection-status">
        <h3>📱 Conexão com Instagram</h3>

        {settings.instagramConnected ? (
          <div className="connected">
            <p>✅ Conectado como: @{settings.instagramUsername}</p>
            <button className="btn btn-secondary">🔄 Renovar Token</button>
            <button className="btn btn-danger">❌ Desconectar</button>
          </div>
        ) : (
          <div className="not-connected">
            <p>❌ Instagram não conectado</p>
            <button
              onClick={handleConnectInstagram}
              className="btn btn-primary"
            >
              📱 Conectar Instagram
            </button>

            <div className="info-box">
              <p><strong>ℹ️ Requisitos:</strong></p>
              <ul>
                <li>✅ Conta Instagram Business ou Creator</li>
                <li>✅ Página do Facebook vinculada</li>
                <li>✅ App aprovado pelo Facebook (pode levar 1-2 semanas)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Configurações de Publicação */}
      <div className="form-section">
        <h3>📤 Publicação</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.autoPublish}
              onChange={(e) => setSettings({...settings, autoPublish: e.target.checked})}
            />
            Publicar automaticamente (sem revisão manual)
          </label>
        </div>

        <div className="form-group">
          <label>Posts por dia</label>
          <input
            type="number"
            min="1"
            max="25"
            value={settings.postsPerDay}
            onChange={(e) => setSettings({...settings, postsPerDay: parseInt(e.target.value)})}
            className="input"
          />
          <small>Máximo recomendado: 5-10 posts/dia</small>
        </div>

        <div className="form-group">
          <label>Horários de publicação</label>
          <div className="hours-selector">
            {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(hour => (
              <label key={hour} className="hour-checkbox">
                <input
                  type="checkbox"
                  checked={settings.postingHours.includes(hour)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({
                        ...settings,
                        postingHours: [...settings.postingHours, hour].sort()
                      });
                    } else {
                      setSettings({
                        ...settings,
                        postingHours: settings.postingHours.filter(h => h !== hour)
                      });
                    }
                  }}
                />
                {hour}h
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Template Padrão */}
      <div className="form-section">
        <h3>🎨 Estilo Visual</h3>

        <div className="form-group">
          <label>Template padrão</label>
          <select
            value={settings.defaultTemplate}
            onChange={(e) => setSettings({...settings, defaultTemplate: e.target.value})}
            className="input"
          >
            <option value="moderno">Moderno (Roxo)</option>
            <option value="minimalista">Minimalista (Branco)</option>
            <option value="colorido">Colorido (Vermelho/Amarelo)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tom das legendas</label>
          <select
            value={settings.captionTone}
            onChange={(e) => setSettings({...settings, captionTone: e.target.value})}
            className="input"
          >
            <option value="entusiasta">Entusiasta (🔥)</option>
            <option value="urgencia">Urgência (⏰)</option>
            <option value="informativo">Informativo (📝)</option>
            <option value="casual">Casual (💬)</option>
          </select>
        </div>
      </div>

      {/* IA (Opcional) */}
      <div className="form-section">
        <h3>🤖 Inteligência Artificial (Opcional)</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.useAICaptions}
              onChange={(e) => setSettings({...settings, useAICaptions: e.target.checked})}
            />
            Usar IA para gerar legendas (OpenAI GPT-4)
          </label>
          <small>Custo estimado: R$ 0,01 por legenda</small>
        </div>

        {settings.useAICaptions && (
          <div className="form-group">
            <label>OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              className="input"
            />
            <small>Será armazenada criptografada</small>
          </div>
        )}
      </div>

      {/* Notificações */}
      <div className="form-section">
        <h3>🔔 Notificações</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifyOnPublish}
              onChange={(e) => setSettings({...settings, notifyOnPublish: e.target.checked})}
            />
            Notificar quando post for publicado
          </label>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.notifyOnError}
              onChange={(e) => setSettings({...settings, notifyOnError: e.target.checked})}
            />
            Notificar quando houver erro na publicação
          </label>
        </div>
      </div>

      {/* Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
      >
        {saving ? '⏳ Salvando...' : '💾 Salvar Configurações'}
      </button>
    </div>
  );
};

export default InstagramSettings;
```

## Deploy:
```bash
firebase deploy --only functions:publishInstagramPost,functions:syncPostMetrics
```

## Testes de Validação:

### Teste 1: Conectar Instagram (Manual)
```
1. Ir para Configurações
2. Clicar em "Conectar Instagram"
3. Fazer OAuth no Instagram
✅ Redirecionado para Instagram
✅ Autorização solicitada
✅ Token salvo no Firestore
```

### Teste 2: Publicar Post (Manual)
```
1. Criar rascunho na FASE 4
2. Clicar em "Publicar Agora"
3. Aguardar (~30-60 segundos)
✅ Status muda para "publishing"
✅ Post aparece no Instagram
✅ Status muda para "published"
✅ Permalink gerado
```

### Teste 3: Erro de Publicação
```
1. Desconectar Instagram (remover token)
2. Tentar publicar post
✅ Erro capturado
✅ Status muda para "failed"
✅ Mensagem de erro salva
```

### Teste 4: Sincronizar Métricas
```
1. Post já publicado há algumas horas
2. Clicar em "Sincronizar Métricas"
✅ Likes atualizados
✅ Comments atualizados
✅ Impressions atualizados
```

### Teste 5: Renovar Token
```
(Token expira em 60 dias)
1. Clicar em "Renovar Token"
✅ Novo token gerado
✅ Configurações atualizadas
```

## Critérios de Conclusão:
✅ OAuth funcionando
✅ Publicação funcionando
✅ Métricas sincronizando
✅ Erros tratados corretamente
✅ Todos os 5 testes passando
✅ Commit realizado

**IMPORTANTE**: Esta fase pode ser desenvolvida em paralelo com o modo "development" do Instagram (sem aprovação). Para produção, aguardar aprovação do App.

---

# ⏰ FASE 6: SISTEMA DE AGENDAMENTO

**Duração**: 2-3 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 5

## Objetivos:
- [ ] Agendar posts para horários específicos
- [ ] Cron job automático para publicar
- [ ] Fila inteligente (respeita limite diário)
- [ ] Retry automático em caso de falha

## Arquivos a Criar:

### 6.1 - `functions/src/scheduler.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { publishPost } = require('./instagram-publisher');

/**
 * Cron job: Executa a cada hora
 * Verifica posts agendados e publica se chegou a hora
 */
exports.autoPublishScheduledPosts = functions
  .pubsub
  .schedule('every 1 hour')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    console.log('🔄 Verificando posts agendados...');

    try {
      const now = admin.firestore.Timestamp.now();

      // Buscar posts agendados que estão prontos para publicar
      const query = admin.firestore()
        .collection('instagram_posts')
        .where('status', '==', 'scheduled')
        .where('scheduledTime', '<=', now)
        .limit(50); // Processar no máximo 50 por vez

      const snapshot = await query.get();

      console.log(`📋 ${snapshot.size} posts encontrados`);

      // Processar cada post
      const promises = snapshot.docs.map(async (doc) => {
        const post = doc.data();
        const postId = doc.id;

        try {
          console.log(`📤 Publicando post ${postId}...`);

          // Verificar limite diário do usuário
          const canPublish = await checkDailyLimit(post.userId);

          if (!canPublish) {
            console.log(`⏸️ Limite diário atingido para usuário ${post.userId}`);
            // Reagendar para amanhã
            await doc.ref.update({
              scheduledTime: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h
              )
            });
            return;
          }

          // Publicar (usa função da FASE 5)
          await publishPost(postId, post.userId);

          console.log(`✅ Post ${postId} publicado com sucesso`);

        } catch (error) {
          console.error(`❌ Erro ao publicar post ${postId}:`, error);

          // Atualizar com erro
          await doc.ref.update({
            status: 'failed',
            errorMessage: error.message,
            retryCount: admin.firestore.FieldValue.increment(1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Retry automático (máximo 3 tentativas)
          if ((post.retryCount || 0) < 3) {
            console.log(`🔄 Reagendando post ${postId} para retry...`);
            await doc.ref.update({
              status: 'scheduled',
              scheduledTime: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 60 * 60 * 1000) // +1h
              )
            });
          } else {
            console.log(`⛔ Post ${postId} atingiu limite de tentativas`);
            // Notificar usuário
            await notifyFailure(post.userId, postId, error.message);
          }
        }
      });

      await Promise.all(promises);

      console.log('✅ Processamento de posts agendados concluído');

    } catch (error) {
      console.error('❌ Erro no cron job:', error);
    }
  });

/**
 * Verifica se usuário ainda pode publicar hoje
 */
async function checkDailyLimit(userId) {
  // Buscar configurações do usuário
  const settingsDoc = await admin.firestore()
    .collection('instagram_settings')
    .doc(userId)
    .get();

  if (!settingsDoc.exists) return false;

  const settings = settingsDoc.data();
  const maxPostsPerDay = settings.postsPerDay || 5;

  // Contar posts publicados hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayQuery = admin.firestore()
    .collection('instagram_posts')
    .where('userId', '==', userId)
    .where('status', '==', 'published')
    .where('publishedTime', '>=', admin.firestore.Timestamp.fromDate(today));

  const todaySnapshot = await todayQuery.get();

  return todaySnapshot.size < maxPostsPerDay;
}

/**
 * Notifica usuário sobre falha
 */
async function notifyFailure(userId, postId, errorMessage) {
  // Buscar configurações
  const settingsDoc = await admin.firestore()
    .collection('instagram_settings')
    .doc(userId)
    .get();

  if (!settingsDoc.exists || !settingsDoc.data().notifyOnError) {
    return; // Notificações desabilitadas
  }

  // Enviar notificação via sistema existente (Telegram/Discord)
  // Usar sistema já implementado em firebase.js
  console.log(`📧 Notificação de erro enviada para usuário ${userId}`);
}

/**
 * Agenda post para horário específico
 */
exports.schedulePost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Não autenticado');
  }

  try {
    const { postId, scheduledTime } = data;

    // Validar timestamp
    if (!scheduledTime || scheduledTime < Date.now()) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Horário agendado inválido'
      );
    }

    // Atualizar post
    await admin.firestore()
      .collection('instagram_posts')
      .doc(postId)
      .update({
        status: 'scheduled',
        scheduledTime: admin.firestore.Timestamp.fromDate(new Date(scheduledTime)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return { success: true };

  } catch (error) {
    console.error('Erro ao agendar post:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### 6.2 - Configurar Cron no `firebase.json`

```json
// Adicionar ao firebase.json existente
{
  "functions": {
    "source": "functions"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/r/**",
        "destination": "/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 6.3 - Cliente Frontend (`src/utils/scheduler-client.js`)

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Agenda post para horário específico
 */
export async function schedulePost(postId, scheduledTime) {
  try {
    const schedule = httpsCallable(functions, 'schedulePost');
    await schedule({
      postId,
      scheduledTime: scheduledTime.getTime()
    });

    return { success: true };

  } catch (error) {
    console.error('Erro ao agendar:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sugere próximo horário disponível para publicação
 */
export async function suggestNextSlot(userId, settings) {
  // Buscar posts agendados para hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { postsPerDay, postingHours } = settings;

  // Buscar posts já agendados/publicados hoje
  // ... (implementar query)

  // Encontrar próximo slot disponível
  const now = new Date();
  const currentHour = now.getHours();

  const availableHours = postingHours.filter(hour => hour > currentHour);

  if (availableHours.length === 0) {
    // Agendar para amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(postingHours[0], 0, 0, 0);
    return tomorrow;
  }

  // Próximo horário disponível hoje
  const nextHour = availableHours[0];
  const nextSlot = new Date(today);
  nextSlot.setHours(nextHour, 0, 0, 0);

  return nextSlot;
}
```

### 6.4 - Componente de Agendamento (`src/components/instagram/PostScheduler.jsx`)

```javascript
import React, { useState } from 'react';
import { schedulePost, suggestNextSlot } from '../../utils/scheduler-client';

const PostScheduler = ({ post, settings, onScheduled }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedHour) {
      alert('Selecione data e horário');
      return;
    }

    setScheduling(true);

    try {
      const scheduledTime = new Date(`${selectedDate}T${selectedHour}:00`);

      const result = await schedulePost(post.id, scheduledTime);

      if (result.success) {
        alert('✅ Post agendado com sucesso!');
        onScheduled();
      } else {
        alert('Erro: ' + result.error);
      }

    } catch (error) {
      alert('Erro ao agendar post');
    }

    setScheduling(false);
  };

  const handleSuggestSlot = async () => {
    const suggested = await suggestNextSlot(post.userId, settings);

    const dateStr = suggested.toISOString().split('T')[0];
    const hourStr = suggested.toTimeString().split(':')[0].padStart(2, '0');

    setSelectedDate(dateStr);
    setSelectedHour(`${hourStr}:00`);
  };

  return (
    <div className="post-scheduler">
      <h3>📅 Agendar Publicação</h3>

      <div className="form-group">
        <label>Data</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="input"
        />
      </div>

      <div className="form-group">
        <label>Horário</label>
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(e.target.value)}
          className="input"
        >
          <option value="">Selecione...</option>
          {settings.postingHours.map(hour => (
            <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
              {hour}:00
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSuggestSlot}
        className="btn btn-secondary"
      >
        💡 Sugerir Próximo Horário
      </button>

      <button
        onClick={handleSchedule}
        disabled={scheduling || !selectedDate || !selectedHour}
        className="btn btn-primary"
      >
        {scheduling ? '⏳ Agendando...' : '📅 Agendar Post'}
      </button>
    </div>
  );
};

export default PostScheduler;
```

## Deploy:
```bash
firebase deploy --only functions:autoPublishScheduledPosts,functions:schedulePost
```

## Testes de Validação:

### Teste 1: Agendar Post - Horário Futuro
```
1. Criar rascunho
2. Agendar para daqui 2 horas
✅ Status muda para "scheduled"
✅ scheduledTime salvo corretamente
```

### Teste 2: Sugerir Próximo Horário
```
1. Clicar em "Sugerir Próximo Horário"
✅ Data e hora preenchidos automaticamente
✅ Respeita horários configurados
```

### Teste 3: Cron Job - Publicação Automática
```
1. Agendar post para daqui 5 minutos
2. Aguardar execução do cron (roda a cada hora)
   OU executar manualmente via Firebase Console
✅ Post publicado automaticamente
✅ Status muda para "published"
```

### Teste 4: Limite Diário
```
1. Configurar limite de 2 posts/dia
2. Publicar 2 posts
3. Tentar agendar 3º post para hoje
✅ 3º post reagendado para amanhã automaticamente
```

### Teste 5: Retry Automático
```
1. Desconectar Instagram
2. Agendar post
3. Aguardar tentativa de publicação (falha)
✅ Status muda para "failed"
✅ Post reagendado para retry (+1h)
✅ Após 3 tentativas, para de tentar
```

## Critérios de Conclusão:
✅ Cron job configurado e rodando
✅ Agendamento funcionando
✅ Limite diário respeitado
✅ Retry automático funcionando
✅ Todos os 5 testes passando
✅ Commit realizado

---

# 📊 FASE 7: ANALYTICS E MONITORAMENTO

**Duração**: 2-3 dias
**Status**: ⏳ Pendente
**Dependências**: FASE 5, FASE 6

## Objetivos:
- [ ] Dashboard de métricas consolidadas
- [ ] Gráficos de performance
- [ ] Comparação de posts
- [ ] Exportação de relatórios
- [ ] Alertas automáticos

## Componentes a Criar:

### 7.1 - `src/components/instagram/InstagramAnalytics.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InstagramAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d'); // 7d, 30d, 90d, all

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      // Calcular data inicial baseado no período
      const startDate = getStartDate(period);

      // Buscar posts publicados no período
      const q = query(
        collection(db, 'instagram_posts'),
        where('userId', '==', auth.currentUser.uid),
        where('status', '==', 'published'),
        where('publishedTime', '>=', startDate),
        orderBy('publishedTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedTime: doc.data().publishedTime.toDate()
      }));

      setPosts(postsData);

      // Calcular estatísticas agregadas
      const aggregated = calculateStats(postsData);
      setStats(aggregated);

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }

    setLoading(false);
  };

  const getStartDate = (period) => {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(0); // Todos
    }
  };

  const calculateStats = (posts) => {
    const total = posts.length;

    const totalLikes = posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0);
    const totalSaves = posts.reduce((sum, p) => sum + (p.engagement?.saves || 0), 0);
    const totalReach = posts.reduce((sum, p) => sum + (p.engagement?.reach || 0), 0);
    const totalImpressions = posts.reduce((sum, p) => sum + (p.engagement?.impressions || 0), 0);

    const avgLikes = total > 0 ? Math.round(totalLikes / total) : 0;
    const avgComments = total > 0 ? Math.round(totalComments / total) : 0;
    const avgEngagementRate = total > 0
      ? (((totalLikes + totalComments) / totalReach) * 100).toFixed(2)
      : 0;

    // Encontrar melhor e pior post
    const sortedByEngagement = [...posts].sort((a, b) =>
      (b.engagement?.likes || 0) - (a.engagement?.likes || 0)
    );

    return {
      total,
      totalLikes,
      totalComments,
      totalSaves,
      totalReach,
      totalImpressions,
      avgLikes,
      avgComments,
      avgEngagementRate,
      bestPost: sortedByEngagement[0] || null,
      worstPost: sortedByEngagement[sortedByEngagement.length - 1] || null
    };
  };

  // Preparar dados para gráficos
  const chartData = posts.map(post => ({
    date: post.publishedTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    likes: post.engagement?.likes || 0,
    comments: post.engagement?.comments || 0,
    saves: post.engagement?.saves || 0
  }));

  if (loading) {
    return <div>Carregando analytics...</div>;
  }

  return (
    <div className="instagram-analytics">
      <div className="analytics-header">
        <h2>📊 Analytics do Instagram</h2>

        {/* Seletor de Período */}
        <div className="period-selector">
          <button
            className={period === '7d' ? 'active' : ''}
            onClick={() => setPeriod('7d')}
          >
            7 dias
          </button>
          <button
            className={period === '30d' ? 'active' : ''}
            onClick={() => setPeriod('30d')}
          >
            30 dias
          </button>
          <button
            className={period === '90d' ? 'active' : ''}
            onClick={() => setPeriod('90d')}
          >
            90 dias
          </button>
          <button
            className={period === 'all' ? 'active' : ''}
            onClick={() => setPeriod('all')}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-value">{stats.total}</div>
            <div className="metric-label">Posts Publicados</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">❤️</div>
            <div className="metric-value">{stats.totalLikes.toLocaleString()}</div>
            <div className="metric-label">Total de Likes</div>
            <div className="metric-avg">Média: {stats.avgLikes}/post</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">💬</div>
            <div className="metric-value">{stats.totalComments.toLocaleString()}</div>
            <div className="metric-label">Total de Comentários</div>
            <div className="metric-avg">Média: {stats.avgComments}/post</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🔖</div>
            <div className="metric-value">{stats.totalSaves.toLocaleString()}</div>
            <div className="metric-label">Total de Salvos</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-value">{stats.totalReach.toLocaleString()}</div>
            <div className="metric-label">Alcance Total</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-value">{stats.avgEngagementRate}%</div>
            <div className="metric-label">Taxa de Engajamento</div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>📈 Evolução de Likes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="likes" stroke="#e1306c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>📊 Comparação de Engajamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" fill="#e1306c" />
              <Bar dataKey="comments" fill="#405de6" />
              <Bar dataKey="saves" fill="#5851db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Melhor e Pior Post */}
      {stats && stats.bestPost && (
        <div className="best-worst-section">
          <div className="best-post">
            <h3>🏆 Melhor Post</h3>
            {stats.bestPost.imageUrl && (
              <img src={stats.bestPost.imageUrl} alt="Melhor post" />
            )}
            <p><strong>Likes:</strong> {stats.bestPost.engagement?.likes || 0}</p>
            <p><strong>Comments:</strong> {stats.bestPost.engagement?.comments || 0}</p>
            <a href={stats.bestPost.instagramPermalink} target="_blank" rel="noreferrer">
              Ver no Instagram →
            </a>
          </div>

          {stats.worstPost && stats.total > 1 && (
            <div className="worst-post">
              <h3>📉 Pior Post</h3>
              {stats.worstPost.imageUrl && (
                <img src={stats.worstPost.imageUrl} alt="Pior post" />
              )}
              <p><strong>Likes:</strong> {stats.worstPost.engagement?.likes || 0}</p>
              <p><strong>Comments:</strong> {stats.worstPost.engagement?.comments || 0}</p>
              <a href={stats.worstPost.instagramPermalink} target="_blank" rel="noreferrer">
                Ver no Instagram →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Lista de Posts */}
      <div className="posts-table">
        <h3>📋 Histórico de Posts</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Preview</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Saves</th>
              <th>Alcance</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.publishedTime.toLocaleDateString('pt-BR')}</td>
                <td>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                </td>
                <td>❤️ {post.engagement?.likes || 0}</td>
                <td>💬 {post.engagement?.comments || 0}</td>
                <td>🔖 {post.engagement?.saves || 0}</td>
                <td>👥 {post.engagement?.reach || 0}</td>
                <td>
                  {post.instagramPermalink && (
                    <a href={post.instagramPermalink} target="_blank" rel="noreferrer">
                      Ver →
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão de Exportar */}
      <button
        className="btn btn-secondary"
        onClick={() => exportToCSV(posts)}
      >
        📥 Exportar Relatório (CSV)
      </button>
    </div>
  );
};

/**
 * Exporta dados para CSV
 */
function exportToCSV(posts) {
  const headers = ['Data', 'Likes', 'Comentários', 'Salvos', 'Alcance', 'Impressões', 'Link'];

  const rows = posts.map(post => [
    post.publishedTime.toLocaleDateString('pt-BR'),
    post.engagement?.likes || 0,
    post.engagement?.comments || 0,
    post.engagement?.saves || 0,
    post.engagement?.reach || 0,
    post.engagement?.impressions || 0,
    post.instagramPermalink || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `instagram-analytics-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export default InstagramAnalytics;
```

## Testes de Validação:

### Teste 1: Visualizar Métricas
```
1. Publicar alguns posts
2. Sincronizar métricas
3. Abrir tab "Analytics"
✅ Cards de métricas exibidos
✅ Valores corretos
```

### Teste 2: Filtrar por Período
```
1. Trocar de "7 dias" para "30 dias"
✅ Dados recarregados
✅ Gráficos atualizados
```

### Teste 3: Gráficos
```
1. Verificar gráfico de linha (evolução)
2. Verificar gráfico de barras (comparação)
✅ Gráficos renderizados corretamente
✅ Dados corretos
```

### Teste 4: Melhor/Pior Post
```
1. Verificar seção de melhor e pior post
✅ Post correto identificado
✅ Imagem e métricas exibidas
```

### Teste 5: Exportar CSV
```
1. Clicar em "Exportar Relatório"
✅ Arquivo CSV baixado
✅ Dados corretos no CSV
```

## Critérios de Conclusão:
✅ Dashboard de analytics funcionando
✅ Gráficos renderizando corretamente
✅ Exportação de CSV funcionando
✅ Todos os 5 testes passando
✅ Commit realizado

---

# 🧪 FASE 8: TESTES FINAIS E DEPLOY

**Duração**: 2-3 dias
**Status**: ⏳ Pendente
**Dependências**: TODAS as fases anteriores

## Objetivos:
- [ ] Testes end-to-end completos
- [ ] Correção de bugs encontrados
- [ ] Otimização de performance
- [ ] Documentação final
- [ ] Deploy em produção

## Checklist de Testes:

### 8.1 - Fluxo Completo (E2E)
```
✅ 1. Login no sistema
✅ 2. Abrir tab "Instagram"
✅ 3. Extrair produto do Mercado Livre
✅ 4. Gerar imagem (template moderno)
✅ 5. Editar legenda e hashtags
✅ 6. Salvar como rascunho
✅ 7. Ir para "Fila de Posts"
✅ 8. Abrir rascunho
✅ 9. Agendar para daqui 1 hora
✅ 10. Aguardar publicação automática
✅ 11. Verificar post no Instagram
✅ 12. Sincronizar métricas
✅ 13. Ver analytics
```

### 8.2 - Testes de Erro
```
✅ URL inválida → Mensagem de erro amigável
✅ Instagram desconectado → Alerta ao tentar publicar
✅ Limite diário atingido → Post reagendado
✅ Falha na geração de imagem → Erro tratado
✅ Token expirado → Solicita reconexão
```

### 8.3 - Testes de Performance
```
✅ Tempo de scraping < 10s
✅ Tempo de geração de imagem < 15s
✅ Carregamento da fila < 2s
✅ Analytics carrega < 3s
✅ Interface responsiva sem lags
```

### 8.4 - Testes de Responsividade
```
✅ Desktop (1920x1080)
✅ Laptop (1366x768)
✅ Tablet (768x1024)
✅ Mobile (375x667)
```

### 8.5 - Testes de Segurança
```
✅ Firestore rules impedem acesso não autorizado
✅ Tokens criptografados
✅ Validação de dados no backend
✅ Rate limiting nas Cloud Functions
```

## Otimizações:

### 8.6 - Performance
```javascript
// Lazy loading de componentes
const InstagramAnalytics = React.lazy(() => import('./components/instagram/InstagramAnalytics'));

// Memoização
const PostCard = React.memo(({ post }) => {
  // ...
});

// Debounce em inputs
const debouncedSearch = useMemo(
  () => debounce((value) => {
    // buscar...
  }, 500),
  []
);
```

### 8.7 - SEO e Meta Tags
```html
<!-- Adicionar em public/index.html -->
<meta name="description" content="Sistema de automação de posts para Instagram - BuscaBusca Brasil">
<meta property="og:title" content="BuscaBusca Instagram Automation">
<meta property="og:description" content="Automatize seus posts no Instagram com links de produtos">
```

## Documentação Final:

### 8.8 - `INSTAGRAM-AUTOMATION-README.md`
```markdown
# 📱 Sistema de Automação Instagram

## Funcionalidades

✅ Extração automática de dados de produtos (ML/Amazon)
✅ Geração de imagens para posts (3 templates)
✅ Editor de legendas com sugestões
✅ Agendamento de posts
✅ Publicação automática
✅ Analytics completo
✅ Sistema de retry

## Como Usar

1. **Conectar Instagram**
   - Ir em Configurações > Instagram
   - Clicar em "Conectar Instagram"
   - Autorizar acesso

2. **Criar Post**
   - Tab "Novo Post"
   - Colar URL do produto
   - Clicar em "Extrair Dados"
   - Editar legenda e hashtags
   - Salvar rascunho ou agendar

3. **Gerenciar Fila**
   - Tab "Fila de Posts"
   - Ver rascunhos, agendados e publicados
   - Editar ou deletar posts

4. **Ver Analytics**
   - Tab "Analytics"
   - Visualizar métricas
   - Exportar relatório

## Configurações

- **Posts por dia**: Máximo de posts automáticos/dia (recomendado: 5-10)
- **Horários de publicação**: Quando posts devem ser publicados
- **Template padrão**: Estilo visual dos posts
- **Tom das legendas**: Estilo de escrita

## Limites

- Instagram: 25 posts/dia (hard limit)
- Scraping: ~100 produtos/dia (evitar bloqueio)
- Cloud Functions: 2M invocações/mês (plano grátis)

## Troubleshooting

**Post não publicou automaticamente**
- Verificar se Instagram está conectado
- Verificar se token não expirou
- Verificar logs no Firebase Console

**Erro ao extrair produto**
- Verificar se URL é válida
- Tentar novamente (pode ser bloqueio temporário)
- Verificar console do navegador para detalhes

**Imagem não gerou**
- Verificar se produto tem imagens
- Verificar Cloud Functions logs
- Tentar template diferente

## Custos

- Firebase: Grátis até os limites
- Instagram API: Grátis
- OpenAI (opcional): ~R$ 0,01/legenda

## Suporte

Entre em contato via [seu email ou sistema de tickets]
```

## Deploy em Produção:

### 8.9 - Checklist Pré-Deploy
```
✅ Todos os testes passando
✅ Sem erros no console
✅ Sem warnings críticos
✅ .env configurado
✅ Firebase rules atualizadas
✅ Cloud Functions deployadas
✅ Documentação completa
✅ Backup do banco de dados
```

### 8.10 - Deploy
```bash
# 1. Build otimizado
npm run build

# 2. Deploy Firebase Hosting
firebase deploy --only hosting

# 3. Deploy Cloud Functions
firebase deploy --only functions

# 4. Deploy Firestore Rules
firebase deploy --only firestore:rules

# 5. Deploy Firestore Indexes
firebase deploy --only firestore:indexes

# 6. Verificar deploy
firebase hosting:channel:deploy production
```

### 8.11 - Pós-Deploy
```
✅ Testar em produção
✅ Verificar logs (Firebase Console)
✅ Monitorar erros (primeiras 24h)
✅ Verificar custos (Firebase Billing)
✅ Comunicar usuários sobre nova feature
```

## Critérios de Conclusão:
✅ Todos os testes E2E passando
✅ Nenhum bug crítico
✅ Performance dentro do esperado
✅ Documentação completa
✅ Deploy em produção bem-sucedido
✅ Sistema funcionando 100%
✅ Commit final realizado

---

# 🎉 CONCLUSÃO

## Resumo das Fases:

| Fase | Duração | Status |
|------|---------|--------|
| 0. Preparação | 1 dia | ⏳ Pendente |
| 1. Scraping Avançado | 3-4 dias | ⏳ Pendente |
| 2. Banco de Dados | 1-2 dias | ⏳ Pendente |
| 3. Geração de Imagens | 3-4 dias | ⏳ Pendente |
| 4. Interface | 4-5 dias | ⏳ Pendente |
| 5. Instagram API | 3-4 dias | ⏳ Pendente |
| 6. Agendamento | 2-3 dias | ⏳ Pendente |
| 7. Analytics | 2-3 dias | ⏳ Pendente |
| 8. Testes e Deploy | 2-3 dias | ⏳ Pendente |
| **TOTAL** | **21-31 dias** | **3-4 semanas** |

## Próximos Passos:

1. ✅ **Você aprova este plano?**
2. 🚀 **Começamos pela FASE 0?**
3. 📅 **Define algum prazo específico?**

**Estou pronto para começar agora mesmo!** 💪

Qual fase quer que eu comece?
