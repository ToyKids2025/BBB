# 🔥 CRIAR ÍNDICES DO FIRESTORE - PASSO A PASSO

## ❌ PROBLEMA
O dashboard de remarketing precisa de índices compostos no Firestore para funcionar.

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Clicar no Link do Erro (MAIS RÁPIDO!)

O próprio erro do console já tem o link direto:

```
https://console.firebase.google.com/v1/r/project/afiliador-inteligente/firestore/indexes?create_composite=...
```

**Basta clicar no link e confirmar!** ✅

---

### Opção 2: Criar Manualmente

1. **Abra o Firebase Console:**
   https://console.firebase.google.com/project/afiliador-inteligente/firestore/indexes

2. **Clique em "Create Index"**

3. **Criar Índice 1:**
   - Collection: `pending_conversions`
   - Fields:
     - `converted` → Ascending
     - `abandoned` → Ascending
     - `clickTime` → Descending
   - Query scope: Collection
   - Clique em "Create"

4. **Criar Índice 2:**
   - Collection: `pending_conversions`
   - Fields:
     - `converted` → Ascending
     - `convertedAt` → Descending
   - Query scope: Collection
   - Clique em "Create"

---

### Opção 3: Copiar e Colar (Via REST API)

Execute este comando no terminal:

```bash
# Índice 1
curl -X POST \
  "https://firestore.googleapis.com/v1/projects/afiliador-inteligente/databases/(default)/collectionGroups/pending_conversions/indexes" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {"fieldPath": "converted", "order": "ASCENDING"},
      {"fieldPath": "abandoned", "order": "ASCENDING"},
      {"fieldPath": "clickTime", "order": "DESCENDING"}
    ],
    "queryScope": "COLLECTION"
  }'

# Índice 2
curl -X POST \
  "https://firestore.googleapis.com/v1/projects/afiliador-inteligente/databases/(default)/collectionGroups/pending_conversions/indexes" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {"fieldPath": "converted", "order": "ASCENDING"},
      {"fieldPath": "convertedAt", "order": "DESCENDING"}
    ],
    "queryScope": "COLLECTION"
  }'
```

---

## ⏳ APÓS CRIAR

- Os índices levam **alguns minutos** para serem construídos
- Status: "Building" → "Ready"
- Quando ficarem "Ready", o dashboard vai funcionar!

---

## 🎯 POR QUE ISSO É NECESSÁRIO?

O Firestore exige índices compostos quando você faz queries com:
- Múltiplos `where()` + `orderBy()`
- Nosso caso:
  ```js
  where('converted', '==', false)
  where('abandoned', '==', false)
  orderBy('clickTime', 'desc')
  ```

---

## ✅ COMO SABER SE FUNCIONOU?

1. Aguarde 2-5 minutos
2. Atualize a página do dashboard
3. O erro deve sumir
4. Dashboard deve carregar os dados!

---

**🔗 Link Direto do Console:**
https://console.firebase.google.com/project/afiliador-inteligente/firestore/indexes