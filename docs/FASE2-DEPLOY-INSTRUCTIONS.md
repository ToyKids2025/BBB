# 🚀 FASE 2: INSTRUÇÕES DE DEPLOY - Estrutura de Banco de Dados

**Data**: 13/10/2025
**Status**: ✅ **CÓDIGO CONCLUÍDO** - Aguardando deploy manual

---

## 📦 O Que Foi Criado

### 1. Funções Firebase (firebase-instagram.js)
- ✅ `saveInstagramProduct()` - Salvar produto extraído
- ✅ `getInstagramProducts()` - Buscar produtos do usuário
- ✅ `deleteInstagramProduct()` - Deletar produto
- ✅ `createInstagramPost()` - Criar novo post (draft)
- ✅ `getInstagramPosts()` - Buscar posts do usuário
- ✅ `updateInstagramPost()` - Atualizar post
- ✅ `deleteInstagramPost()` - Deletar post
- ✅ `getScheduledPosts()` - Buscar posts agendados
- ✅ `saveInstagramSettings()` - Salvar configurações
- ✅ `getInstagramSettings()` - Buscar configurações
- ✅ `saveInstagramAnalytics()` - Salvar analytics
- ✅ `getInstagramAnalytics()` - Buscar analytics por período
- ✅ `saveProductCache()` - Salvar cache de produto
- ✅ `getProductCache()` - Buscar cache de produto

### 2. Regras de Segurança (firestore.rules)
Adicionadas regras para 5 novas collections:
- `instagram_products` - Apenas dono lê/escreve
- `instagram_posts` - Apenas dono lê/escreve
- `instagram_settings` - Apenas dono acessa
- `instagram_analytics_daily` - Dono lê, Cloud Functions escrevem
- `product_cache` - Público (cache compartilhado)

### 3. Índices Otimizados (firestore.indexes.json)
7 novos índices compostos:
- `instagram_products`: userId + createdAt
- `instagram_products`: userId + platform + createdAt
- `instagram_posts`: userId + createdAt
- `instagram_posts`: userId + status + createdAt
- `instagram_posts`: userId + status + scheduledFor
- `instagram_analytics_daily`: userId + date

---

## 🚀 COMO FAZER O DEPLOY

### Passo 1: Autenticar no Firebase

```bash
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

### Passo 2: Verificar projeto ativo

```bash
firebase projects:list
```

Se necessário, selecionar o projeto correto:

```bash
firebase use afiliador-inteligente
```

### Passo 3: Testar regras localmente (OPCIONAL)

```bash
# Validar sintaxe das regras
firebase firestore:rules:test

# Se tudo OK, você verá:
# ✔ Firestore rules tests passed
```

### Passo 4: Fazer deploy das regras e índices

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Você verá algo assim:

```
=== Deploying to 'afiliador-inteligente'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
✔  firestore: deployed indexes in firestore.indexes.json successfully
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

### Passo 5: Verificar deploy no console

1. Acessar: https://console.firebase.google.com/project/afiliador-inteligente/firestore
2. Clicar em **Regras**
3. Verificar se as novas regras do Instagram estão lá
4. Clicar em **Índices**
5. Verificar se os 7 novos índices estão sendo criados

**⚠️ IMPORTANTE**: Índices compostos podem levar **5-10 minutos** para serem criados no Firebase!

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Teste 1: Verificar regras no console
1. Firebase Console > Firestore > Regras
2. Procurar por `instagram_products`, `instagram_posts`, etc.
3. Confirmar que estão lá

### Teste 2: Testar CRUD de produtos (manual)

Abrir console do navegador (F12) e colar:

```javascript
import { saveInstagramProduct, getInstagramProducts } from './utils/instagram/firebase-instagram';

// Teste 1: Salvar produto
const result = await saveInstagramProduct({
  title: 'Produto de Teste',
  price: 99.90,
  images: ['https://via.placeholder.com/500'],
  platform: 'mercadolivre',
  sourceUrl: 'https://produto.mercadolivre.com.br/MLB-teste'
});

console.log('Produto salvo:', result);

// Teste 2: Buscar produtos
const { products } = await getInstagramProducts();
console.log('Produtos encontrados:', products);
```

### Teste 3: Verificar índices

