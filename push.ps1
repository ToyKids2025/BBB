# BBB LINK ENHANCER - PUSH PARA GITHUB (PowerShell)
Write-Host "BBB LINK ENHANCER - PUSH PARA GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verificar status
$status = git status --porcelain
if ($status) {
    Write-Host "Preparando alteracoes..." -ForegroundColor Yellow
    git add -A
    git commit -m "Update: Sistema Premium BBB Link Enhancer" 2>$null
}

Write-Host ""
Write-Host "Enviando para GitHub..." -ForegroundColor Green

# Tentar push
git push origin main 2>&1 | Out-String -OutVariable pushResult | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCESSO! Deploy enviado para GitHub!" -ForegroundColor Green
    Write-Host "Vercel vai fazer deploy automatico em 2-3 minutos" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acompanhe em: https://vercel.com/dashboard" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "Precisa autenticar no GitHub!" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPCAO 1 - Token (Recomendado):" -ForegroundColor White
    Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. Marque: [x] repo (todas as opcoes)" -ForegroundColor White
    Write-Host "4. Copie o token gerado" -ForegroundColor White
    Write-Host ""

    $token = Read-Host "Cole seu token aqui"

    if ($token) {
        Write-Host ""
        Write-Host "Tentando push com token..." -ForegroundColor Yellow
        $pushUrl = "https://${token}@github.com/ToyKids2025/BBB.git"
        git push $pushUrl main

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "SUCESSO! Deploy enviado!" -ForegroundColor Green
            Write-Host "Vercel vai fazer deploy automatico!" -ForegroundColor Green

            # Salvar token para proximas vezes
            git remote set-url origin $pushUrl
            Write-Host ""
            Write-Host "Token salvo para futuros pushes" -ForegroundColor Cyan
        }
        else {
            Write-Host "Erro no push. Verifique o token." -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sistema Premium BBB Link Enhancer" -ForegroundColor White
Write-Host "Amazon: buscabusca0f-20" -ForegroundColor Yellow
Write-Host "Mercado Livre: wa20250726131129" -ForegroundColor Yellow
Write-Host "CPF: 07917165973 | Senha: Alex.2025@" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan