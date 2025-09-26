#!/bin/bash

echo "🚀 BBB LINK ENHANCER - PUSH PARA GITHUB"
echo "========================================"

# Verificar se tem commits para push
if git diff --quiet origin/main..HEAD; then
    echo "✅ Nada para enviar - já está atualizado!"
else
    echo "📤 Enviando alterações para GitHub..."
    echo ""

    # Tentar push normal primeiro
    git push origin main 2>/dev/null

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCESSO! Deploy enviado para GitHub!"
        echo "🎉 Vercel vai fazer deploy automático em 2-3 minutos"
        echo ""
        echo "📌 Acompanhe em: https://vercel.com/dashboard"
    else
        echo ""
        echo "⚠️  Precisa autenticar no GitHub!"
        echo "================================"
        echo ""
        echo "OPÇÃO 1 - Token (Recomendado):"
        echo "1. Acesse: https://github.com/settings/tokens"
        echo "2. Click 'Generate new token (classic)'"
        echo "3. Marque: ✓ repo (todas as opções)"
        echo "4. Copie o token gerado"
        echo ""
        read -p "Cole seu token aqui: " GITHUB_TOKEN

        if [ ! -z "$GITHUB_TOKEN" ]; then
            echo ""
            echo "🔄 Tentando push com token..."
            git push https://$GITHUB_TOKEN@github.com/ToyKids2025/BBB.git main

            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ SUCESSO! Deploy enviado!"
                echo "🎉 Vercel vai fazer deploy automático!"
                echo ""
                # Salvar token para próximas vezes (opcional)
                git remote set-url origin https://$GITHUB_TOKEN@github.com/ToyKids2025/BBB.git
                echo "💾 Token salvo para futuros pushes"
            else
                echo "❌ Erro no push. Verifique o token."
            fi
        else
            echo "❌ Token não fornecido"
        fi
    fi
fi

echo ""
echo "📊 Status atual:"
git status --short
echo ""
echo "🏷️ Tags configuradas:"
echo "  Amazon: buscabusca0f-20"
echo "  Mercado Livre: wa20250726131129"
echo ""
echo "🔐 Credenciais:"
echo "  CPF: 07917165973"
echo "  Senha: Alex.2025@"
echo ""
echo "=========================================="