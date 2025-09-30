# 🧪 TESTE MANUAL - PASSO A PASSO

**Execute estes testes para garantir que TUDO está funcionando!**

---

## 📋 **TESTE 1: SITE ESTÁ NO AR**

### **Passo 1.1: Verificar URL Principal**
```
✅ Abrir: https://afiliador-inteligente.web.app
✅ Deve carregar o painel de login
```

**Resultado esperado:**
- ✅ Site carrega
- ✅ Login aparece
- ✅ Sem erros no console

### **Passo 1.2: Verificar Domínio Customizado**
```
✅ Abrir: https://buscabuscabrasil.com.br
✅ Deve redirecionar para www.buscabuscabrasil.com.br
```

**Resultado esperado:**
- ✅ Redirect funciona
- ✅ Site carrega

---

## 📋 **TESTE 2: CRIAR LINK AMAZON**

### **Passo 2.1: Fazer Login**
```
1. Entrar no painel
2. Fazer login com suas credenciais
```

### **Passo 2.2: Criar Link**
```
1. Cole esta URL de teste:
   https://www.amazon.com.br/creme-de-avela-nutella-650g/dp/B076BD6NM7/

2. Clique em "Gerar Link"

3. Copie o link curto gerado
```

### **Passo 2.3: Testar Link (Desktop)**
```
1. Abra navegador em MODO ANÔNIMO
2. Cole o link curto
3. Pressione F12 (abrir Console)
4. Acesse o link
```

**O QUE VERIFICAR NO CONSOLE:**
```
✅ Deve aparecer:
   🚀 [CAMADA 1] Ativando Eternal Tracking System...
   🍪 [CAMADA 2] Ativando Ultimate Cookie Sync...
   💰 Persistência garantida por cookies de longa duração
   🍎 [CAMADA 3] Ativando Safari Persistence...
   ✅ TODAS AS 3 CAMADAS ATIVADAS COM SUCESSO!

✅ URL final deve conter: tag=buscabusca0f-20
```

**RESULTADO ESPERADO:**
```
URL final:
https://www.amazon.com.br/creme-de-avela-nutella-650g/dp/B076BD6NM7/?tag=buscabusca0f-20
                                                                    ^^^^^^^^^^^^^^^^
                                                                    SUA TAG! ✅
```

---

## 📋 **TESTE 3: CRIAR LINK MERCADO LIVRE**

### **Passo 3.1: Criar Link**
```
1. No painel, cole uma URL do ML:
   https://www.mercadolivre.com.br/produto-teste/p/MLB123456789

2. Clique em "Gerar Link"

3. Copie o link curto gerado
```

### **Passo 3.2: Testar Link**
```
1. Modo anônimo + F12 (Console)
2. Acesse o link
3. Verificar URL final
```

**RESULTADO ESPERADO:**
```
URL final deve conter:
  matt_word=WA20250726131129
  matt_tool=WA20250726131129
```

---

## 📋 **TESTE 4: DEEP LINKS MOBILE**

### **Passo 4.1: Teste no Celular**
```
1. Abra https://buscabuscabrasil.com.br no CELULAR
2. Faça login
3. Crie link de produto ML
4. Clique no link gerado
```

**RESULTADO ESPERADO:**

**SE VOCÊ TEM APP DO ML INSTALADO:**
```
✅ Deve ABRIR O APP automaticamente!
✅ Produto deve aparecer no app
✅ URL do app deve ter seus parâmetros
```

**SE NÃO TEM APP:**
```
✅ Deve abrir navegador web
✅ URL deve ter suas tags
```

### **Passo 4.2: Verificar Console Mobile**

No celular, para ver o console:
1. Chrome Android: chrome://inspect
2. Safari iOS: Configurações → Safari → Avançado → Web Inspector

**O QUE DEVE APARECER:**
```
📱 Tentando abrir app Mercado Livre: mlapp://item/MLB...
```

---

## 📋 **TESTE 5: PERSISTÊNCIA DE DADOS**

### **Passo 5.1: Verificar LocalStorage**
```
1. Abrir Console (F12)
2. Ir em: Application → Local Storage
3. Verificar se existem chaves com:
   - bb_
   - device
   - fingerprint
```

**RESULTADO ESPERADO:**
```
✅ Deve ter 5+ chaves salvadas
```

