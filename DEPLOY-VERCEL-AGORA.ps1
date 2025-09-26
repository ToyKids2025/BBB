# DEPLOY DIRETO NO VERCEL
# =======================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY MANUAL VERCEL - BBB LINKS    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
}

Write-Host "Fazendo deploy no Vercel..." -ForegroundColor Green
Write-Host ""

# Deploy com configurações corretas
vercel --prod --yes `
  --env CI=false `
  --env GENERATE_SOURCEMAP=false `
  --env REACT_APP_API_URL=https://bbbrasil.com/api `
  --env REACT_APP_DOMAIN=https://bbbrasil.com `
  --build-env CI=false

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    DEPLOY VERCEL CONCLUIDO!           " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seu site esta online!" -ForegroundColor White
    Write-Host ""
    Write-Host "LOGIN:" -ForegroundColor Yellow
    Write-Host "CPF: 07917165973" -ForegroundColor White
    Write-Host "Senha: Alex.2025@" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Erro no deploy!" -ForegroundColor Red
    Write-Host "Tente manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://vercel.com" -ForegroundColor White
    Write-Host "2. Login com GitHub" -ForegroundColor White
    Write-Host "3. Importe o projeto BBB" -ForegroundColor White
}

Read-Host "Pressione ENTER para fechar"