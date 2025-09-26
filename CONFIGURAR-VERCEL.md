# 🚀 CONFIGURAÇÃO VERCEL - DEPLOY AUTOMÁTICO

## 📋 PASSO 1: CONECTAR VERCEL COM GITHUB

### 1.1 Acesse o Vercel:
https://vercel.com

### 1.2 Faça login com GitHub

### 1.3 Importe o projeto:
1. Clique em "Add New" → "Project"
2. Procure por "BBB" ou "ToyKids2025/BBB"
3. Clique em "Import"

### 1.4 Configure o projeto:
```
Project Name: bbb-link-enhancer
Framework Preset: Create React App
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 1.5 Variáveis de ambiente:
Clique em "Environment Variables" e adicione:
```
REACT_APP_API_URL = https://bbbrasil.com/api
REACT_APP_DOMAIN = https://bbbrasil.com
CI = false
```

### 1.6 Clique em "Deploy"

---

## 📋 PASSO 2: CONFIGURAR GITHUB SECRETS

### 2.1 Vá para seu repositório GitHub:
https://github.com/ToyKids2025/BBB

### 2.2 Acesse Settings → Secrets and variables → Actions

### 2.3 Adicione os seguintes secrets:

#### VERCEL_TOKEN:
1. Vá em: https://vercel.com/account/tokens
2. Create Token → Nome: "BBB Deploy"
3. Copie o token e cole como secret

#### VERCEL_ORG_ID:
1. Vá em: https://vercel.com/account
2. Copie seu "Team ID" ou "Personal Account ID"

#### VERCEL_PROJECT_ID:
1. Vá no projeto no Vercel
2. Settings → General
3. Copie o "Project ID"

---

## 📋 PASSO 3: TESTAR DEPLOY AUTOMÁTICO

### Comando simples no PowerShell:
```powershell
# Opção 1: Script PowerShell
.\git-push.ps1

# Opção 2: Comando direto
git add . && git commit -m "teste" && git push

# Opção 3: Arquivo BAT (duplo clique)
PUSH.bat
```

---

## ✅ RESULTADO ESPERADO:

Quando você fizer `git push`:

1. **GitHub** recebe o código ✅
2. **GitHub Actions** roda automaticamente ✅
3. **Vercel** faz build e deploy ✅
4. **Site atualizado** em 2-3 minutos ✅

---

## 🔧 COMANDOS ÚTEIS:

### Ver logs do GitHub Actions:
https://github.com/ToyKids2025/BBB/actions

### Ver deployments do Vercel:
https://vercel.com/dashboard

### Forçar rebuild no Vercel:
```powershell
vercel --prod --force
```

---

## 🚨 SE DER ERRO:

### Erro: "Vercel token invalid"
→ Gere novo token no Vercel e atualize o secret

### Erro: "Build failed"
→ Verifique se `npm run build` funciona localmente

### Erro: "Permission denied"
→ Verifique se você tem permissão no repositório

---

## 🎯 COMANDO ÚNICO PARA TUDO:

Alexandre, depois de configurar, use apenas:

```powershell
.\git-push.ps1
```

Ou simplesmente dê duplo clique em `PUSH.bat`!

Pronto! Tudo atualiza automaticamente! 🚀