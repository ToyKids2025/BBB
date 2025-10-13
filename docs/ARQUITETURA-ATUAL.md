# 🏗️ ARQUITETURA ATUAL - BuscaBusca Brasil

**Data**: 13/10/2025
**Versão**: 3.0.0

---

## 📊 VISÃO GERAL DO SISTEMA

**Tipo**: Single Page Application (SPA) com Backend Serverless
**Stack Principal**: React + Firebase
**Linhas de Código**: ~16.092 linhas (src/)
**Status**: Em produção

---

## 🔧 STACK TECNOLÓGICO

### Frontend
```
Framework: React 18.2.0
Roteamento: React Router DOM 7.9.3
UI: React Icons 4.11.0
Gráficos: Recharts 2.9.0
Build: React Scripts 5.0.1
```

### Backend
```
Autenticação: Firebase Authentication
Banco de Dados: Firebase Firestore
Storage: Firebase Storage (não utilizado ainda)
Hosting: Firebase Hosting
Analytics: Firebase Analytics
```

### Ferramentas
```
HTTP Client: Axios 1.12.2
Servidor Local: Express 5.1.0 (para testes)
Package Manager: npm
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
SiteBuscaBuscaBrasilOficial/
├── public/                          # Arquivos públicos
│   ├── index.html                   # HTML principal
│   ├── manifest.json                # PWA Manifest
│   ├── service-worker.js            # Service Worker (cache)
│   ├── sw-eternal.js                # Tracking perpétuo
│   ├── redirect.html                # Página de redirect alternativa
│   └── icons/                       # Ícones PWA (96px-512px)
├── src/
│   ├── App.jsx                      # Componente principal
│   ├── AppRouter.jsx                # Sistema de rotas
│   ├── index.js                     # Entry point
│   ├── RedirectPage.jsx             # Página /r/:linkId
│   ├── LinkList.jsx                 # Lista de links
│   ├── PublicHomePage.jsx           # Homepage pública
│   ├── firebase.js                  # ⭐ Config Firebase + funções
│   ├── config.js                    # ⭐ Configurações de afiliados
│   ├── components/                  # 14 componentes
│   │   ├── LinkManager.jsx          # Gerador de links
│   │   ├── AnalyticsDashboard.jsx   # Métricas
│   │   ├── MonitoringDashboard.jsx  # Monitoramento
│   │   ├── RemarketingDashboard.jsx # Remarketing
│   │   ├── ClickHeatmap.jsx         # Mapa de calor
│   │   ├── DebugPanel.jsx           # Debug system
│   │   ├── EnvironmentValidator.jsx # Validador de ambiente
│   │   ├── HealthCheck.jsx          # Health check
│   │   └── ... (outros)
│   ├── utils/                       # 18 utilitários
│   │   ├── link-enhancer.js         # ⭐ Expansão de links
│   │   ├── link-enhancer-v2.js      # Versão avançada
│   │   ├── product-scraper.js       # ⭐ Scraping de títulos
│   │   ├── device-fingerprint.js    # Fingerprint
│   │   ├── persistence.js           # Safari persistence
│   │   ├── deep-linking.js          # Deep links (desabilitado)
│   │   ├── remarketing-fomo.js      # Remarketing
│   │   ├── eternal-tracking.js      # Tracking (desabilitado)
│   │   ├── commission-guardian.js   # Guardian (desabilitado)
│   │   └── ... (outros)
│   ├── pages/                       # Páginas públicas
│   │   ├── About.jsx
│   │   └── FAQ.jsx
│   └── styles/
│       └── theme.css                # Tema global
├── firebase.json                    # Config Firebase Hosting
├── firestore.rules                  # ⭐ Regras de segurança
├── firestore.indexes.json           # Índices do Firestore
├── .env                             # Variáveis de ambiente
├── package.json                     # Dependências
└── vercel.json                      # Config Vercel (alternativa)
```

---

## 🗄️ ESTRUTURA DO FIRESTORE (ATUAL)

### Collection: `links`
```javascript
{
  id: string (auto-gerado),
  url: string,                  // URL com tag de afiliado
  originalUrl: string,          // URL original
  title: string,                // Título do produto
  platform: string,             // 'amazon' | 'mercadolivre' | ...
  clicks: number,               // Contador de clicks
  userId: string,               // UID do usuário
  createdAt: Timestamp,
  lastClickedAt: Timestamp,
  active: boolean
}
```

### Collection: `conversions`
```javascript
{
  id: string,
  linkId: string,
  value: number,                // Valor da conversão
  userId: string,
  createdAt: Timestamp
}
```

### Collection: `experiments` (A/B Testing)
```javascript
{
  id: string,
  name: string,
  variants: Array,
  metrics: Array,
  userId: string
}
```

### Collections de Remarketing
- `pending_conversions`
- `remarketing_messages`
- `fomo_notifications`
- `remarketing_stats`
- `notification_logs`
- `ab_tests`

