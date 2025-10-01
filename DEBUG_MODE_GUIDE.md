# 🐛 GUIA DE USO DO MODO DEBUG

## 🎯 O que foi implementado?

Sistema completo de debugging que captura TODOS os logs e permite analisar o fluxo ANTES de redirecionar!

---

## 🚀 COMO USAR - 3 FORMAS:

### **Forma 1: Adicionar ?debug=true na URL** (RECOMENDADO)
```
https://www.buscabuscabrasil.com.br/r/rKgf5CPb0RBPLjFC54Kk?debug=true
```

**O que acontece:**
- ✅ Painel de debug aparece no canto inferior direito
- ✅ TODOS os logs aparecem em tempo real
- ✅ Redirect é PAUSADO por 30 segundos (tempo pra você ler tudo!)
- ✅ Depois de 30s redireciona normalmente

---

### **Forma 2: Ativar via Console do Navegador**

1. Abra o link normalmente
2. Aperte **F12** (DevTools)
3. Na aba **Console**, digite:
```javascript
window.bbbDebug.enable()
```
4. Recarregue a página
5. Agora o debug estará ativo!

**Para desativar:**
```javascript
window.bbbDebug.disable()
```

---

### **Forma 3: Ver Logs da Última Sessão**

Se o redirect já aconteceu muito rápido, você pode ver os logs salvos:

1. Abra qualquer página do site
2. Aperte **F12** (Console)
3. Digite:
```javascript
window.bbbDebug.saved()
```

Vai mostrar:
```javascript
{
  logs: [...], // Todos os logs da última sessão
  timestamp: 1234567890 // Quando aconteceu
}
```

---

## 📊 O QUE APARECE NO PAINEL DE DEBUG:

### **Header:**
```
🐛 DEBUG PANEL
X logs • Yms • Z errors
[📖] [💾] [🗑️] [✖️]
```

**Botões:**
- 📖 = Minimizar/Expandir
- 💾 = Baixar logs como arquivo .txt
- 🗑️ = Limpar logs
- ✖️ = Fechar painel

### **Logs em tempo real:**
```
+0ms    ℹ️ 🚀 RedirectPage iniciado
+15ms   🔥 Buscando link no Firestore
+250ms  ✅ Link encontrado!
+260ms  📱 Detectando dispositivo...
+265ms  📱 Device detectado
+270ms  🔗 Deep Link suportado? false
+280ms  ℹ️ Aguardando 30000ms (DEBUG MODE) antes de redirecionar
+1000ms ✅ Ultimate Cookie Sync ATIVO
+2000ms 📊 Eternal Tracking ativado
...
+30000ms 🚀 Iniciando redirecionamento
+30010ms ✅ Tag de afiliado preservada!
+30020ms 🚀 Redirecionamento web direto
```

### **Footer - Resumo:**
```
✅ 5 success  |  ⚠️ 2 warnings  |  ❌ 0 errors  |  ⏱️ 30250ms
```

---

## 📱 EXEMPLO DE USO REAL:

### **Cenário:** Você quer conferir se o deep linking está funcionando

1. Gere um link da Amazon no sistema
2. Copie o link curto: `https://www.buscabuscabrasil.com.br/r/ABC123`
3. Adicione `?debug=true`: `https://www.buscabuscabrasil.com.br/r/ABC123?debug=true`
4. Abra no celular (Android ou iPhone)
5. Veja o painel aparecer no canto da tela
6. Leia TODOS os logs:
   ```
   ✅ Link encontrado!
   📱 Device detectado: Android 13 | Chrome
   🔗 Deep Link suportado? true
   🎯 Executando Deep Link Avançado...
   📱 Plataforma: amazon
   🤖 SO: Android 13
   🔗 Deep Link Config gerado
   🤖 [Android] Iniciando redirecionamento...
   📱 Intent URL: intent://www.amazon.com.br/dp/B000068DWZ#Intent;...
   ✅ Intent URL executado com sucesso
   ```
7. Após 30 segundos, vai redirecionar normalmente
8. Se quiser, clique no botão **💾** pra baixar todos os logs!

---

## 🔍 COMANDOS ÚTEIS NO CONSOLE:

```javascript
// Ver se debug está ativo
window.bbbDebug.isActive()

// Ver todos os logs da sessão atual
window.bbbDebug.logs()

// Ver resumo
window.bbbDebug.summary()
// Retorna: { totalLogs: 15, totalTime: 5230, errors: 0, warnings: 2, success: 10 }

// Exportar logs como arquivo
window.bbbDebug.export()

// Limpar logs
window.bbbDebug.clear()

// Ver logs salvos da última sessão
window.bbbDebug.saved()
```

---

## 🎨 APARÊNCIA DO PAINEL:

