#!/bin/bash

echo "🚀 INICIANDO SISTEMA COMPLETO BUSCABUSCABRASIL"
echo "=============================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Matar processos existentes nas portas
echo -e "${YELLOW}🔧 Limpando portas...${NC}"
for port in 3000 3001 3002; do
    if check_port $port; then
        echo "  Matando processo na porta $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install --legacy-peer-deps
fi

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️ Criando arquivo .env...${NC}"
    cp .env.local .env
fi

# Iniciar servidores em background
echo -e "${BLUE}🖥️ Iniciando servidores...${NC}"

# WhatsApp Server (porta 3001)
echo -e "  ${GREEN}✓${NC} Iniciando WhatsApp Server..."
node server-whatsapp.js > whatsapp.log 2>&1 &
WHATSAPP_PID=$!

# Cookie Proxy Server (porta 3002)
echo -e "  ${GREEN}✓${NC} Iniciando Cookie Proxy..."
node server-cookie-proxy.js > cookie.log 2>&1 &
COOKIE_PID=$!

# Aguardar servidores iniciarem
sleep 3

# Verificar status dos servidores
echo -e "${BLUE}📊 Verificando status...${NC}"

if check_port 3001; then
    echo -e "  ${GREEN}✓${NC} WhatsApp Server rodando na porta 3001"
else
    echo -e "  ${YELLOW}⚠${NC} WhatsApp Server não iniciou"
fi

if check_port 3002; then
    echo -e "  ${GREEN}✓${NC} Cookie Proxy rodando na porta 3002"
else
    echo -e "  ${YELLOW}⚠${NC} Cookie Proxy não iniciou"
fi

# Iniciar aplicação React
echo -e "${BLUE}🚀 Iniciando aplicação principal...${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✨ Sistema pronto! Abrindo no navegador...${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📌 URLs do Sistema:"
echo "  • Frontend: http://localhost:3000"
echo "  • WhatsApp API: http://localhost:3001"
echo "  • Cookie Proxy: http://localhost:3002"
echo ""
echo "📋 Comandos úteis:"
echo "  • Ver logs WhatsApp: tail -f whatsapp.log"
echo "  • Ver logs Cookie: tail -f cookie.log"
echo "  • Parar tudo: ./stop-all.sh"
echo ""

# Iniciar React (foreground)
npm start