1. Firebase Console > Firestore > Índices
2. Verificar status dos índices:
   - ✅ Verde = Criado e ativo
   - 🟡 Amarelo = Criando (aguardar 5-10 min)
   - ❌ Vermelho = Erro (verificar logs)

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to authenticate"
**Solução**: Execute `firebase login` e faça login no navegador

### Erro: "Project not found"
**Solução**: Execute `firebase use afiliador-inteligente` ou `firebase use --add`

### Erro: "permission-denied" ao testar
**Causas possíveis**:
1. Regras não foram deployed → Fazer deploy
2. Usuário não está autenticado → Fazer login no app
3. UserId diferente → Verificar auth.currentUser.uid

### Índices demorando muito
- Normal! Índices compostos podem levar 5-10 minutos
- Se passar de 15 minutos, verificar logs de erro no console

### Deploy deu erro de sintaxe
- Verificar `firestore.rules` e `firestore.indexes.json`
- Certificar que JSON está válido (usar JSONLint.com)
- Verificar se não tem vírgula extra ou faltando

---

## 📊 ESTRUTURA DAS COLLECTIONS

### `instagram_products`
```javascript
{
  id: 'auto-gerado',
  title: 'Notebook Gamer Acer Nitro 5',
  price: 3499.90,
  originalPrice: 3999.90,
  discount: 12,
  images: ['url1', 'url2', ...],
  rating: 4.8,
  reviewCount: 1250,
  platform: 'mercadolivre',
  sourceUrl: 'https://produto.mercadolivre.com.br/MLB-...',
  userId: 'user-uid',
  createdAt: Timestamp,
  lastUsedAt: Timestamp | null,
  usageCount: 0
}
```

### `instagram_posts`
```javascript
{
  id: 'auto-gerado',
  productId: 'ref-to-product',
  caption: 'Confira esta oferta incrível!',
  hashtags: ['#ofertas', '#mercadolivre'],
  template: 'moderno',
  status: 'draft', // draft, scheduled, publishing, published, failed
  imageUrl: 'https://storage.googleapis.com/...',
  instagramPostId: '123456789' | null,
  scheduledFor: Timestamp | null,
  publishedAt: Timestamp | null,
  userId: 'user-uid',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  error: string | null
}
```

### `instagram_settings`
```javascript
{
  userId: 'user-uid', // Usado como ID do documento
  accessToken: 'encrypted-token',
  instagramAccountId: '123456789',
  postsPerDay: 5,
  publishHours: [9, 12, 15, 18, 21],
  defaultTemplate: 'moderno',
  defaultTone: 'entusiasta',
  autoHashtags: true,
  useAI: false,
  updatedAt: Timestamp
}
```

### `instagram_analytics_daily`
```javascript
{
  id: 'auto-gerado',
  userId: 'user-uid',
  postId: 'ref-to-post',
  date: '2025-10-13',
  likes: 150,
  comments: 25,
  shares: 10,
  reach: 5000,
  impressions: 8000,
  engagement: 3.7, // %
  createdAt: Timestamp
}
```

### `product_cache`
```javascript
{
  id: 'base64(url)', // URL encodada como ID
  url: 'https://produto.mercadolivre.com.br/MLB-...',
  data: { /* dados do produto */ },
  createdAt: Timestamp,
  expiresAt: Timestamp // 24h
}
```

---

## 🎯 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

✅ **FASE 2 CONCLUÍDA** → Banco de dados configurado

🚀 **Próximo**: FASE 3 - Geração de Imagens para Posts
- Criar templates visuais (3 estilos)
- Usar Canvas API ou Sharp
- Gerar imagens 1080x1080 para Instagram
- Salvar no Firebase Storage

---

## 📝 COMANDOS ÚTEIS

```bash
# Ver status do deploy
firebase deploy:status

# Testar regras localmente
firebase emulators:start --only firestore

# Ver logs de erros
firebase functions:log

# Listar todos os projetos
firebase projects:list

# Ver configuração atual
firebase list
```

---

**Última Atualização**: 13/10/2025
**Commit**: `6967a9e` - 💾 FASE 2: Adicionar estrutura de banco de dados Firestore
**Deploy Status**: ⏳ Aguardando deploy manual pelo usuário
