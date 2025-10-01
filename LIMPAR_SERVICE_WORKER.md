# 🧹 LIMPAR SERVICE WORKER - SCRIPT DE LIMPEZA

## ⚠️ VOCÊ ESTÁ VENDO ESSES ERROS?

```
Failed to fetch at networkFirstStrategy (sw.js:87)
Failed to fetch at cacheFirstStrategy (sw.js:132)
Mixed Content: The page at 'https://...' was loaded over HTTPS
```

**CAUSA:** Service Worker v2.0.0 (antigo) ainda está em cache do navegador.

**SOLUÇÃO:** Executar limpeza completa abaixo.

---

## 🚀 SOLUÇÃO RÁPIDA (RECOMENDADA)

### **Opção 1: Aba Anônima**
1. Abra **Aba Anônima** (Ctrl+Shift+N)
2. Acesse: https://www.buscabuscabrasil.com.br
3. ✅ Erros não aparecem mais!

### **Opção 2: Limpar Cache Manualmente**
1. Abra DevTools (F12)
2. Aba **Application**
3. **Service Workers** → Clique **Unregister** em todos
4. **Storage** → **Clear site data** → Marcar tudo → **Clear**
5. Recarregar página (Ctrl+Shift+R)

---

## 🔧 SOLUÇÃO AUTOMÁTICA (SCRIPT)

### **Cole no Console (F12):**

```javascript
// 🧹 SCRIPT DE LIMPEZA TOTAL - Service Worker + Cache
(async function() {
  console.log('🧹 Iniciando limpeza total...');

  // 1. Desregistrar TODOS os Service Workers
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log(`📋 Encontrados ${registrations.length} service workers`);

  for (let reg of registrations) {
    await reg.unregister();
    console.log('✅ Service Worker desregistrado:', reg.scope);
  }

  // 2. Limpar TODOS os caches
  const cacheNames = await caches.keys();
  console.log(`📋 Encontrados ${cacheNames.length} caches`);

  for (let cacheName of cacheNames) {
    await caches.delete(cacheName);
    console.log('✅ Cache deletado:', cacheName);
  }

  // 3. Limpar LocalStorage
  localStorage.clear();
  console.log('✅ LocalStorage limpo');

  // 4. Limpar SessionStorage
  sessionStorage.clear();
  console.log('✅ SessionStorage limpo');

  // 5. Limpar IndexedDB
  const databases = await indexedDB.databases();
  for (let db of databases) {
    indexedDB.deleteDatabase(db.name);
    console.log('✅ IndexedDB deletado:', db.name);
  }

  console.log('');
  console.log('🎉 LIMPEZA COMPLETA!');
  console.log('🔄 Recarregando página em 2 segundos...');

  setTimeout(() => {
    location.reload(true); // Hard reload
  }, 2000);
})();
```

---

## 📊 RESULTADO ESPERADO

### **Antes da Limpeza:**
```
❌ [SW] Service Worker loaded (v2.0.0 antigo)
❌ Failed to fetch at networkFirstStrategy
❌ Failed to fetch at cacheFirstStrategy
❌ Mixed Content errors
❌ 50+ erros no console
```

### **Depois da Limpeza:**
```
✅ [SW] Service Worker v3.0.0 loaded - Clean Amazon + ML only
✅ [SW] Installing v3.0.0 - Clean version
✅ [SW] Activation complete - Taking control
✅ Console limpo (apenas logs úteis)
```

---

## 🔍 COMO CONFIRMAR QUE FUNCIONOU?

### **1. Verificar Versão do SW:**
```javascript
// Cole no Console (F12):
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker ativo:', reg?.active?.scriptURL);
});
```

**Deve mostrar:** `https://www.buscabuscabrasil.com.br/sw.js`

### **2. Verificar Cache:**
```javascript
// Cole no Console (F12):
caches.keys().then(keys => {
  console.log('Caches ativos:', keys);
});
```

**Deve mostrar:** `["bbb-v3.0.0-clean-static"]` (apenas v3.0.0)

### **3. Verificar Console:**
- ✅ Sem erros "Failed to fetch"
- ✅ Sem erros "Mixed Content"
- ✅ Mensagem: `[SW] Service Worker v3.0.0 loaded - Clean Amazon + ML only`

---

## ❓ PERGUNTAS FREQUENTES

### **P: Por que preciso limpar manualmente?**
R: Service Workers têm cache agressivo. O v2.0.0 antigo está "preso" no navegador até você limpar.

### **P: Vou perder meus links salvos?**
R: Não! Links estão no Firebase (nuvem), não no cache local.

### **P: Preciso fazer isso em todos os dispositivos?**
R: Sim, cada navegador/dispositivo precisa limpar seu próprio cache.

### **P: Posso fazer isso via código?**
R: Não automaticamente. Navegadores exigem ação manual do usuário para segurança.

---

## ✅ CHECKLIST PÓS-LIMPEZA

Depois de limpar, confirme:

- [ ] Console mostra: `[SW] Service Worker v3.0.0 loaded`
- [ ] Sem erros "Failed to fetch"
- [ ] Sem erros "Mixed Content"
- [ ] Apenas 1 cache: `bbb-v3.0.0-clean-static`
- [ ] Console tem menos de 5 avisos (AudioContext é normal)

---

## 🆘 SE AINDA VER ERROS

Execute novamente no Console:

```javascript
// Forçar atualização do Service Worker
navigator.serviceWorker.getRegistration().then(async reg => {
  if (reg) {
    await reg.update();
    console.log('✅ Service Worker atualizado');

    // Enviar mensagem para ativar imediatamente
    reg.active?.postMessage({ type: 'SKIP_WAITING' });

    setTimeout(() => location.reload(), 1000);
  }
});
```

---

**✅ Depois dessa limpeza, seu sistema estará 100% limpo e funcional!**
