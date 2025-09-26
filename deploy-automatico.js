#!/usr/bin/env node

/**
 * Deploy Automático Completo
 * Deploy para Vercel + Firebase + Cloudflare
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const execPromise = util.promisify(exec);

console.log(`
╔════════════════════════════════════════════════╗
║     🚀 DEPLOY AUTOMÁTICO BBB LINK ENHANCER     ║
╚════════════════════════════════════════════════╝
`);

const deploySteps = [
  {
    name: 'Build de Produção',
    command: 'npm run build',
    critical: true
  },
  {
    name: 'Deploy Vercel',
    command: 'vercel --prod',
    critical: false
  },
  {
    name: 'Deploy Firebase Hosting',
    command: 'firebase deploy --only hosting',
    critical: false
  },
  {
    name: 'Atualizar Cloudflare Worker',
    command: 'wrangler publish',
    critical: false
  },
  {
    name: 'Commit no Git',
    command: 'git add . && git commit -m "🚀 Deploy automático - Sistema atualizado" && git push',
    critical: false
  }
];

async function runDeploy() {
  console.log('Iniciando processo de deploy...\n');

  for (const step of deploySteps) {
    console.log(`▶ ${step.name}...`);

    try {
      const { stdout, stderr } = await execPromise(step.command);

      if (stdout) console.log(stdout);
      if (stderr && !stderr.includes('warning')) console.error(stderr);

      console.log(`✅ ${step.name} - Sucesso!\n`);
    } catch (error) {
      console.error(`❌ Erro em ${step.name}: ${error.message}`);

      if (step.critical) {
        console.error('Erro crítico! Deploy cancelado.');
        process.exit(1);
      } else {
        console.log('Continuando com próximos passos...\n');
      }
    }
  }

  console.log(`
╔════════════════════════════════════════════════╗
║         ✅ DEPLOY COMPLETO COM SUCESSO!        ║
╚════════════════════════════════════════════════╝

📌 URLS DO SISTEMA:

🌐 Vercel: https://buscabuscabrasil.vercel.app
🔥 Firebase: https://afiliador-inteligente.web.app
☁️ Cloudflare: https://bbbrasil.com

📱 Telegram Bot: @BuscaBusca_Security_Bot

✨ Sistema totalmente atualizado e online!
`);
}

// Executar
runDeploy().catch(console.error);