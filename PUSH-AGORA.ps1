# BBB Link Enhancer - PUSH FINAL
# ==============================
# Alexandre, execute este comando para atualizar TUDO!

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BBB LINK ENHANCER - DEPLOY FINAL     " -ForegroundColor Green
Write-Host "  Sistema Limpo com Tags Reais         " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Mostrar o que sera enviado
Write-Host "MUDANCAS A ENVIAR:" -ForegroundColor Yellow
Write-Host "- Tags reais: Amazon (buscabusca0f-20)" -ForegroundColor White
Write-Host "- Tags reais: ML (wa20250726131129)" -ForegroundColor White
Write-Host "- Sistema limpo sem dados mockados" -ForegroundColor White
Write-Host "- Login exclusivo com seu CPF" -ForegroundColor White
Write-Host ""

# Adicionar tudo
Write-Host "[1/3] Adicionando arquivos..." -ForegroundColor Cyan
git add -A

# Criar commit
Write-Host "[2/3] Criando commit..." -ForegroundColor Cyan
git commit -m "Sistema limpo: tags reais, zero mock, login exclusivo Alexandre"

# Fazer push
Write-Host "[3/3] Enviando para GitHub..." -ForegroundColor Cyan
git push origin main

# Verificar sucesso
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "         SUCESSO! TUDO ATUALIZADO!     " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub: https://github.com/ToyKids2025/BBB" -ForegroundColor White
    Write-Host "Vercel atualizando automaticamente..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TAGS ATIVAS:" -ForegroundColor Green
    Write-Host "- Amazon: buscabusca0f-20" -ForegroundColor White
    Write-Host "- Mercado Livre: wa20250726131129" -ForegroundColor White
    Write-Host ""
    Write-Host "LOGIN:" -ForegroundColor Green
    Write-Host "- CPF: 07917165973" -ForegroundColor White
    Write-Host "- Senha: Alex.2025@" -ForegroundColor White
    Write-Host ""
    Write-Host "Aguarde 2-3 minutos para Vercel atualizar." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ERRO no push! Tente:" -ForegroundColor Red
    Write-Host "git pull origin main --rebase" -ForegroundColor Yellow
    Write-Host "git push origin main" -ForegroundColor Yellow
}

Read-Host "Pressione ENTER para fechar"