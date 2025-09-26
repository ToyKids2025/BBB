# 🔥 CONFIGURAÇÃO DOS ÍNDICES DO FIREBASE

## ⚠️ IMPORTANTE: Execute estes passos para corrigir os erros do console

### 1. CRIAR ÍNDICES NO FIRESTORE

O Firebase precisa de índices para queries complexas. Siga estes passos:

1. **Acesse o Console do Firebase:**
   - https://console.firebase.google.com/project/afiliador-inteligente/firestore

2. **Vá para a aba "Índices"**

3. **Clique em "Criar Índice" e adicione:**

   **Índice 1 - Links:**
   - Coleção: `links`
   - Campos:
     - `userId` (Crescente)
     - `createdAt` (Decrescente)
   - Escopo: Coleção

   **Índice 2 - Conversions:**
   - Coleção: `conversions`
   - Campos:
     - `userId` (Crescente)
     - `createdAt` (Decrescente)
   - Escopo: Coleção

### 2. ATUALIZAR REGRAS DE SEGURANÇA

1. No console do Firebase, vá para **Firestore > Regras**
2. Substitua o conteúdo por:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /links/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    match /conversions/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Clique em **Publicar**

### 3. DEPLOY DOS ÍNDICES VIA CLI (Opcional)

Se você tiver o Firebase CLI instalado:

```bash
# Instalar Firebase CLI se necessário
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto
firebase init firestore

# Deploy das regras e índices
firebase deploy --only firestore
```

### 4. VERIFICAR FUNCIONAMENTO

Após criar os índices:
1. Aguarde 2-3 minutos para propagação
2. Recarregue a aplicação (F5)
3. Os erros devem desaparecer do console

### 5. SE OS ERROS PERSISTIREM

Se ainda houver erros após criar os índices:

1. **Limpe o cache do navegador:**
   - Ctrl+Shift+Delete
   - Marque "Dados em cache" e "Cookies"

2. **Verifique as credenciais:**
   - Confirme que `.env.local` tem as variáveis corretas
   - Reinicie o servidor: `npm start`

3. **Debug rápido:**
   ```javascript
   // Adicione temporariamente no console do navegador:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

## ✅ RESULTADO ESPERADO

Após a configuração:
- ✅ Sem erros no console
- ✅ Links carregando normalmente
- ✅ Analytics funcionando
- ✅ Criação de links OK

## 📝 NOTAS

- Os índices levam alguns minutos para serem criados
- As regras são aplicadas imediatamente
- O sistema funciona mesmo sem os índices (com filtros manuais)

---

**Última atualização:** Setembro 2024
**Sistema:** BBB Link Enhancer com Firebase