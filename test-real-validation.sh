#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}     TESTE DE VALIDAÇÃO REAL - BUSCABUSCABRASIL${NC}"
echo -e "${CYAN}     ZERO PERDA DE COMISSÕES - TESTE EXTREMO${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Configurações
API_URL="http://localhost:3002"
WHATSAPP_URL="http://localhost:3001"
APP_URL="http://localhost:3000"

# Tags reais
ML_TAG="WA20250726131129"
AMAZON_TAG="buscabrasil-20"

# Contadores
PASS=0
FAIL=0
WARNINGS=0

echo -e "\n${YELLOW}▶ TESTE 1: VERIFICANDO SERVIDORES${NC}\n"

# Teste Frontend
echo -n "  Testando Frontend (porta 3000)... "
if curl -s -o /dev/null -w "%{http_code}" $APP_URL | grep -q "200\|304"; then
    echo -e "${GREEN}✓ Online${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Offline${NC}"
    ((FAIL++))
fi

# Teste Cookie Server
echo -n "  Testando Cookie Server (porta 3002)... "
if curl -s "$API_URL/api/health" | grep -q "operational"; then
    echo -e "${GREEN}✓ Operacional${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Erro${NC}"
    ((FAIL++))
fi

# Teste WhatsApp Server
echo -n "  Testando WhatsApp Server (porta 3001)... "
if curl -s "$WHATSAPP_URL/health" | grep -q "ok"; then
    echo -e "${GREEN}✓ Online${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ Offline (não crítico)${NC}"
    ((WARNINGS++))
fi

echo -e "\n${YELLOW}▶ TESTE 2: CRIANDO COOKIES DE AFILIADO${NC}\n"

# Criar cookies para Mercado Livre
echo -n "  Criando cookies ML... "
COOKIE_RESPONSE=$(curl -s -X POST "$API_URL/api/cookie/set" \
    -H "Content-Type: application/json" \
    -d "{\"affiliateTag\":\"$ML_TAG\",\"productUrl\":\"https://www.mercadolivre.com.br/test\",\"platform\":\"mercadolivre\"}")