### **Passo 5.2: Verificar Cookies**
```
1. Console → Application → Cookies
2. Verificar domínio do site
```

**RESULTADO ESPERADO:**
```
✅ Deve ter cookies salvos
```

### **Passo 5.3: Verificar IndexedDB**
```
1. Console → Application → IndexedDB
2. Ver databases:
   - BBBTracking
   - BBBEternal
   - UserData
```

**RESULTADO ESPERADO:**
```
✅ Deve ter pelo menos 1 database
```

---

## 📋 **TESTE 6: SERVICE WORKER**

### **Passo 6.1: Verificar SW**
```
1. Console → Application → Service Workers
2. Verificar se está "activated and running"
```

**RESULTADO ESPERADO:**
```
✅ Service Worker ATIVO
✅ Status: activated and running
✅ Scope: /
```

---

## 📋 **TESTE 7: PERSISTÊNCIA APÓS FECHAR**

### **Passo 7.1: Criar Link e Fechar**
```
1. Crie um link qualquer
2. FECHE o navegador completamente
3. Aguarde 5 minutos
4. Abra novamente
```

### **Passo 7.2: Verificar Dados**
```
1. Console (F12)
2. Digite:
   localStorage.getItem('bb_last_click')
```

**RESULTADO ESPERADO:**
```
✅ Deve retornar dados do último click!
✅ Dados ainda estão lá após 5 minutos!
```

---

## 📋 **TESTE 8: SCRIPT AUTOMATIZADO**

### **Passo 8.1: Cole no Console**
```
1. Abra o site
2. F12 → Console
3. Cole o conteúdo de: teste-completo.js
4. Pressione Enter
```

**RESULTADO ESPERADO:**
```
✅ Todos os testes devem passar
✅ Resumo mostra ✅ em tudo
```

---

## 📊 **CHECKLIST FINAL:**

Marque conforme for testando:

### **Deploy:**
- [ ] Site carrega em https://afiliador-inteligente.web.app
- [ ] Domínio customizado funciona
- [ ] Login funciona
- [ ] Painel carrega

### **Criação de Links:**
- [ ] Link Amazon é criado
- [ ] Link ML é criado
- [ ] Link curto funciona
- [ ] Redirect funciona

### **Tags de Afiliado:**
- [ ] Amazon tem `tag=buscabusca0f-20`
- [ ] ML tem `matt_word=WA20250726131129`
- [ ] ML tem `matt_tool=WA20250726131129`

### **Persistência:**
- [ ] LocalStorage salva dados
- [ ] Cookies são criados
- [ ] IndexedDB funciona
- [ ] Service Worker ativo
- [ ] Dados persistem após fechar

### **3 Camadas:**
- [ ] Eternal Tracking ativa
- [ ] Ultimate Cookie Sync ativa (sem cross-domain)
- [ ] Safari Persistence ativa

### **Deep Links (Mobile):**
- [ ] Detecta dispositivo móvel
- [ ] Tenta abrir app ML
- [ ] Tenta abrir app Amazon
- [ ] Fallback para web funciona

### **Console:**
- [ ] Sem erros críticos
- [ ] Logs das 3 camadas aparecem
- [ ] Eficácia ~91% é reportada

---

## ✅ **RESULTADO FINAL ESPERADO:**

Se TODOS os testes passarem:
```
✅ Sistema 100% FUNCIONAL
✅ Tags corretas aplicadas
✅ Persistência funcionando
✅ Deep links ativos
✅ 91% de eficácia
✅ PRONTO PARA GERAR COMISSÕES! 💰
```

---

## ⚠️ **SE ALGO FALHAR:**

### **Erro: Tags não aparecem**
```
Verificar:
1. .env tem as tags corretas?
2. config.js está usando .env?
3. Deploy foi feito após mudanças?
```

### **Erro: Deep links não funcionam**
```
Normal! Deep links só funcionam:
1. Em dispositivo móvel real
2. Se o app estiver instalado
3. Fallback para web sempre funciona
```

### **Erro: Persistência não funciona**
```
Verificar:
1. Navegador permite cookies?
2. Modo anônimo/privado?
3. Extensões bloqueando?
```

---

**PRONTO PARA TESTAR! BOA SORTE! 🚀**