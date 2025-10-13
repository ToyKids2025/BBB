# 📱 Instagram Automation - BuscaBusca Brasil

## 🎯 Objetivo

Sistema automatizado que transforma links de produtos em posts visuais para Instagram, com publicação e agendamento automáticos.

---

## ✨ Funcionalidades

### ✅ Implementadas
- [ ] Nenhuma ainda (começando na FASE 1)

### 🚧 Em Desenvolvimento (Fases 1-8)
- [ ] **FASE 1**: Scraping avançado de produtos (ML + Amazon)
- [ ] **FASE 2**: Estrutura de banco de dados (Firestore)
- [ ] **FASE 3**: Geração de imagens para posts (3 templates)
- [ ] **FASE 4**: Interface de automação no dashboard
- [ ] **FASE 5**: Integração com Instagram Graph API
- [ ] **FASE 6**: Sistema de agendamento e cron jobs
- [ ] **FASE 7**: Analytics completo de posts
- [ ] **FASE 8**: Testes finais e deploy

---

## 📊 Status do Projeto

**Branch**: `feature/instagram-automation`
**Fase Atual**: FASE 0 - Preparação e Documentação
**Progresso**: 0% (0/9 fases concluídas)
**Início**: 13/10/2025
**Previsão**: 3-4 semanas

---

## 🏗️ Arquitetura

### Stack Tecnológico
```
Frontend: React 18 (atual)
Backend: Firebase Cloud Functions (novo)
Database: Firebase Firestore (expandir)
Storage: Firebase Storage (novo)
APIs: Instagram Graph API, unshorten.me
Image Gen: Sharp + Canvas (Cloud Functions)
Cron: Firebase Scheduled Functions
```

### Estrutura de Arquivos (Nova)
```
src/
├── components/
│   └── instagram/              🆕 NOVO
│       ├── AutomationDashboard.jsx
│       ├── ProductExtractor.jsx
│       ├── PostEditor.jsx
│       ├── PostQueue.jsx
│       ├── PostPreview.jsx
│       ├── InstagramSettings.jsx
│       └── InstagramAnalytics.jsx
├── utils/
│   └── instagram/              🆕 NOVO
│       ├── scraper.js
│       ├── client.js
│       ├── caption-generator.js
│       └── image-optimizer.js

functions/                       🆕 NOVO
├── src/
│   ├── scraper.js
│   ├── image-generator.js
│   ├── instagram-publisher.js
│   └── scheduler.js
└── package.json
```

---

## 🔄 Fluxo de Funcionamento

```
1. USUÁRIO
   ↓ Cola URL do produto (ML/Amazon)

2. SCRAPER
   ↓ Extrai: título, preço, imagens, avaliações

3. BANCO DE DADOS
   ↓ Salva produto + cria link rastreado

4. GERADOR DE IMAGENS
   ↓ Cria post visual (1080x1080)

5. EDITOR
   ↓ Usuário edita legenda/hashtags

6. AGENDADOR
   ↓ Agenda para horário específico

7. CRON JOB
   ↓ Publica automaticamente no horário

8. INSTAGRAM API
   ↓ Post aparece no Instagram

9. ANALYTICS
   ↓ Sincroniza métricas (likes, comments, etc)
```

---

## 💾 Collections do Firestore (Novas)

### `instagram_products`
Produtos extraídos dos links

### `instagram_posts`
Posts criados (drafts, scheduled, published)

### `instagram_settings`
Configurações do usuário (horários, templates, API tokens)

### `instagram_analytics_daily`
Métricas diárias agregadas

### `product_cache`
Cache de scraping para evitar re-extração

---

## 🎨 Templates de Posts

### 1. Moderno (Roxo)
- Gradiente roxo (#667eea → #764ba2)
- Texto branco
- Sombras e profundidade
- **Uso**: Produtos premium, tech

### 2. Minimalista (Branco)
- Fundo branco/cinza claro
- Texto preto
- Clean e elegante
- **Uso**: Moda, casa, decoração

### 3. Colorido (Vermelho/Amarelo)
- Gradiente vibrante (#ff6b6b → #feca57)
- Alto contraste
- Chamativo
- **Uso**: Ofertas, promoções, urgência

---

## 🔐 Segurança

### Firestore Rules
```javascript
// Produtos: Autenticado pode ler/escrever seus próprios
// Posts: Autenticado pode ler/escrever seus próprios
// Settings: Apenas dono pode acessar
// Analytics: Apenas dono pode ler, Cloud Functions escrevem
```

### Tokens
- Instagram Access Token: Criptografado no Firestore
- OpenAI API Key (opcional): Criptografado
- Tokens expiram em 60 dias (renovação automática)

---

## 📈 Limites e Custos

### Limites Instagram
- 25 posts/dia (hard limit da API)
- 60-day token expiration
- Requer conta Business/Creator

### Limites Firebase (Plano Grátis)
- Firestore: 50k reads/day, 20k writes/day
- Cloud Functions: 2M invocações/mês, 400k GB-s/mês
- Storage: 5GB

### Custos Estimados
- Firebase: R$ 0-50/mês (depende do volume)
- Instagram API: Gratuito
- OpenAI (opcional): ~R$ 0,01/legenda

---

## 🧪 Testes

### Por Fase
Cada fase tem 5-7 testes específicos documentados no `PLANO-IMPLEMENTACAO-INSTAGRAM.md`

### Testes E2E (FASE 8)
Fluxo completo de ponta a ponta antes do deploy

---

## 📚 Documentação

- `PLANO-IMPLEMENTACAO-INSTAGRAM.md` - Plano completo (3.520 linhas)
- `docs/ARQUITETURA-ATUAL.md` - Arquitetura do sistema atual
- `docs/INSTAGRAM-AUTOMATION-README.md` - Este arquivo

---

## 🚀 Como Usar (Quando Pronto)

### 1. Conectar Instagram
```
Dashboard > Instagram > Configurações > Conectar Instagram
```

### 2. Criar Post
```
Dashboard > Instagram > Novo Post
→ Colar URL do produto
→ Clicar em "Extrair Dados"
→ Editar legenda e hashtags
→ Salvar rascunho OU agendar
```

### 3. Gerenciar Fila
```
Dashboard > Instagram > Fila de Posts
→ Ver rascunhos, agendados e publicados
→ Editar ou deletar posts
```

### 4. Ver Analytics
```
Dashboard > Instagram > Analytics
→ Visualizar métricas
→ Exportar relatório CSV
```

---

## ⚙️ Configurações

### Posts por Dia
Máximo de posts automáticos/dia (recomendado: 5-10)

### Horários de Publicação
Quando posts devem ser publicados (ex: 9h, 12h, 15h, 18h, 21h)

### Template Padrão
Estilo visual dos posts (moderno, minimalista, colorido)

### Tom das Legendas
Estilo de escrita (entusiasta, urgência, informativo, casual)

### IA para Legendas (Opcional)
Usar OpenAI GPT-4 para gerar legendas criativas

---

## 🐛 Troubleshooting

### Post não publicou automaticamente
- Verificar se Instagram está conectado
- Verificar se token não expirou
- Verificar logs no Firebase Console > Functions

### Erro ao extrair produto
- Verificar se URL é válida (ML ou Amazon)
- Tentar novamente (pode ser bloqueio temporário)
- Verificar console do navegador para detalhes

### Imagem não gerou
- Verificar se produto tem imagens
- Verificar Cloud Functions logs
- Tentar template diferente

### Erro 403 no Instagram
- Token expirado → Renovar nas configurações
- App não aprovado → Aguardar aprovação do Facebook (1-2 semanas)

---

## 📞 Suporte

**Durante Desenvolvimento**:
- Issues no GitHub (se aplicável)
- Contato direto com desenvolvedor

**Após Deploy**:
- Sistema de tickets (a definir)
- Email de suporte (a definir)

---

## 📝 Changelog

### v0.1.0 - 13/10/2025
- 📋 FASE 0: Preparação e documentação iniciada
- ✅ Branch `feature/instagram-automation` criada
- ✅ Estrutura de pastas definida
- ✅ Documentação de arquitetura completa

---

**Última Atualização**: 13/10/2025
**Status**: 🚧 Em Desenvolvimento