---

## 🔐 REGRAS DE SEGURANÇA (FIRESTORE)

### Links
```javascript
// Leitura: PÚBLICA (necessário para /r/:linkId funcionar)
// Escrita: Apenas autenticado e dono do link
allow read: if true;
allow create: if request.auth != null;
allow update: if request.auth != null && request.auth.uid == resource.data.userId;
allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
```

### Conversions
```javascript
// Apenas usuários autenticados
allow read: if request.auth != null;
allow create: if request.auth != null;
allow update/delete: if request.auth.uid == resource.data.userId;
```

### A/B Testing e Remarketing
```javascript
// Acesso público para tracking
allow read: if true;
allow write: if true;
```

---

## 🛤️ ROTAS DA APLICAÇÃO

```
/ ...................... Homepage pública (PublicHomePage)
/sobre ................. Página sobre nós (About)
/about ................. Alias para /sobre
/faq ................... Perguntas frequentes (FAQ)
/admin/* ............... Dashboard administrativo (App.jsx - protegido)
/r/:linkId ............. Redirect de links (RedirectPage)
```

---

## 🔑 FLUXO DE AUTENTICAÇÃO

1. **Login** (firebase.js:36-61)
   - Email + Senha via Firebase Auth
   - Persistência local (browserLocalPersistence)
   - Notificação Telegram/Discord (opcional)

2. **Proteção de Rotas** (App.jsx:145-230)
   - Se não autenticado → Tela de login
   - Se autenticado → Dashboard admin

3. **Monitor de Sessão** (App.jsx:40-76)
   - `onAuthStateChanged()` monitora estado
   - Device fingerprint ao fazer login
   - Tema salvo em localStorage

---

## 🔗 SISTEMA DE LINKS DE AFILIADOS

### Plataformas Suportadas (config.js:56-74)
```
✅ Amazon (tag: buscabusca0f-20)
✅ Mercado Livre (tag: WA20250726131129, tool: 88344921)
✅ Magalu
✅ Americanas
✅ Casas Bahia
✅ Shopee
✅ AliExpress
```

### Fluxo de Criação de Link

1. **LinkManager.jsx** (linha 124-146)
   - Usuário cola URL do produto
   - Auto-detecta plataforma
   - Busca título via scraping (product-scraper.js)

2. **Firebase.js → saveLink()** (linha 83-174)
   - Detecta plataforma
   - Adiciona tag básica via `config.js`
   - Aplica Link Enhancer (expande amzn.to, /sec/)
   - Salva no Firestore
   - Notifica via Telegram (opcional)

3. **Link Gerado**
   ```
   https://buscabuscabrasil.com.br/r/{firestore-doc-id}
   ```

### Link Enhancer (link-enhancer.js:1-523)

**Funcionalidades**:
- Expande `amzn.to` → `amazon.com.br/dp/ASIN`
- Expande `/sec/` e `/social/` do ML → URL completa
- Adiciona Amazon OneLink (ascsubtag, ref_)
- Preserva tags ML oficiais (wa*)
- Remove `forceInApp` do ML (causa erro 400)
- Cache de links expandidos

---

## 🔄 SISTEMA DE REDIRECIONAMENTO

### RedirectPage.jsx (linha 68-327)

**Fluxo**:
1. Busca link no Firestore via `linkId`
2. Valida se link está ativo
3. Aplica Link Enhancer V2 (garantia extra)
4. Incrementa contador de clicks (não-bloqueante)
5. Salva tracking leve (localStorage)
6. Sistema de remarketing/FOMO
7. Redireciona (delay 100ms)

**Tracking Leve** (linha 206-232):
- Problema resolvido: Erro 494 (headers muito grandes)
- Solução: Desabilitado Eternal Tracking e Commission Guardian
- Apenas localStorage + remarketing básico
- Tags preservadas: Link Enhancer garante comissão via URL

---

## 📊 SISTEMA DE ANALYTICS

### Métricas Disponíveis (firebase.js:373-428)
```
- Total de links criados
- Total de clicks
- Total de conversões
- Receita total
- Taxa de conversão
```

### Dashboards
- **AnalyticsDashboard.jsx**: Gráficos e métricas gerais
- **MonitoringDashboard.jsx**: Health check e status
- **RemarketingDashboard.jsx**: Métricas de remarketing
- **ClickHeatmap.jsx**: Mapa de calor de clicks

---

## 🔌 INTEGRAÇÕES EXTERNAS

### APIs Utilizadas
```
✅ unshorten.me - Expansão de links curtos (link-enhancer.js:136)
✅ Firebase APIs - Auth, Firestore, Analytics
⚙️ Telegram Bot API - Notificações (opcional, firebase.js:438)
⚙️ Discord Webhooks - Notificações (opcional)
⚙️ ipapi.co - Geolocalização (desabilitado)
```

