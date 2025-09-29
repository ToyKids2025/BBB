# 🚀 BuscaBuscaBrasil Link Enhancer

Sistema inteligente de recuperação de comissões de afiliados com persistência máxima, tracking avançado e dashboard em tempo real.

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-orange)](https://workers.cloudflare.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Visão Geral

Este sistema resolve o problema de atribuição perdida em links de afiliados, especialmente em ambientes hostis como Instagram e WhatsApp. Recupera uma fatia significativa das comissões perdidas através de:

- 🍪 **Cookies first-party** de 30 dias
- 💾 **Múltipla persistência** (localStorage, IndexedDB)
- 🛒 **Add-to-cart automático** para Amazon
- 📱 **Deep links** para apps mobile
- ⚡ **Redirects < 50ms** via edge computing

## 🎯 Funcionalidades
- ✅ Shortlinks personalizados
- ✅ Tracking completo de clicks
- ✅ Dashboard em tempo real
- ✅ Detecção automática de plataforma
- ✅ Limpeza automática de URLs
- ✅ Validador de configuração
- ✅ Diagnóstico de saúde do sistema
- ✅ API RESTful
- ✅ Zero custo (free tier)

## 🛠️ Stack Tecnológica

- **Edge:** Cloudflare Workers
- **Storage:** Cloudflare KV (para redirects)
- **Database:** Firebase Firestore (para logs e dados do app)
- **Frontend:** React + Recharts
- **Auth:** Firebase Authentication
- **Deploy:** Vercel

## ⚡ Quick Start

Para rodar o projeto localmente:

```bash
# 1. Instale as dependências
npm install --legacy-peer-deps

# 2. Inicie todos os serviços
./start-all.sh
```

## 📚 Documentação Detalhada

- **[Guia de Configuração e Deploy (DEPLOYMENT.md)](./DEPLOYMENT.md)**: Passo a passo completo para configurar Firebase, Vercel e o ambiente de desenvolvimento.
- **[Funcionalidades Premium (README-PREMIUM.md)](./README-PREMIUM.md)**: Detalhes sobre os recursos avançados do sistema.
- **[Solução de Problemas (CONFIGURAR-FIREBASE-INDICES.md)](./CONFIGURAR-FIREBASE-INDICES.md)**: Como corrigir erros comuns do console relacionados ao Firebase.

## 📱 Plataformas Suportadas

- ✅ Amazon Brasil
- ✅ Mercado Livre
- ✅ Shopee
- ✅ Magazine Luiza (Magalu)

## 🔐 Segurança

- First-party cookies apenas
- LGPD compliant
- SSL/HTTPS obrigatório
- Rate limiting ativo
- Autenticação JWT

## 📈 ROI (Return on Investment)

```
Investimento: R$ 0 (free tier)
Comissões recuperadas: +15-30%
ROI: ∞ (infinito)
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 📞 Suporte

- 📧 Email: admin@bbbrasil.com
- 🐛 Issues: [GitHub Issues](https://github.com/SEU_USUARIO/bbb-link-enhancer/issues)
- 📚 Docs: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎉 Agradecimentos

- Cloudflare Workers
- Supabase
- Vercel
- React Team

---

**Desenvolvido com ❤️ para o Busca Busca Brasil**

*Recupere TODAS as suas comissões perdidas!*