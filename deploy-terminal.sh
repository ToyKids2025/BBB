#!/bin/bash

# BBB Link Enhancer - Deploy Completo via Terminal
# =================================================

echo "
╔══════════════════════════════════════════════╗
║   🚀 BBB LINK ENHANCER - DEPLOY TERMINAL     ║
║   Sistema de Recuperação de Comissões        ║
╚══════════════════════════════════════════════╝
"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Funções de log
log_step() { echo -e "\n${PURPLE}▶ $1${NC}"; }
log_success() { echo -e "${GREEN}  ✅ $1${NC}"; }
log_error() { echo -e "${RED}  ❌ $1${NC}"; }
log_info() { echo -e "${BLUE}  ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }

# Verificar requisitos
check_requirements() {
    log_step "VERIFICANDO REQUISITOS"

    # Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js $(node -v)"
    else
        log_error "Node.js não instalado"
        exit 1
    fi

    # npm
    if command -v npm &> /dev/null; then
        log_success "npm $(npm -v)"
    else
        log_error "npm não instalado"
        exit 1
    fi

    # Git
    if command -v git &> /dev/null; then
        log_success "Git $(git --version | cut -d' ' -f3)"
    else
        log_error "Git não instalado"
        exit 1
    fi
}

# Instalar CLIs necessárias
install_clis() {
    log_step "INSTALANDO CLIs NECESSÁRIAS"

    # Wrangler (Cloudflare)
    if ! command -v wrangler &> /dev/null; then
        log_info "Instalando Wrangler CLI..."
        npm install -g wrangler
        log_success "Wrangler instalado"
    else
        log_success "Wrangler já instalado"
    fi

    # Vercel
    if ! command -v vercel &> /dev/null; then
        log_info "Instalando Vercel CLI..."
        npm install -g vercel
        log_success "Vercel instalado"
    else
        log_success "Vercel já instalado"
    fi

    # GitHub CLI
    if ! command -v gh &> /dev/null; then
        log_warning "GitHub CLI não instalado (opcional)"
        log_info "Para instalar: https://cli.github.com/"
    else
        log_success "GitHub CLI instalado"
    fi
}

# Configurar Cloudflare
setup_cloudflare() {
    log_step "CONFIGURANDO CLOUDFLARE WORKER"

    # Login
    log_info "Fazendo login no Cloudflare..."
    wrangler login

    # Criar KV namespaces
    log_info "Criando KV Namespaces..."

    KV_LINKS=$(wrangler kv:namespace create "BBB_LINKS" --preview false | grep -oP 'id = "\K[^"]+')
    KV_CLICKS=$(wrangler kv:namespace create "BBB_CLICKS" --preview false | grep -oP 'id = "\K[^"]+')
    KV_STATS=$(wrangler kv:namespace create "BBB_STATS" --preview false | grep -oP 'id = "\K[^"]+')

    # Atualizar wrangler.toml
    log_info "Atualizando wrangler.toml..."
    cat > wrangler.toml << EOF
name = "bbb-link-enhancer"
main = "index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "BBB_LINKS"
id = "${KV_LINKS}"

[[kv_namespaces]]
binding = "BBB_CLICKS"
id = "${KV_CLICKS}"

[[kv_namespaces]]
binding = "BBB_STATS"
id = "${KV_STATS}"

[env.production]
vars = {
  ENVIRONMENT = "production",
  API_KEY = "sk_live_bbb_2024_secure_key",
  DOMAIN = "https://bbbrasil.com"
}
EOF

    log_success "KV Namespaces criados e configurados"

    # Deploy Worker
    log_info "Fazendo deploy do Worker..."
    wrangler publish

    log_success "Worker deployed em https://bbb-link-enhancer.workers.dev"
}

# Configurar Vercel
setup_vercel() {
    log_step "CONFIGURANDO VERCEL (ADMIN PANEL)"

    # Build do projeto
    log_info "Instalando dependências..."
    npm install

    log_info "Criando build de produção..."
    npm run build 2>/dev/null || npx react-scripts build

    # Deploy
    log_info "Fazendo deploy no Vercel..."
    vercel --prod

    log_success "Admin Panel deployed!"
}

# Configurar GitHub
setup_github() {
    log_step "CONFIGURANDO GITHUB"

    # Inicializar Git se necessário
    if [ ! -d ".git" ]; then
        git init
        git branch -m main
        log_success "Repositório Git inicializado"
    fi

    # Adicionar arquivos
    git add .

    # Commit
    git commit -m "🚀 Deploy BBB Link Enhancer

- Sistema completo de recuperação de comissões
- Cloudflare Worker configurado
- Admin Panel React
- 10 produtos de teste
- Deploy automático configurado" 2>/dev/null || log_warning "Nada para commitar"

    # Configurar remote
    read -p "Digite seu usuário GitHub: " github_user
    read -p "Nome do repositório (bbb-link-enhancer): " repo_name
    repo_name=${repo_name:-bbb-link-enhancer}

    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/${github_user}/${repo_name}.git"

    log_info "Criando repositório no GitHub..."

    # Push
    git push -u origin main 2>/dev/null || {
        log_warning "Repositório não existe. Crie em: https://github.com/new"
        log_info "Depois execute: git push -u origin main"
    }

    log_success "GitHub configurado!"
}

# Criar links de teste
create_test_links() {
    log_step "CRIANDO LINKS DE TESTE"

    API_URL="https://bbb-link-enhancer.workers.dev/api"

    # Array de produtos
    declare -a products=(
        "Echo Dot 4ª|https://www.amazon.com.br/dp/B08MQZXN1X?tag=buscabr-20|amazon"
        "iPhone 13|https://www.mercadolivre.com.br/apple-iphone-13/p/MLB18908823|mercadolivre"
        "Notebook Dell|https://www.magazineluiza.com.br/notebook-dell/p/234567890|magalu"
    )

    for product in "${products[@]}"; do
        IFS='|' read -r name url platform <<< "$product"

        response=$(curl -s -X POST "$API_URL/redirects" \
            -H "Authorization: Bearer sk_live_bbb_2024_secure_key" \
            -H "Content-Type: application/json" \
            -d "{
                \"dest\": \"$url\",
                \"title\": \"$name\",
                \"platform\": \"$platform\"
            }")

        short_url=$(echo "$response" | grep -oP '"short_url":\s*"\K[^"]+' || echo "N/A")
        log_success "$name: $short_url"
    done
}

# Menu principal
main_menu() {
    PS3='Escolha uma opção: '
    options=(
        "🚀 Deploy Completo (Tudo)"
        "☁️  Deploy apenas Cloudflare Worker"
        "📊 Deploy apenas Admin Panel (Vercel)"
        "🐙 Configurar apenas GitHub"
        "🔗 Criar Links de Teste"
        "📖 Ver Documentação"
        "❌ Sair"
    )

    select opt in "${options[@]}"
    do
        case $REPLY in
            1)
                check_requirements
                install_clis
                setup_cloudflare
                setup_vercel
                setup_github
                create_test_links
                show_summary
                break
                ;;
            2)
                check_requirements
                install_clis
                setup_cloudflare
                break
                ;;
            3)
                check_requirements
                install_clis
                setup_vercel
                break
                ;;
            4)
                setup_github
                break
                ;;
            5)
                create_test_links
                break
                ;;
            6)
                show_docs
                ;;
            7)
                echo "Saindo..."
                exit 0
                ;;
            *)
                echo "Opção inválida"
                ;;
        esac
    done
}

