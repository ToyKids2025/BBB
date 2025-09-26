# 🔐 CREDENCIAIS DE ACESSO - BBB LINK ENHANCER

## ⚠️ IMPORTANTE: MUDE ESTAS SENHAS EM PRODUÇÃO!

## 📱 ADMIN PANEL (Interface Web)

### Credenciais Padrão:
```
Usuário: admin
Senha: admin123
```

### URL de Acesso:
- Local: http://localhost:3000
- Produção: https://bbb-link-enhancer.vercel.app

---

## 🔧 PARA TESTAR LOCALMENTE:

### 1. Modo Desenvolvimento (sem autenticação):
```bash
# Edite src/App.jsx linha 20-30
# Comente a validação de token para teste local:

// DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
const [user, setUser] = useState({
  username: 'admin',
  role: 'super_admin'
}); // <- Use isso temporariamente

// PRODUÇÃO - DESCOMENTAR DEPOIS
// const [user, setUser] = useState(null);
```

### 2. Rodar localmente:
```bash
npm start
```
Acesse: http://localhost:3000

---

## 🚀 CONFIGURAÇÃO RÁPIDA (SEM LOGIN):

Para acessar o admin SEM autenticação (apenas para teste):

### Opção 1: Modo Demo
Edite `src/App.jsx` e mude a linha 58-60:
```javascript
// ANTES:
if (!user) {
  return <LoginScreen onLogin={setUser} />;
}

// DEPOIS (TEMPORÁRIO):
// if (!user) {
//   return <LoginScreen onLogin={setUser} />;
// }
```

### Opção 2: Auto-login
Edite `src/App.jsx` linha 26:
```javascript
// Adicione isso no useEffect:
setUser({ username: 'admin', role: 'super_admin' });
setLoading(false);
```

---

## 🔑 API KEY (Para criar shortlinks):

```
API Key: sk_live_bbb_2024_secure_key
```

### Exemplo de uso:
```bash
curl -X POST https://seu-worker.workers.dev/api/redirects \
  -H "Authorization: Bearer sk_live_bbb_2024_secure_key" \
  -H "Content-Type: application/json" \
  -d '{"dest": "https://amazon.com.br/...", "title": "Produto"}'
```

---

## 🗄️ BANCO DE DADOS (Supabase):

Quando configurar o Supabase, crie o usuário admin:

```sql
-- Execute no SQL Editor do Supabase:
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@bbbrasil.com',
  '$2b$10$K7L1OJ0TfPIwFb5HVYcXvuOHjZ5Xw.GqPqD5aNhwEc8vZkFBz5Xje', -- senha: admin123
  'super_admin'
);
```

---

## 🛠️ CLOUDFLARE WORKER:

Não precisa de login, mas use a API Key nas requisições:
```
Authorization: Bearer sk_live_bbb_2024_secure_key
```

---

## 🔒 SEGURANÇA - MUDE TUDO EM PRODUÇÃO:

1. **Mude a senha admin** no primeiro acesso
2. **Gere nova API Key** aleatória
3. **Configure 2FA** (autenticação dois fatores)
4. **Use HTTPS** sempre
5. **Rotacione keys** mensalmente

---

## 💡 ACESSO RÁPIDO PARA TESTE:

Se quiser testar AGORA sem configurar nada:

1. Abra `src/App.jsx`
2. Na linha 21, mude para:
```javascript
const [user, setUser] = useState({ username: 'teste', role: 'admin' });
```
3. Salve e rode:
```bash
npm start
```

**PRONTO! Acesso direto sem login!**

---

⚠️ **LEMBRE-SE**: Estas são credenciais de DESENVOLVIMENTO.
Em produção, configure autenticação real com JWT e senha forte!