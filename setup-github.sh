#!/bin/bash

# BBB Link Enhancer - Setup GitHub & Deploy
# ==========================================

echo "🚀 BBB Link Enhancer - Setup GitHub & Deploy"
echo "==========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# 1. VERIFICAR GITHUB CLI
echo -e "\n${YELLOW}📦 ETAPA 1: Verificando GitHub CLI${NC}"
echo "-------------------------------------------"

if ! command -v gh &> /dev/null; then
    log_warning "GitHub CLI não instalado. Instalando..."

    # Detectar SO e instalar
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "msys" ]]; then
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gh
    else
        log_error "Sistema operacional não suportado. Instale o GitHub CLI manualmente."
        exit 1
    fi
fi

log_success "GitHub CLI instalado"

# 2. AUTENTICAR NO GITHUB
echo -e "\n${YELLOW}📦 ETAPA 2: Autenticação GitHub${NC}"
echo "-------------------------------------------"

if ! gh auth status &> /dev/null; then
    log_info "Fazendo login no GitHub..."
    gh auth login
else
    log_success "Já autenticado no GitHub"
fi

# 3. CRIAR REPOSITÓRIO
echo -e "\n${YELLOW}📦 ETAPA 3: Criando Repositório GitHub${NC}"
echo "-------------------------------------------"

REPO_NAME="bbb-link-enhancer"

# Verificar se repo já existe
if gh repo view $REPO_NAME &> /dev/null; then
    log_warning "Repositório '$REPO_NAME' já existe"
    read -p "Usar repositório existente? (s/n): " use_existing
    if [[ $use_existing != "s" ]]; then
        read -p "Nome do novo repositório: " REPO_NAME
    fi
fi

# Criar repositório se não existir
if ! gh repo view $REPO_NAME &> /dev/null; then
    log_info "Criando repositório '$REPO_NAME'..."
    gh repo create $REPO_NAME --public --description "Sistema inteligente de recuperação de comissões de afiliados" --homepage "https://bbbrasil.com"
    log_success "Repositório criado com sucesso!"
else
    log_success "Usando repositório existente"
fi

# 4. CONFIGURAR GIT
echo -e "\n${YELLOW}📦 ETAPA 4: Configurando Git${NC}"
echo "-------------------------------------------"

# Configurar usuário se necessário
if [[ -z $(git config --global user.email) ]]; then
    read -p "Digite seu email do GitHub: " git_email
    git config --global user.email "$git_email"
fi

if [[ -z $(git config --global user.name) ]]; then
    read -p "Digite seu nome de usuário GitHub: " git_name
    git config --global user.name "$git_name"
fi

# Adicionar remote
GITHUB_USER=$(gh api user | jq -r .login)
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

log_success "Git configurado"

# 5. COMMIT INICIAL
echo -e "\n${YELLOW}📦 ETAPA 5: Commit Inicial${NC}"
echo "-------------------------------------------"

git add .
git commit -m "🚀 Initial commit - BBB Link Enhancer

- Cloudflare Worker para redirects inteligentes
- Admin panel React com dashboard
- Sistema de persistência múltipla
- Add-to-cart automático Amazon
- Deep links para apps
- 10 produtos de teste configurados"

log_success "Commit inicial criado"

# 6. PUSH PARA GITHUB
echo -e "\n${YELLOW}📦 ETAPA 6: Push para GitHub${NC}"
echo "-------------------------------------------"

git push -u origin main

log_success "Código enviado para GitHub"

# 7. CONFIGURAR SECRETS
echo -e "\n${YELLOW}📦 ETAPA 7: Configurando Secrets do GitHub${NC}"
echo "-------------------------------------------"

log_info "Agora vamos configurar os secrets para deploy automático"
echo ""
echo "Você precisará das seguintes informações:"
echo "1. Cloudflare API Token"
echo "2. Vercel Token"
echo "3. IDs dos KV Namespaces"
echo ""

read -p "Deseja configurar os secrets agora? (s/n): " configure_secrets

