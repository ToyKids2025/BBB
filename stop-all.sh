#!/bin/bash

echo "🛑 PARANDO TODOS OS SERVIÇOS..."
echo "================================"

# Matar processos nas portas
for port in 3000 3001 3002; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  Parando serviço na porta $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done

# Matar processos node específicos
pkill -f "node server-whatsapp.js" 2>/dev/null
pkill -f "node server-cookie-proxy.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "✅ Todos os serviços foram parados!"