### Variáveis de Ambiente (.env)
```bash
# Tags de Afiliado (OBRIGATÓRIAS)
REACT_APP_AMAZON_TAG=buscabusca0f-20
REACT_APP_ML_AFFILIATE_ID=WA20250726131129
REACT_APP_ML_TOOL_ID=88344921

# Firebase (OBRIGATÓRIAS)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

# Notificações (OPCIONAIS)
REACT_APP_TELEGRAM_BOT_TOKEN=...
REACT_APP_TELEGRAM_CHAT_ID=...
REACT_APP_DISCORD_WEBHOOK=...

# Build
CI=false
GENERATE_SOURCEMAP=false
```

---

## 🎨 CARACTERÍSTICAS ESPECIAIS

### PWA (Progressive Web App)
```
✅ Service Worker configurado (public/service-worker.js)
✅ Manifest.json completo
✅ Ícones: 96px, 152px, 167px, 180px, 192px, 512px
✅ Tema: Verde (#32CD32)
✅ Display: standalone
✅ Instalável no celular
```

### Sistema de Debug (debug-logger.js + DebugPanel.jsx)
```
Ativação: ?debug=true na URL
Pause Mode: ?debug=true&pause=true (não redireciona)
Logs: info, success, error, firebase, device, link, redirect
Painel: Visual com histórico de logs
```

### Temas
```
✅ Tema claro (light)
✅ Tema escuro (dark)
✅ Salvo em localStorage
✅ Toggle no header
```

---

## ⚠️ FUNCIONALIDADES DESABILITADAS

### Commission Guardian (commission-guardian.js)
**Motivo**: Causava erro 494 (headers muito grandes)
**Status**: Desabilitado (RedirectPage.jsx:21)
**Impacto**: Nenhum - Link Enhancer garante comissão via URL

### Eternal Tracking (eternal-tracking.js)
**Motivo**: Redundante com Commission Guardian
**Status**: Desabilitado (RedirectPage.jsx:20)
**Impacto**: Nenhum - Tracking leve ativo

### Deep Linking (deep-linking.js)
**Motivo**: Loop infinito no Mercado Livre
**Status**: Desabilitado (RedirectPage.jsx:251)
**Impacto**: Usuário redirecionado para web (funciona perfeitamente)

### Ultimate Cookie Sync (ultimate-cookie-sync.js)
**Motivo**: Redundante
**Status**: Desabilitado (RedirectPage.jsx:9)

---

## 🚀 DEPLOY E BUILD

### Build de Produção
```bash
CI=false GENERATE_SOURCEMAP=false npm run build
```

### Deploy Firebase
```bash
firebase deploy --only hosting
```

### Configuração Firebase (firebase.json)
```json
{
  "hosting": {
    "public": "build",
    "rewrites": [
      { "source": "/r/**", "destination": "/index.html" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "/r/**",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  }
}
```

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### ✅ RESOLVIDO: Erro 494 (Headers Muito Grandes)
**Causa**: Commission Guardian + Eternal Tracking criavam muitos cookies
**Solução**: Desabilitados, Link Enhancer garante comissão via URL

### ✅ RESOLVIDO: Loop Infinito no ML
**Causa**: Deep Linking tentava abrir app repetidamente
**Solução**: Deep Linking desabilitado

### ✅ RESOLVIDO: Tags ML Perdidas em /social/
**Causa**: Link Enhancer substituía tags oficiais (wa*)
**Solução**: Preservação de tags wa* implementada (link-enhancer.js:268-301)

### ✅ RESOLVIDO: forceInApp causa erro 400 no ML
**Causa**: Parâmetro forceInApp do Instagram causava erro
**Solução**: Remoção do parâmetro no Link Enhancer (link-enhancer.js:279-291)

---

## 📈 MÉTRICAS DE PERFORMANCE

```
Tempo de scraping: ~2-5 segundos
Tempo de redirect: 100ms
Carregamento do dashboard: <2 segundos
Bundle size: ~2MB (não otimizado)
```

---

## 🔮 PRÓXIMAS FUNCIONALIDADES

### EM DESENVOLVIMENTO (FASE 0-8)
```
🚧 Instagram Automation
  - Scraping avançado de produtos
  - Geração de imagens para posts
  - Publicação automática
  - Agendamento
  - Analytics de posts
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- `PLANO-IMPLEMENTACAO-INSTAGRAM.md` - Plano completo de implementação
- `README.md` - Instruções básicas
- `COMMISSION-GUARDIAN-DOCS.md` - Documentação do Guardian (desabilitado)
- `DEBUG_MODE_GUIDE.md` - Guia do modo debug
- `DEEP_LINKING_GUIDE.md` - Guia de deep linking
- `LINK-ENHANCER-DOCS.md` - Documentação do Link Enhancer

---

**Última Atualização**: 13/10/2025
**Autor**: Claude Code (análise automatizada)