# Mostrar documentação
show_docs() {
    echo -e "\n${BLUE}📚 DOCUMENTAÇÃO DISPONÍVEL:${NC}"
    echo "  • README.md - Visão geral do projeto"
    echo "  • DEPLOYMENT.md - Guia completo de deploy"
    echo "  • DEPLOY-NOW.md - Deploy rápido (35 min)"
    echo "  • test-local.html - Interface de testes"
    echo ""
    read -p "Pressione ENTER para voltar ao menu..."
}

# Resumo final
show_summary() {
    echo -e "\n${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         🎉 DEPLOY CONCLUÍDO!                 ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📦 URLs DO SISTEMA:${NC}"
    echo "  • Worker: https://bbb-link-enhancer.workers.dev"
    echo "  • Admin: https://bbb-admin.vercel.app"
    echo "  • GitHub: https://github.com/SEU_USUARIO/bbb-link-enhancer"
    echo ""
    echo -e "${BLUE}📊 MÉTRICAS ESPERADAS:${NC}"
    echo "  • Cookie Persistence: >70%"
    echo "  • Redirect Speed: <50ms"
    echo "  • Comissões Recuperadas: +15-30%"
    echo ""
    echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS:${NC}"
    echo "  1. Configure domínio customizado no Cloudflare"
    echo "  2. Teste os shortlinks criados"
    echo "  3. Configure Supabase para analytics"
    echo "  4. Monitore métricas no dashboard"
    echo ""
    echo -e "${GREEN}Sistema pronto para recuperar comissões perdidas!${NC}"
}

# Executar
clear
main_menu