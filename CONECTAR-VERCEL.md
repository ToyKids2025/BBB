# 🚀 CONECTAR GITHUB COM VERCEL - PASSO A PASSO

## ⚡ MÉTODO MAIS FÁCIL (RECOMENDADO):

### 1️⃣ **ACESSE O VERCEL:**
https://vercel.com

### 2️⃣ **FAÇA LOGIN COM GITHUB:**
Clique em "Login with GitHub"

### 3️⃣ **IMPORTE O PROJETO:**

1. Clique em **"Add New..."** → **"Project"**
2. Na lista, procure por **"BBB"** (seu repositório)
3. Clique em **"Import"**

### 4️⃣ **CONFIGURE O PROJETO:**

```
Project Name: bbb-link-enhancer
Framework Preset: Create React App
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### 5️⃣ **ADICIONE VARIÁVEIS DE AMBIENTE:**

Clique em "Environment Variables" e adicione:

```
CI = false
GENERATE_SOURCEMAP = false
REACT_APP_API_URL = https://bbbrasil.com/api
REACT_APP_DOMAIN = https://bbbrasil.com
```

### 6️⃣ **CLIQUE EM "DEPLOY"**

---

## ✅ PRONTO! AGORA FUNCIONA AUTOMATICAMENTE:

Toda vez que você fizer `git push`:
1. GitHub recebe o código
2. Vercel detecta automaticamente
3. Faz build e deploy
4. Site atualizado em 2-3 minutos!

---

## 🔧 ALTERNATIVA: Usar Vercel CLI

### No PowerShell:
```powershell
# Instalar Vercel CLI se não tiver
npm i -g vercel

# Login
vercel login

# Link com projeto existente
vercel link

# Deploy manual
vercel --prod
```

---

## 🚨 IMPORTANTE:

**NÃO PRECISA** configurar GitHub Actions para Vercel!
O Vercel já faz tudo automaticamente quando você importa o projeto.

---

## 📊 APÓS CONECTAR:

Você verá:
- URL do projeto: `bbb-link-enhancer.vercel.app`
- Deploys automáticos a cada push
- Preview URLs para cada branch
- Analytics em tempo real

---

## 🎯 RESUMO RÁPIDO:

1. Entre em: https://vercel.com
2. Login com GitHub
3. Importe projeto "BBB"
4. Configure as variáveis
5. Deploy!

**SIMPLES ASSIM!** Em 2 minutos está funcionando! 🚀