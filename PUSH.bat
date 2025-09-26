@echo off
title BBB Link Enhancer - Git Push
color 0A

echo.
echo =====================================
echo   GIT PUSH AUTOMATICO - BBB LINKS
echo =====================================
echo.

REM Adicionar todas as mudancas
echo [1/4] Adicionando mudancas...
git add -A

REM Criar commit
echo.
echo [2/4] Criando commit...
git commit -m "Update: %date% %time% - Alexandre"

REM Fazer push
echo.
echo [3/4] Enviando para GitHub...
git push origin main

REM Verificar resultado
echo.
if %errorlevel% == 0 (
    echo =====================================
    echo        SUCESSO! TUDO ATUALIZADO!
    echo =====================================
    echo.
    echo GitHub: https://github.com/ToyKids2025/BBB
    echo Vercel atualizando automaticamente...
    echo.
    echo Aguarde 2-3 minutos para ver as mudancas.
) else (
    echo ERRO ao fazer push!
    echo Tente: git pull origin main --rebase
)

echo.
pause