#!/bin/bash

# Script de Deploy Rápido - BuscaBuscaBrasil
# Uso: ./deploy-rapido.sh "mensagem do commit"

set -e  # Parar se houver erro

echo "🚀 =========================================="
echo "   DEPLOY RÁPIDO - BuscaBuscaBrasil"
echo "============================================"
echo ""

# Verificar se tem mensagem de commit
COMMIT_MSG="${1:-Atualização automática}"

echo "📝 Mensagem do commit: $COMMIT_MSG"
echo ""

# 1. Git Status
echo "📊 Status atual do Git..."
git status --short
echo ""

# 2. Git Add
echo "➕ Adicionando arquivos ao Git..."
git add .
echo "✅ Arquivos adicionados"
echo ""

# 3. Git Commit
echo "💾 Criando commit..."
git commit -m "$COMMIT_MSG

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
echo "✅ Commit criado"
echo ""

# 4. Git Push
echo "📤 Enviando para GitHub..."
git push
echo "✅ Push concluído"
echo ""

# 5. Build
echo "🔨 Fazendo build da aplicação..."
export CI=true
export GENERATE_SOURCEMAP=false
npm run build > /dev/null 2>&1
echo "✅ Build concluído"
echo ""

# 6. Firebase Deploy
echo "🔥 Fazendo deploy no Firebase..."
export GOOGLE_APPLICATION_CREDENTIALS="./afiliador-inteligente-firebase-adminsdk-fbsvc-ddc0eedcbf.json"
npx firebase deploy --only hosting --project afiliador-inteligente 2>&1 | grep -E "Deploy complete|Hosting URL|✔"
echo ""

echo "============================================"
echo "🎉 DEPLOY COMPLETO REALIZADO COM SUCESSO!"
echo "============================================"
echo ""
echo "🌐 Seu site está disponível em:"
echo "   https://afiliador-inteligente.web.app"
echo "   https://buscabuscabrasil.com.br"
echo ""
echo "📊 Commits enviados para:"
echo "   https://github.com/ToyKids2025/BBB"
echo ""
echo "💡 Se o git push falhar, configure suas credenciais:"
echo "   git config credential.helper store"
echo "   git push"
echo ""