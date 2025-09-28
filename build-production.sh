#!/bin/bash

echo "🏗️ BUILD DE PRODUÇÃO OTIMIZADO"
echo "=============================="

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf build/

# Definir variáveis de produção
echo "⚙️ Configurando variáveis de produção..."
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export CI=false

# Build otimizado
echo "📦 Criando build otimizado..."
npm run build

# Verificar tamanho do build
echo ""
echo "📊 Análise do Build:"
echo "-------------------"
du -sh build/
echo ""
du -sh build/static/js/*.js | head -5
echo ""

# Criar arquivo de deploy para Vercel
echo "🚀 Preparando para deploy..."
cat > vercel-production.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      },
      "dest": "/static/\$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_AMAZON_TAG": "@amazon_tag",
    "REACT_APP_ML_AFFILIATE_ID": "@ml_affiliate_id",
    "REACT_APP_FIREBASE_API_KEY": "@firebase_api_key",
    "REACT_APP_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "REACT_APP_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "REACT_APP_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "REACT_APP_FIREBASE_APP_ID": "@firebase_app_id",
    "REACT_APP_TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "REACT_APP_TELEGRAM_CHAT_ID": "@telegram_chat_id"
  }
}
EOF

echo "✅ Build de produção concluído!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Deploy para Vercel: vercel --prod"
echo "  2. Deploy para Netlify: netlify deploy --prod"
echo "  3. Servir localmente: npx serve -s build"
echo ""
echo "🎯 Build otimizado e pronto para produção!"