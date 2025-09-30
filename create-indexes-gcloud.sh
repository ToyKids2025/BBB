#!/bin/bash

# Script para criar índices via gcloud CLI

echo "🔥 Criando índices do Firestore via gcloud..."
echo ""

# Índice 1: pending_conversions (converted + abandoned + clickTime)
echo "📍 Criando índice 1: pending_conversions (converted, abandoned, clickTime)..."
gcloud firestore indexes composite create \
  --collection-group=pending_conversions \
  --query-scope=COLLECTION \
  --field-config field-path=converted,order=ascending \
  --field-config field-path=abandoned,order=ascending \
  --field-config field-path=clickTime,order=descending \
  --project=afiliador-inteligente

echo ""

# Índice 2: pending_conversions (converted + convertedAt)
echo "📍 Criando índice 2: pending_conversions (converted, convertedAt)..."
gcloud firestore indexes composite create \
  --collection-group=pending_conversions \
  --query-scope=COLLECTION \
  --field-config field-path=converted,order=ascending \
  --field-config field-path=convertedAt,order=descending \
  --project=afiliador-inteligente

echo ""
echo "✅ Índices criados! Aguardando construção..."
echo ""
echo "🔗 Verificar status:"
echo "https://console.firebase.google.com/project/afiliador-inteligente/firestore/indexes"