```
┌──────────────────────────────────────────────┐
│ 🐛 DEBUG PANEL          [📖] [💾] [🗑️] [✖️] │
│ 12 logs • 5230ms • 0 errors                  │
├──────────────────────────────────────────────┤
│ +0ms    ℹ️ 🚀 RedirectPage iniciado          │
│ +15ms   🔥 Buscando link no Firestore        │
│ +250ms  ✅ Link encontrado!                  │
│         📦 { platform: 'amazon', ... }       │
│ +260ms  📱 Detectando dispositivo...         │
│ +265ms  📱 Device detectado                  │
│         📦 { os: 'Android', ... }            │
│ +270ms  🔗 Deep Link suportado? false        │
│ ...                                          │
├──────────────────────────────────────────────┤
│ ✅ 10 success │ ⚠️ 2 warnings │ ❌ 0 errors  │
│ ⏱️ 5230ms                                    │
└──────────────────────────────────────────────┘
```

**Cores:**
- Fundo: Preto (#1a1a1a)
- Bordas: Verde neon (#00ff00)
- Texto: Verde claro
- Erros: Vermelho
- Warnings: Laranja
- Success: Verde

---

## 📥 BAIXAR LOGS COMO ARQUIVO:

Clique no botão **💾** ou no console:
```javascript
window.bbbDebug.export()
```

Baixa arquivo: `bbb-debug-logs-1234567890.txt`

**Conteúdo do arquivo:**
```
=== BBB DEBUG LOGS ===
Sessão iniciada em: 01/10/2025, 06:54:32
Total de logs: 15

[+0ms] ℹ️ 🚀 RedirectPage iniciado
   Dados: {
     "linkId": "rKgf5CPb0RBPLjFC54Kk",
     "debugMode": true
   }

[+15ms] 🔥 Buscando link no Firestore
   Dados: {
     "linkId": "rKgf5CPb0RBPLjFC54Kk"
   }

[+250ms] ✅ Link encontrado!
   Dados: {
     "platform": "amazon",
     "url": "https://www.amazon.com.br/One-Calvin-Klein-Eau...",
     "active": true
   }

...
```

---

## ✅ O QUE VERIFICAR NOS LOGS:

### **1. Tag de Afiliado:**
Procure por:
```
✅ Tag de afiliado preservada!
```

### **2. Platform Detection:**
Procure por:
```
✅ Link encontrado!
📦 { platform: 'amazon', url: '...?tag=buscabusca0f-20...' }
```

### **3. Device Detection:**
Procure por:
```
📱 Device detectado
📦 { os: 'Android', osVersion: '13', browser: 'Chrome', isMobile: true }
```

### **4. Deep Link:**
Procure por:
```
🔗 Deep Link suportado? true
🎯 Executando Deep Link Avançado...
🔗 Deep Link Config gerado
📦 {
  supported: true,
  os: 'Android',
  intentUrl: 'intent://...',
  fallbackUrl: '...'
}
```

### **5. Tracking Systems:**
Procure por:
```
✅ Ultimate Cookie Sync ATIVO
✅ Eternal Tracking ativado
🎯 Remarketing System ativo
```

### **6. Redirect Final:**
Procure por:
```
🚀 Iniciando redirecionamento
⚠️ DEBUG MODE: Redirect bloqueado. URL: https://...
```

---

## 🚨 TROUBLESHOOTING:

### **Painel não aparece?**
1. Verifique se tem `?debug=true` na URL
2. Ou ative via console: `window.bbbDebug.enable()`
3. Recarregue a página

### **Redirect acontece antes de eu ler?**
- Em modo debug, o delay é de **30 segundos**!
- Se ainda assim for rápido, clique no botão **💾** imediatamente
- Ou veja logs salvos depois: `window.bbbDebug.saved()`

### **Não vejo alguns logs?**
- Logs são salvos automaticamente no localStorage
- Use `window.bbbDebug.saved()` para ver logs de sessões anteriores

---

## 🎯 CHECKLIST DE TESTE:

Quando testar com `?debug=true`, confira:

- [ ] ✅ Link encontrado no Firebase?
- [ ] ✅ Platform detectada corretamente?
- [ ] ✅ Tag de afiliado presente na URL?
- [ ] ✅ Device detectado (SO, navegador)?
- [ ] ✅ Deep link suportado (se mobile)?
- [ ] ✅ Intent URL construída (Android)?
- [ ] ✅ Universal Link tentada (iOS)?
- [ ] ✅ Cookie Sync ativo?
- [ ] ✅ Eternal Tracking ativo?
- [ ] ✅ Remarketing ativo?
- [ ] ✅ Redirect final para URL correta?
- [ ] ✅ Tag preservada na URL final?

---

## 💡 DICAS:

1. **Sempre teste primeiro com ?debug=true** antes de enviar pra usuários reais
2. **Baixe os logs** (botão 💾) e guarde como evidência
3. **Teste em diferentes dispositivos**: Desktop, Android, iPhone
4. **Teste em diferentes navegadores**: Chrome, Safari, Firefox
5. **Compartilhe logs** se precisar de ajuda (arquivo .txt é fácil de enviar)

---

**🔥 AGORA VOCÊ TEM CONTROLE TOTAL DO QUE ESTÁ ACONTECENDO! NENHUM LOG ESCAPA!** 🐛✨
