#!/bin/bash

echo "🚀 BBB Link Enhancer - Deploy Automático"
echo "========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. CLOUDFLARE WORKER SETUP
echo -e "\n${YELLOW}📦 ETAPA 1: Configurando Cloudflare Worker${NC}"
echo "-------------------------------------------"

# Instalar Wrangler se necessário
if ! command -v wrangler &> /dev/null; then
    echo "Instalando Wrangler CLI..."
    npm install -g wrangler
fi

# Login no Cloudflare
echo -e "${GREEN}→ Faça login no Cloudflare:${NC}"
wrangler login

# Criar KV namespaces
echo -e "\n${GREEN}→ Criando KV Namespaces...${NC}"
wrangler kv:namespace create "BBB_LINKS" --preview
wrangler kv:namespace create "BBB_CLICKS" --preview
wrangler kv:namespace create "BBB_STATS" --preview

echo -e "${YELLOW}⚠️  IMPORTANTE: Copie os IDs dos KV namespaces acima e atualize o wrangler.toml${NC}"
read -p "Pressione ENTER após atualizar o wrangler.toml com os IDs..."

# Deploy do Worker
echo -e "\n${GREEN}→ Fazendo deploy do Worker...${NC}"
wrangler publish

# 2. SUPABASE SETUP
echo -e "\n${YELLOW}📦 ETAPA 2: Configurando Supabase${NC}"
echo "-------------------------------------------"
echo "1. Acesse: https://supabase.com"
echo "2. Crie um novo projeto (gratuito)"
echo "3. Vá em SQL Editor e execute o schema.sql"
echo "4. Copie a URL e ANON KEY do projeto"
read -p "Cole a SUPABASE_URL: " SUPABASE_URL
read -p "Cole a SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

# Criar .env.local
echo -e "\n${GREEN}→ Criando arquivo .env.local...${NC}"
cat > .env.local << EOF
REACT_APP_API_URL=https://bbbrasil.com/api
REACT_APP_DOMAIN=https://bbbrasil.com
REACT_APP_SUPABASE_URL=$SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

# 3. ADMIN PANEL DEPLOY
echo -e "\n${YELLOW}📦 ETAPA 3: Deploy do Admin Panel${NC}"
echo "-------------------------------------------"

# Instalar dependências
echo -e "${GREEN}→ Instalando dependências...${NC}"
npm install

# Build do projeto
echo -e "${GREEN}→ Criando build de produção...${NC}"
npm run build

# Deploy no Vercel
if command -v vercel &> /dev/null; then
    echo -e "${GREEN}→ Deploy no Vercel...${NC}"
    vercel --prod
else
    echo -e "${YELLOW}Vercel CLI não instalado. Instalando...${NC}"
    npm i -g vercel
    vercel --prod
fi

# 4. CRIAR LINKS DE TESTE
echo -e "\n${YELLOW}📦 ETAPA 4: Criando Links de Teste${NC}"
echo "-------------------------------------------"

# Função para criar shortlink
create_shortlink() {
    local dest="$1"
    local title="$2"
    local platform="$3"

    curl -X POST https://bbbrasil.com/api/redirects \
        -H "Authorization: Bearer sk_live_bbb_2024_secure_key" \
        -H "Content-Type: application/json" \
        -d "{
            \"dest\": \"$dest\",
            \"title\": \"$title\",
            \"platform\": \"$platform\",
            \"owner\": \"TEST\",
            \"add_to_cart\": true
        }" 2>/dev/null | jq -r '.short_url'
}

echo -e "${GREEN}→ Criando 10 shortlinks de teste...${NC}\n"

# Links Amazon
echo "1. Echo Dot 4ª Geração:"
create_shortlink "https://www.amazon.com.br/dp/B08MQZXN1X?tag=buscabr-20" "Echo Dot 4ª Geração" "amazon"

echo "2. Kindle Paperwhite:"
create_shortlink "https://www.amazon.com.br/dp/B08N3TCP2J?tag=buscabr-20" "Kindle Paperwhite" "amazon"

echo "3. Fire TV Stick:"
create_shortlink "https://www.amazon.com.br/dp/B08C1K6LB2?tag=buscabr-20" "Fire TV Stick" "amazon"

# Links Mercado Livre
echo "4. iPhone 13:"
create_shortlink "https://www.mercadolivre.com.br/apple-iphone-13-128-gb-meia-noite/p/MLB18908823" "iPhone 13" "mercadolivre"

echo "5. PlayStation 5:"
create_shortlink "https://www.mercadolivre.com.br/sony-playstation-5-825gb-digital/p/MLB16171888" "PlayStation 5" "mercadolivre"

echo "6. Samsung Galaxy S23:"
create_shortlink "https://www.mercadolivre.com.br/samsung-galaxy-s23-5g-256-gb/p/MLB21543542" "Galaxy S23" "mercadolivre"

# Links Magazine Luiza
echo "7. Notebook Dell:"
create_shortlink "https://www.magazineluiza.com.br/notebook-dell-inspiron/p/234567890" "Notebook Dell" "magalu"

echo "8. Smart TV LG:"
create_shortlink "https://www.magazineluiza.com.br/smart-tv-lg-55/p/345678901" "Smart TV LG 55" "magalu"

# Links Americanas
echo "9. AirPods Pro:"
create_shortlink "https://www.americanas.com.br/produto/airpods-pro-apple/456789012" "AirPods Pro" "americanas"

echo "10. JBL Charge 5:"
create_shortlink "https://www.americanas.com.br/produto/jbl-charge-5/567890123" "JBL Charge 5" "americanas"

# 5. VALIDAÇÃO FINAL
echo -e "\n${YELLOW}📦 ETAPA 5: Validação do Sistema${NC}"
echo "-------------------------------------------"

echo -e "${GREEN}✅ Checklist de Validação:${NC}"
echo "[ ] Worker respondendo em https://bbbrasil.com/r/test"
echo "[ ] Admin panel acessível"
echo "[ ] Links de teste funcionando"
echo "[ ] Cookies sendo gravados"
echo "[ ] localStorage persistindo"
echo "[ ] Add-to-cart Amazon operacional"
echo "[ ] Deep links abrindo apps"

echo -e "\n${GREEN}🎉 DEPLOYMENT CONCLUÍDO!${NC}"
echo "========================================="
echo "Worker: https://bbbrasil.com"
echo "Admin: https://admin.bbbrasil.com (ou URL Vercel)"
echo "Docs: Ver DEPLOYMENT.md para mais detalhes"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo "1. Testar cada shortlink criado"
echo "2. Verificar persistência de cookies"
echo "3. Monitorar clicks no admin panel"
echo "4. Configurar webhooks de conversão"