# BBB LINK ENHANCER - DEPLOY SIMPLES
# ===================================
# SEM COMPLICAÇÕES - SÓ O QUE FUNCIONA!

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  BBB - DEPLOY SIMPLES E DIRETO    " -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# PARTE 1: GITHUB
Write-Host "[1/2] GITHUB - Enviando codigo..." -ForegroundColor Yellow

# Adicionar tudo
git add -A

# Commit
$data = Get-Date -Format "dd/MM HH:mm"
git commit -m "Update $data - Sistema funcionando" 2>$null

# Push
git push origin main

Write-Host "✅ Codigo enviado para GitHub!" -ForegroundColor Green
Write-Host ""

# PARTE 2: VERCEL
Write-Host "[2/2] VERCEL - Deploy manual necessario" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: O Vercel precisa ser conectado UMA VEZ!" -ForegroundColor Cyan
Write-Host ""
Write-Host "FACA ISSO AGORA (2 minutos):" -ForegroundColor White
Write-Host "1. Acesse: https://vercel.com" -ForegroundColor Yellow
Write-Host "2. Login com GitHub" -ForegroundColor Yellow
Write-Host "3. Clique em 'Add New' > 'Project'" -ForegroundColor Yellow
Write-Host "4. Procure 'BBB' e clique 'Import'" -ForegroundColor Yellow
Write-Host "5. Clique em 'Deploy'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Depois disso, SEMPRE que voce fizer 'git push'," -ForegroundColor Green
Write-Host "o Vercel atualiza AUTOMATICAMENTE!" -ForegroundColor Green
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "         SISTEMA PRONTO!            " -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "SUAS CREDENCIAIS:" -ForegroundColor Cyan
Write-Host "CPF: 07917165973" -ForegroundColor White
Write-Host "Senha: Alex.2025@" -ForegroundColor White
Write-Host ""
Write-Host "SUAS TAGS DE AFILIADO:" -ForegroundColor Cyan
Write-Host "Amazon: buscabusca0f-20" -ForegroundColor White
Write-Host "Mercado Livre: wa20250726131129" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER para fechar"