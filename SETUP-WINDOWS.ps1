# BBB Link Enhancer - Setup Windows PowerShell
# =============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   BBB LINK ENHANCER - SETUP WINDOWS       " -ForegroundColor Cyan
Write-Host "   Sistema de Recuperacao de Comissoes     " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. INSTALAR FERRAMENTAS NECESSARIAS
Write-Host "ETAPA 1: Instalando ferramentas necessarias..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

# Instalar GitHub CLI
Write-Host "Instalando GitHub CLI..." -ForegroundColor Green
try {
    winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements -h
} catch {
    Write-Host "GitHub CLI ja instalado ou erro na instalacao" -ForegroundColor Yellow
}

# Instalar Wrangler (Cloudflare)
Write-Host "Instalando Wrangler CLI..." -ForegroundColor Green
npm install -g wrangler

# Instalar Vercel CLI
Write-Host "Instalando Vercel CLI..." -ForegroundColor Green
npm install -g vercel

Write-Host "Ferramentas instaladas!" -ForegroundColor Green

# 2. AUTENTICAR NO GITHUB
Write-Host ""
Write-Host "ETAPA 2: Configurando GitHub..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

Write-Host "Fazendo login no GitHub..." -ForegroundColor Green
Write-Host "Escolha: GitHub.com > HTTPS > Login with browser" -ForegroundColor Cyan
gh auth login

# 3. CRIAR REPOSITORIO NO GITHUB
Write-Host ""
Write-Host "ETAPA 3: Criando repositorio no GitHub..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$repoName = Read-Host "Nome do repositorio (padrao: bbb-link-enhancer)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "bbb-link-enhancer"
}

# Adicionar remote
git remote remove origin 2>$null
gh repo create $repoName --public --source=. --remote=origin --push

Write-Host "Repositorio criado e codigo enviado!" -ForegroundColor Green

# 4. BUILD DO REACT
Write-Host ""
Write-Host "ETAPA 4: Build do React Admin Panel..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

Write-Host "Criando build de producao..." -ForegroundColor Green
npm run build

Write-Host "Build criado com sucesso!" -ForegroundColor Green

# 5. DEPLOY NO VERCEL
Write-Host ""
Write-Host "ETAPA 5: Deploy no Vercel..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

Write-Host "Fazendo deploy no Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "Admin Panel deployed com sucesso!" -ForegroundColor Green

# 6. CONFIGURAR CLOUDFLARE
Write-Host ""
Write-Host "ETAPA 6: Configurando Cloudflare Worker..." -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

Write-Host "Fazendo login no Cloudflare..." -ForegroundColor Green
wrangler login

Write-Host "Criando KV Namespaces..." -ForegroundColor Green
Write-Host "Execute os seguintes comandos manualmente:" -ForegroundColor Yellow
Write-Host ""
Write-Host "wrangler kv:namespace create BBB_LINKS" -ForegroundColor White
Write-Host "wrangler kv:namespace create BBB_CLICKS" -ForegroundColor White
Write-Host "wrangler kv:namespace create BBB_STATS" -ForegroundColor White
Write-Host ""
Write-Host "Copie os IDs gerados e atualize o arquivo wrangler.toml" -ForegroundColor Yellow
Write-Host ""

Read-Host "Pressione ENTER apos atualizar o wrangler.toml"

Write-Host "Fazendo deploy do Worker..." -ForegroundColor Green
wrangler deploy

Write-Host "Worker deployed com sucesso!" -ForegroundColor Green

# 7. RESUMO FINAL
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "         DEPLOY CONCLUIDO!                 " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs DO SISTEMA:" -ForegroundColor Cyan
Write-Host "  Worker: https://bbb-link-enhancer.workers.dev" -ForegroundColor White
Write-Host "  Admin: https://bbb-admin.vercel.app" -ForegroundColor White
Write-Host "  GitHub: https://github.com/SEU_USUARIO/$repoName" -ForegroundColor White
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "  1. Teste os shortlinks criados" -ForegroundColor White
Write-Host "  2. Configure dominio customizado" -ForegroundColor White
Write-Host "  3. Configure Supabase para analytics" -ForegroundColor White
Write-Host ""
Write-Host "Sistema pronto para recuperar comissoes perdidas!" -ForegroundColor Green

Read-Host "Pressione ENTER para finalizar"