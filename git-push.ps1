# BBB Link Enhancer - Git Push Automático
# =========================================
# Alexandre, use este script para atualizar tudo com um comando!

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  GIT PUSH AUTOMATICO - BBB LINKS   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
$currentPath = Get-Location
Write-Host "Pasta atual: $currentPath" -ForegroundColor Yellow

# 1. ADICIONAR TODAS AS MUDANÇAS
Write-Host ""
Write-Host "1. Adicionando mudancas..." -ForegroundColor Green
git add -A

# 2. MOSTRAR STATUS
Write-Host ""
Write-Host "2. Status atual:" -ForegroundColor Green
git status --short

# 3. CRIAR COMMIT
Write-Host ""
$commitMessage = Read-Host "Digite a mensagem do commit (ou ENTER para padrao)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'dd/MM/yyyy HH:mm') - Alexandre"
}

Write-Host "3. Criando commit..." -ForegroundColor Green
git commit -m "$commitMessage"

# 4. FAZER PUSH
Write-Host ""
Write-Host "4. Enviando para GitHub..." -ForegroundColor Green
git push origin main

# 5. VERIFICAR RESULTADO
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "    SUCESSO! TUDO ATUALIZADO!       " -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub atualizado: https://github.com/ToyKids2025/BBB" -ForegroundColor White
    Write-Host "Vercel fazendo deploy automatico..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Aguarde 2-3 minutos para o Vercel atualizar." -ForegroundColor Cyan
    Write-Host "Acesse: https://bbb-link-enhancer.vercel.app" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERRO ao fazer push!" -ForegroundColor Red
    Write-Host "Tente novamente ou execute:" -ForegroundColor Yellow
    Write-Host "git pull origin main --rebase" -ForegroundColor White
    Write-Host "git push origin main" -ForegroundColor White
}

Write-Host ""
Read-Host "Pressione ENTER para fechar"