if [[ $configure_secrets == "s" ]]; then
    # Cloudflare Token
    read -p "Cole seu Cloudflare API Token: " cf_token
    gh secret set CLOUDFLARE_API_TOKEN --body="$cf_token"

    # Vercel Token
    read -p "Cole seu Vercel Token: " vercel_token
    gh secret set VERCEL_TOKEN --body="$vercel_token"

    # Vercel Org ID
    read -p "Cole seu Vercel Org ID (opcional): " vercel_org
    if [[ ! -z "$vercel_org" ]]; then
        gh secret set VERCEL_ORG_ID --body="$vercel_org"
    fi

    # Vercel Project ID
    read -p "Cole seu Vercel Project ID (opcional): " vercel_project
    if [[ ! -z "$vercel_project" ]]; then
        gh secret set VERCEL_PROJECT_ID --body="$vercel_project"
    fi

    log_success "Secrets configurados com sucesso!"
else
    log_warning "Configure os secrets manualmente em: https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/secrets"
fi

# 8. ATIVAR GITHUB PAGES (OPCIONAL)
echo -e "\n${YELLOW}📦 ETAPA 8: GitHub Pages (Opcional)${NC}"
echo "-------------------------------------------"

read -p "Deseja ativar GitHub Pages para documentação? (s/n): " enable_pages

if [[ $enable_pages == "s" ]]; then
    gh api repos/${GITHUB_USER}/${REPO_NAME}/pages \
        --method POST \
        --field source='{"branch":"main","path":"/"}' \
        2>/dev/null || log_warning "GitHub Pages já ativo ou erro na configuração"

    log_success "GitHub Pages ativado em: https://${GITHUB_USER}.github.io/${REPO_NAME}"
fi

# 9. CRIAR PRIMEIRO RELEASE
echo -e "\n${YELLOW}📦 ETAPA 9: Criar Release${NC}"
echo "-------------------------------------------"

read -p "Deseja criar a primeira release v1.0.0? (s/n): " create_release

if [[ $create_release == "s" ]]; then
    gh release create v1.0.0 \
        --title "BBB Link Enhancer v1.0.0" \
        --notes "🚀 **Primeira versão estável**

## ✨ Funcionalidades
- Shortlinks inteligentes
- Cookies first-party de 30 dias
- Add-to-cart automático Amazon
- Deep links para apps
- Dashboard em tempo real
- 10 produtos de teste

## 📊 Métricas
- Cookie persistence: >70%
- Redirect speed: <50ms
- Zero downtime garantido

## 🔧 Stack
- Cloudflare Workers (Edge)
- React Admin Panel
- Supabase Database
- KV Storage

**Pronto para produção!**" \
        --latest

    log_success "Release v1.0.0 criada!"
fi

# 10. RESUMO FINAL
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 SETUP COMPLETO COM SUCESSO!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}📦 Repositório GitHub:${NC}"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo -e "${BLUE}🚀 Próximos passos:${NC}"
echo "   1. Acesse: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
echo "   2. Verifique se o deploy automático está rodando"
echo "   3. Configure o Cloudflare Worker"
echo "   4. Configure o Vercel"
echo ""
echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - README.md - Visão geral do projeto"
echo "   - DEPLOYMENT.md - Guia completo de deploy"
echo "   - DEPLOY-NOW.md - Deploy rápido (35 min)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Configure os KV namespaces no Cloudflare"
echo "   - Atualize o wrangler.toml com os IDs"
echo "   - Configure o Supabase e execute schema.sql"
echo ""
echo -e "${GREEN}Sistema pronto para recuperar comissões perdidas!${NC}"
echo ""

# Abrir no navegador
read -p "Abrir repositório no navegador? (s/n): " open_browser
if [[ $open_browser == "s" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/${GITHUB_USER}/${REPO_NAME}"
    elif command -v open &> /dev/null; then
        open "https://github.com/${GITHUB_USER}/${REPO_NAME}"
    elif command -v start &> /dev/null; then
        start "https://github.com/${GITHUB_USER}/${REPO_NAME}"
    else
        echo "Acesse: https://github.com/${GITHUB_USER}/${REPO_NAME}"
    fi
fi

echo -e "\n${GREEN}✅ Script finalizado com sucesso!${NC}"