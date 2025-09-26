# BBB Link Enhancer - Guia Completo de Deployment

## 🚀 Visão Geral do Sistema

**Missão:** "Desenvolver um sistema inteligente que transforme cliques em oportunidades reais: redirecionamento de borda + armazenamento first-party + add-to-cart/deep links, para recuperar comissões que hoje se perdem e gerar métricas confiáveis para otimizar campanhas."

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Deploy Rápido (MVP)](#deploy-rápido-mvp)
3. [Configuração Cloudflare](#configuração-cloudflare)
4. [Deploy do Admin Panel](#deploy-do-admin-panel)
5. [Configuração de Segurança](#configuração-de-segurança)
6. [Táticas de Persistência](#táticas-de-persistência)
7. [Roadmap de Implementação](#roadmap-de-implementação)
8. [Métricas e KPIs](#métricas-e-kpis)
9. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitetura

### Stack Tecnológica (Custo Zero - Free Tiers)

- **Edge Workers:** Cloudflare Workers (10M requests/mês grátis)
- **Storage:** Cloudflare KV (100k reads/dia grátis)
- **Admin UI:** React + Vercel/Cloudflare Pages (ilimitado)
- **Database:** Supabase PostgreSQL (500MB grátis)
- **Domain:** bbbrasil.com (já existente)
- **Analytics:** Cloudflare Analytics (grátis)

### Fluxo de Dados

```
Usuário clica no link → Cloudflare Worker → 
  ├─ Grava cookie first-party (30 dias)
  ├─ Salva localStorage via HTML intermediário
  ├─ Registra click no KV
  ├─ Tenta deep link (app)
  └─ Redirect para destino com aff_id
```

## ⚡ Deploy Rápido (MVP)

### Passo 1: Configurar Domínio no Cloudflare

```bash
# 1. Criar conta no Cloudflare (gratuito)
# 2. Adicionar domínio bbbrasil.com
# 3. Atualizar nameservers no registrador
# 4. Esperar propagação DNS (5-30min)
```

### Passo 2: Deploy do Worker

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Login no Cloudflare
wrangler login

# Criar projeto
mkdir bbb-worker && cd bbb-worker

# Copiar o arquivo worker/index.js para esta pasta

# Criar wrangler.toml
cat > wrangler.toml << EOF
name = "bbb-link-enhancer"
main = "index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "BBB_LINKS"
id = "YOUR_KV_NAMESPACE_ID"

[env.production]
vars = { ENVIRONMENT = "production" }
EOF

# Criar KV namespace
wrangler kv:namespace create "BBB_LINKS"
# Copiar o ID gerado e colocar no wrangler.toml

# Deploy
wrangler publish

# Configurar rota customizada
# No dashboard Cloudflare: Workers → Routes
# Adicionar: bbbrasil.com/* → bbb-link-enhancer
```

### Passo 3: Deploy do Admin Panel

```bash
# Clonar o projeto
cd admin

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cat > .env << EOF
REACT_APP_API_URL=https://bbbrasil.com/api
EOF

# Build
npm run build

# Deploy no Cloudflare Pages
npx wrangler pages deploy build --project-name=bbb-admin

# Ou deploy no Vercel
npm i -g vercel
vercel --prod
```

### Passo 4: Criar Primeiro Link

```bash
# Via curl (para teste)
curl -X POST https://bbbrasil.com/api/redirects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dest": "https://www.amazon.com.br/dp/B08N5WRWNW?tag=seu-tag-20",
    "title": "Echo Dot 4ª Geração",
    "platform": "amazon",
    "owner": "CAMPANHA001"
  }'

# Resposta esperada:
# {
#   "success": true,
#   "key": "abc123",
#   "short_url": "https://bbbrasil.com/r/abc123"
# }
```

## 🔧 Configuração Cloudflare

### KV Namespaces

Criar os seguintes namespaces no dashboard:

1. **BBB_LINKS** - Armazena redirects e configurações
2. **BBB_CLICKS** - Armazena logs de clicks
3. **BBB_STATS** - Armazena estatísticas agregadas

### Workers Routes

```
bbbrasil.com/r/*     → bbb-link-enhancer (redirect handler)
bbbrasil.com/api/*   → bbb-api-worker (API endpoints)
bbbrasil.com/admin/* → Pages (React admin)
```

### Page Rules (Otimização)

1. `bbbrasil.com/r/*` - Cache Level: Bypass
2. `bbbrasil.com/api/*` - Cache Level: Bypass  
3. `bbbrasil.com/admin/*` - Browser Cache TTL: 1 hour

## 👨‍💼 Deploy do Admin Panel

### Opção A: Cloudflare Pages (Recomendado)

```bash
# Build local
cd admin
npm run build

# Deploy via Wrangler
wrangler pages deploy build \
  --project-name=bbb-admin \
  --branch=main

# URL final: bbb-admin.pages.dev
# Configurar domínio customizado: admin.bbbrasil.com
```

### Opção B: Vercel

```bash
# Deploy direto
cd admin
vercel --prod

# Configurar domínio customizado no dashboard Vercel
```

### Opção C: Netlify

```bash
# Via CLI
npm install -g netlify-cli
netlify deploy --prod --dir=build

# Ou arrastar pasta build para netlify.com
```

## 🔒 Configuração de Segurança

### 1. Autenticação Básica (MVP)

```javascript
// Worker auth middleware
const API_KEY = "sk_live_xxxxxxxxxxxxx";

async function authenticate(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const token = auth.split(' ')[1];
  if (token !== API_KEY) {
    return new Response('Invalid token', { status: 401 });
  }
  
  return null; // Authenticated
}
```

### 2. Rate Limiting

```javascript
// Cloudflare Worker rate limit
const RATE_LIMIT = {
  clicks: 100, // por IP por minuto
  api: 60      // por token por minuto
};

async function rateLimit(ip, type) {
  const key = `rate:${type}:${ip}`;
  const count = await BBB_LINKS.get(key) || 0;
  
  if (count > RATE_LIMIT[type]) {
    return false;
  }
  
  await BBB_LINKS.put(key, parseInt(count) + 1, {
    expirationTtl: 60 // 1 minuto
  });
  
  return true;
}
```

### 3. CORS Configuration

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://admin.bbbrasil.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
```

## 📊 Táticas de Persistência

### 1. First-Party Cookie (Básico)

```javascript
// 30 dias, Secure, SameSite=Lax
Set-Cookie: bb_ref=amazon:ALEX123:clickId; 
  Max-Age=2592000; 
  Path=/; 
  Secure; 
  SameSite=Lax
```

### 2. localStorage + History (Avançado)

```javascript
// Salvar múltiplos pontos de dados
localStorage.setItem('bb_ref', JSON.stringify({
  click_id: 'abc123',
  platform: 'amazon',
  owner: 'CAMP001',
  ts: Date.now()
}));

// Manter histórico de clicks
const history = JSON.parse(localStorage.getItem('bb_history') || '[]');
history.push(clickData);
localStorage.setItem('bb_history', JSON.stringify(history.slice(-10)));
```

### 3. IndexedDB (Máxima Persistência)

```javascript
// Para PWA e máxima durabilidade
const db = await openDB('BBBTracker', 1, {
  upgrade(db) {
    db.createObjectStore('clicks', { keyPath: 'id' });
    db.createObjectStore('refs', { keyPath: 'platform' });
  }
});

await db.add('clicks', clickData);
```

### 4. Service Worker (PWA)

```javascript
// sw.js - Para cache offline e persistência
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('bbb-v1').then(cache => {
      return cache.addAll(['/offline.html']);
    })
  );
});
```

### 5. Add-to-Cart Links (Amazon)

```javascript
// Converter link de produto em add-to-cart
function toAddToCart(productUrl) {
  const asin = productUrl.match(/\/dp\/([A-Z0-9]+)/)?.[1];
  const tag = productUrl.match(/tag=([^&]+)/)?.[1];
  
  if (asin && tag) {
    return `https://www.amazon.com.br/gp/aws/cart/add.html?` +
           `ASIN.1=${asin}&Quantity.1=1&tag=${tag}`;
  }
  return productUrl;
}
```

### 6. Deep Links (Apps)

```javascript
// Mercado Livre
const mlDeepLink = `mercadolibre://item?id=${productId}`;

// Amazon
const amzDeepLink = `com.amazon.mobile.shopping://www.amazon.com.br/dp/${asin}`;

// Instagram Shopping
const igShopLink = `instagram://shop_product?product_id=${productId}`;
```

## 📈 Roadmap de Implementação

### Fase 1: MVP (2-5 dias) ✅
- [x] Worker básico de redirect
- [x] Gravação de cookies
- [x] Página intermediária com localStorage
- [x] Admin panel básico
- [x] CRUD de shortlinks
- [x] Visualização de clicks

### Fase 2: Otimização (1 semana)
- [ ] Add-to-cart automático Amazon
- [ ] Deep links MercadoLivre
- [ ] Dashboard com gráficos
- [ ] Export CSV de clicks
- [ ] Rate limiting

### Fase 3: Analytics (2 semanas)
- [ ] Integração com conversões
- [ ] Reconciliação manual
- [ ] Relatórios automatizados
- [ ] A/B testing de links
- [ ] Heatmap de clicks

### Fase 4: Escala (1 mês)
- [ ] PWA com Service Worker
- [ ] Push notifications
- [ ] Múltiplos domínios
- [ ] API pública
- [ ] Webhooks

### Fase 5: Enterprise (2 meses)
- [ ] Multi-tenant
- [ ] SSO/SAML
- [ ] Audit logs completos
- [ ] Compliance LGPD
- [ ] SLA 99.9%

## 📊 Métricas e KPIs

### Métricas Principais

1. **Click-Through Rate (CTR)**
   - Meta: > 5%
   - Fórmula: Clicks / Impressões

2. **Conversion Rate**
   - Meta: > 2%
   - Fórmula: Conversões / Clicks

3. **Cookie Persistence Rate**
   - Meta: > 70%
   - Fórmula: Clicks com cookie / Total clicks

4. **Add-to-Cart Success**
   - Meta: > 30%
   - Fórmula: Add-to-cart bem sucedidos / Tentativas

5. **Revenue Recovery**
   - Meta: +15% comissões
   - Fórmula: Comissões atribuídas / Comissões totais

### Dashboard KPIs

```javascript
// Query para KPIs em tempo real
const kpis = {
  clicks_today: await getClicksCount('today'),
  clicks_week: await getClicksCount('week'),
  conversion_rate: await getConversionRate(),
  top_links: await getTopLinks(10),
  device_breakdown: await getDeviceStats(),
  revenue: await getRevenue('month')
};
```

## 🐛 Troubleshooting

### Problema: Links não redirecionam

```bash
# Verificar Worker
wrangler tail --format pretty

# Testar KV
wrangler kv:key get --namespace-id=xxx "redirect:abc123"

# Verificar rotas
curl -I https://bbbrasil.com/r/test
```

### Problema: Cookies não persistem

```javascript
// Verificar headers
console.log(document.cookie);

// Testar localStorage
localStorage.setItem('test', '123');
console.log(localStorage.getItem('test'));

// Verificar HTTPS
if (location.protocol !== 'https:') {
  console.error('Cookies Secure requerem HTTPS');
}
```

### Problema: Add-to-cart não funciona

```javascript
// Debug add-to-cart URL
const testUrl = 'https://www.amazon.com.br/gp/aws/cart/add.html?' +
                'ASIN.1=B08N5WRWNW&Quantity.1=1&tag=teste-20';

// Testar manualmente
window.open(testUrl);
```

## 📱 Testes Essenciais

### Checklist de Testes

- [ ] Instagram in-app browser (iOS)
- [ ] Safari iPhone
- [ ] Chrome Android  
- [ ] Amazon app redirect
- [ ] MercadoLivre app redirect
- [ ] Cookie persistence 24h
- [ ] localStorage persistence
- [ ] Add-to-cart Amazon
- [ ] Deep link apps
- [ ] Rate limiting
- [ ] CORS headers
- [ ] SSL/HTTPS

### Script de Teste Automatizado

```javascript
// tests/e2e.js
const { test, expect } = require('@playwright/test');

test('redirect flow', async ({ page }) => {
  // Criar link
  const response = await page.request.post('/api/redirects', {
    headers: { 'Authorization': 'Bearer token' },
    data: { dest: 'https://amazon.com.br/dp/TEST' }
  });
  
  const { key } = await response.json();
  
  // Testar redirect
  await page.goto(`/r/${key}`);
  
  // Verificar cookie
  const cookies = await page.context().cookies();
  expect(cookies.some(c => c.name === 'bb_ref')).toBeTruthy();
  
  // Verificar localStorage
  const stored = await page.evaluate(() => localStorage.getItem('bb_ref'));
  expect(stored).toBeTruthy();
});
```

## 🚢 Go Live Checklist

### Antes do Lançamento

- [ ] DNS configurado no Cloudflare
- [ ] Workers deployed e testados
- [ ] Admin panel acessível
- [ ] Autenticação configurada
- [ ] Rate limiting ativo
- [ ] Backup do KV configurado
- [ ] Monitoramento ativo
- [ ] Política de privacidade
- [ ] Teste em produção
- [ ] Documentação atualizada

### Primeiro Dia

1. Criar 10 shortlinks principais
2. Testar cada link manualmente
3. Postar 1 link no Instagram
4. Monitorar clicks em tempo real
5. Verificar cookies/localStorage
6. Ajustar conforme necessário

### Primeira Semana

- Analisar taxa de conversão
- Identificar top performers
- Otimizar links com baixa performance
- Implementar A/B testing
- Expandir para mais produtos

## 💰 Análise de Custos

### Free Tier Limits

| Serviço | Free Tier | Uso Estimado | Status |
|---------|-----------|--------------|--------|
| Cloudflare Workers | 100k req/dia | 50k/dia | ✅ OK |
| KV Storage | 100k reads/dia | 30k/dia | ✅ OK |
| KV Storage Space | 1GB | 100MB | ✅ OK |
| Vercel/Pages | Ilimitado | - | ✅ OK |
| Supabase | 500MB | 50MB | ✅ OK |

### Quando Escalar

- > 100k clicks/dia → Cloudflare Pro ($20/mês)
- > 1GB dados → Supabase Pro ($25/mês)
- > 10 usuários admin → Auth0 ($23/mês)

## 📞 Suporte e Contato

### Recursos

- Documentação Cloudflare Workers: https://developers.cloudflare.com/workers/
- Suporte Cloudflare: https://community.cloudflare.com/
- Status: https://www.cloudflarestatus.com/

### Problemas Comuns Resolvidos

1. **"KV not defined"** - Adicionar binding no wrangler.toml
2. **"CORS error"** - Verificar headers no Worker
3. **"Cookie not set"** - Garantir HTTPS e Secure flag
4. **"Rate limited"** - Implementar cache ou aumentar limites

---

## 🎯 Resultado Esperado

Com este sistema implementado, o Busca Busca Brasil terá:

✅ **Atribuição melhorada** - Recuperar 15-30% das comissões perdidas
✅ **Métricas confiáveis** - Dados precisos para otimização
✅ **Custo zero** - Usando apenas free tiers
✅ **Alta performance** - Redirects < 50ms na edge
✅ **Máxima persistência** - Cookies + localStorage + PWA
✅ **Pronto para escalar** - Arquitetura preparada para crescimento

**Tempo total de implementação: 2-5 dias para MVP funcional**

---

*Última atualização: Dezembro 2024*
*Versão: 1.0.0*