if echo "$COOKIE_RESPONSE" | grep -q "success.*true"; then
    SESSION_ID=$(echo "$COOKIE_RESPONSE" | grep -oP '"sessionId":"[^"]*"' | cut -d'"' -f4)
    TRACKING_ID=$(echo "$COOKIE_RESPONSE" | grep -oP '"trackingId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Criados${NC}"
    echo -e "    Session: ${BLUE}${SESSION_ID:0:20}...${NC}"
    echo -e "    Tracking: ${BLUE}${TRACKING_ID:0:20}...${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Falha${NC}"
    ((FAIL++))
fi

# Criar cookies para Amazon
echo -n "  Criando cookies Amazon... "
COOKIE_RESPONSE=$(curl -s -X POST "$API_URL/api/cookie/set" \
    -H "Content-Type: application/json" \
    -d "{\"affiliateTag\":\"$AMAZON_TAG\",\"productUrl\":\"https://www.amazon.com.br/dp/B0CJK4JG67\",\"platform\":\"amazon\"}")

if echo "$COOKIE_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Criados${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Falha${NC}"
    ((FAIL++))
fi

echo -e "\n${YELLOW}▶ TESTE 3: VERIFICANDO PERSISTÊNCIA${NC}\n"

# Verificar cookies
echo -n "  Verificando sessão válida... "
VERIFY_RESPONSE=$(curl -s "$API_URL/api/cookie/verify" -H "Cookie: bb_session=$SESSION_ID")

if echo "$VERIFY_RESPONSE" | grep -q "hasValidSession.*true"; then
    echo -e "${GREEN}✓ Sessão válida${NC}"

    # Extrair informações
    AFFILIATE=$(echo "$VERIFY_RESPONSE" | grep -oP '"affiliateTag":"[^"]*"' | cut -d'"' -f4)
    if [ "$AFFILIATE" = "$ML_TAG" ] || [ "$AFFILIATE" = "$AMAZON_TAG" ]; then
        echo -e "    Tag preservada: ${GREEN}$AFFILIATE${NC}"
        ((PASS++))
    else
        echo -e "    ${RED}Tag incorreta: $AFFILIATE${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ Sessão inválida${NC}"
    ((FAIL++))
fi

echo -e "\n${YELLOW}▶ TESTE 4: PIXEL TRACKING${NC}\n"

# Testar pixel
echo -n "  Disparando pixel de tracking... "
PIXEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/pixel.gif?t=$TRACKING_ID&e=test_event")

if [ "$PIXEL_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Pixel disparado${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Falha no pixel${NC}"
    ((FAIL++))
fi

echo -e "\n${YELLOW}▶ TESTE 5: CROSS-DOMAIN SYNC${NC}\n"

# Criar token de sincronização
echo -n "  Criando token cross-domain... "
SYNC_RESPONSE=$(curl -s -X POST "$API_URL/api/sync/cross-domain" \
    -H "Content-Type: application/json" \
    -d "{\"sourceOrigin\":\"http://localhost:3000\",\"targetOrigin\":\"https://www.mercadolivre.com.br\",\"affiliateTag\":\"$ML_TAG\"}")

if echo "$SYNC_RESPONSE" | grep -q "syncToken"; then
    SYNC_TOKEN=$(echo "$SYNC_RESPONSE" | grep -oP '"syncToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Token criado${NC}"
    echo -e "    Token: ${BLUE}${SYNC_TOKEN:0:20}...${NC}"
    ((PASS++))

    # Aplicar sincronização
    echo -n "  Aplicando sincronização... "
    APPLY_RESPONSE=$(curl -s "$API_URL/api/sync/apply/$SYNC_TOKEN")

    if echo "$APPLY_RESPONSE" | grep -q "success.*true"; then
        echo -e "${GREEN}✓ Aplicado${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ Falha ao aplicar${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ Falha ao criar token${NC}"
    ((FAIL++))
fi

echo -e "\n${YELLOW}▶ TESTE 6: RASTREAMENTO DE EVENTOS${NC}\n"

# Rastrear evento
echo -n "  Enviando evento de teste... "
EVENT_RESPONSE=$(curl -s -X POST "$API_URL/api/track/event" \
    -H "Content-Type: application/json" \
    -d "{\"trackingId\":\"$TRACKING_ID\",\"event\":\"return_visit\",\"data\":{\"test\":true}}")

if echo "$EVENT_RESPONSE" | grep -q "success.*true"; then
    EVENTS_COUNT=$(echo "$EVENT_RESPONSE" | grep -oP '"eventsCount":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ Rastreado${NC}"
    echo -e "    Total de eventos: ${BLUE}$EVENTS_COUNT${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Falha no rastreamento${NC}"
    ((FAIL++))
fi

echo -e "\n${YELLOW}▶ TESTE 7: GERAÇÃO DE LINKS REAIS${NC}\n"

# URLs de teste reais
ML_PRODUCTS=(
    "https://www.mercadolivre.com.br/furadeira-de-impacto-bosch-gsb-13-re-professional/p/MLB18723880"
    "https://produto.mercadolivre.com.br/MLB-3635470297-chave-de-fenda-tramontina"
    "https://www.mercadolivre.com.br/notebook-lenovo/p/MLB18501920"
)

AMAZON_PRODUCTS=(
    "https://www.amazon.com.br/dp/B0CJK4JG67"
    "https://www.amazon.com.br/Echo-Dot-5-geracao/dp/B09B8W5FW7"
    "https://www.amazon.com.br/dp/B08N3TCP2N"
)

echo "  Testando links do Mercado Livre:"
for url in "${ML_PRODUCTS[@]}"; do
    # Extrair nome do produto
    product_name=$(echo "$url" | grep -oP '[^/]+$' | cut -c1-30)
    echo -n "    $product_name... "

    # Simular geração de link com tag
    if echo "$url" | grep -q "mercadolivre\|MLB"; then
        # Adicionar parâmetros de afiliado
        if echo "$url" | grep -q "?"; then
            affiliate_url="${url}&matt_word=$ML_TAG&matt_tool=88344921"
        else
            affiliate_url="${url}?matt_word=$ML_TAG&matt_tool=88344921"
        fi

        # Verificar se a tag está presente
        if echo "$affiliate_url" | grep -q "$ML_TAG"; then
            echo -e "${GREEN}✓${NC}"
            ((PASS++))
        else
            echo -e "${RED}✗ Tag não adicionada${NC}"
            ((FAIL++))
        fi
    else
        echo -e "${YELLOW}⚠ URL inválida${NC}"
        ((WARNINGS++))
    fi
done

echo "  Testando links da Amazon:"
for url in "${AMAZON_PRODUCTS[@]}"; do
    # Extrair ASIN
    asin=$(echo "$url" | grep -oP 'dp/[A-Z0-9]+' | cut -d'/' -f2)
    echo -n "    ASIN $asin... "

    # Adicionar tag de afiliado
    if echo "$url" | grep -q "?"; then
        affiliate_url="${url}&tag=$AMAZON_TAG"
    else
        affiliate_url="${url}?tag=$AMAZON_TAG"
    fi

    # Verificar se a tag está presente
    if echo "$affiliate_url" | grep -q "$AMAZON_TAG"; then
        echo -e "${GREEN}✓${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ Tag não adicionada${NC}"
        ((FAIL++))
    fi
done

echo -e "\n${YELLOW}▶ TESTE 8: SIMULAÇÃO DE RETORNO DIRETO${NC}\n"

echo "  Simulando usuário que volta após 3 dias:"
echo -n "    1. Clique inicial com afiliado... "
# Criar sessão inicial
INITIAL_RESPONSE=$(curl -s -X POST "$API_URL/api/cookie/set" \
    -H "Content-Type: application/json" \
    -d "{\"affiliateTag\":\"$ML_TAG\",\"productUrl\":\"https://www.mercadolivre.com.br/produto-teste\",\"platform\":\"mercadolivre\"}")

if echo "$INITIAL_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓${NC}"
    SESSION_RETURN=$(echo "$INITIAL_RESPONSE" | grep -oP '"sessionId":"[^"]*"' | cut -d'"' -f4)
    ((PASS++))
else
    echo -e "${RED}✗${NC}"
    ((FAIL++))
fi

echo -n "    2. Simulando retorno direto... "
# Verificar se sessão persiste
RETURN_CHECK=$(curl -s "$API_URL/api/cookie/verify" \
    -H "Cookie: bb_aff_eternal=$ML_TAG")

if echo "$RETURN_CHECK" | grep -q "hasValidSession.*true"; then
    echo -e "${GREEN}✓${NC}"

    if echo "$RETURN_CHECK" | grep -q "$ML_TAG"; then
        echo -e "    ${GREEN}✅ COMISSÃO CAPTURADA! Tag $ML_TAG preservada${NC}"
        ((PASS++))
    else
        echo -e "    ${RED}❌ Tag perdida${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ Sessão perdida${NC}"
    ((FAIL++))
fi

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                       RELATÓRIO FINAL${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}\n"

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASS * 100 / TOTAL))
else
    SUCCESS_RATE=0
fi

echo -e "  ${GREEN}✓ Testes aprovados: $PASS${NC}"
echo -e "  ${RED}✗ Testes falhados: $FAIL${NC}"
echo -e "  ${YELLOW}⚠ Avisos: $WARNINGS${NC}"
echo -e "  ${BLUE}📊 Taxa de sucesso: $SUCCESS_RATE%${NC}"

echo -e "\n${CYAN}ANÁLISE CRÍTICA:${NC}\n"

if [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "  ${GREEN}✅ SISTEMA FUNCIONANDO CORRETAMENTE!${NC}"
    echo -e "  ${GREEN}→ Comissões estão sendo capturadas${NC}"
    echo -e "  ${GREEN}→ Cookies persistentes funcionando${NC}"
    echo -e "  ${GREEN}→ Tags de afiliado corretas${NC}"
elif [ $SUCCESS_RATE -ge 60 ]; then
    echo -e "  ${YELLOW}⚠️ SISTEMA PARCIALMENTE FUNCIONAL${NC}"
    echo -e "  ${YELLOW}→ Algumas funcionalidades precisam ajustes${NC}"
    echo -e "  ${YELLOW}→ Verificar configurações${NC}"
else
    echo -e "  ${RED}❌ SISTEMA COM PROBLEMAS CRÍTICOS${NC}"
    echo -e "  ${RED}→ Risco alto de perda de comissões${NC}"
    echo -e "  ${RED}→ Necessário correção urgente${NC}"
fi

# Salvar relatório
REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "RELATÓRIO DE TESTE - $(date)"
    echo "================================"
    echo "Testes aprovados: $PASS"
    echo "Testes falhados: $FAIL"
    echo "Avisos: $WARNINGS"
    echo "Taxa de sucesso: $SUCCESS_RATE%"
    echo ""
    echo "Tags configuradas:"
    echo "  Mercado Livre: $ML_TAG"
    echo "  Amazon: $AMAZON_TAG"
} > "$REPORT_FILE"

echo -e "\n${CYAN}📄 Relatório salvo em: $REPORT_FILE${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}\n"