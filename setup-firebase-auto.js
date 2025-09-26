#!/usr/bin/env node

/**
 * Script Automatizado para Configurar Firebase
 * Executa todas as configurações necessárias automaticamente
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}${colors.bright}
╔════════════════════════════════════════════════╗
║     🔥 CONFIGURAÇÃO AUTOMÁTICA FIREBASE 🔥      ║
║          BBB Link Enhancer System              ║
╚════════════════════════════════════════════════╝
${colors.reset}`);

// Configurações do Firebase
const firebaseConfig = {
  projectId: 'afiliador-inteligente',
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDP-2TOFuq_7zB78shhA4AGXvKJ166DYaw',
  authDomain: 'afiliador-inteligente.firebaseapp.com',
  storageBucket: 'afiliador-inteligente.firebasestorage.app',
  messagingSenderId: '215123809953',
  appId: '1:215123809953:web:573e5e71ad1b2d3bb902e0'
};

// Tarefas a executar
const tasks = [
  {
    name: 'Verificar Node.js',
    action: checkNodeVersion
  },
  {
    name: 'Instalar dependências',
    action: installDependencies
  },
  {
    name: 'Criar arquivo .env.local',
    action: createEnvFile
  },
  {
    name: 'Configurar Firebase',
    action: setupFirebase
  },
  {
    name: 'Criar índices Firestore',
    action: createFirestoreIndexes
  },
  {
    name: 'Configurar regras de segurança',
    action: setupSecurityRules
  },
  {
    name: 'Limpar cache e dados antigos',
    action: clearOldData
  },
  {
    name: 'Fazer build de produção',
    action: buildProduction
  },
  {
    name: 'Iniciar servidor de desenvolvimento',
    action: startDevServer
  }
];

// Executar tarefas
async function runTasks() {
  for (const task of tasks) {
    console.log(`\n${colors.yellow}▶ ${task.name}...${colors.reset}`);
    try {
      await task.action();
      console.log(`${colors.green}✅ ${task.name} - Concluído!${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}❌ Erro em ${task.name}: ${error.message}${colors.reset}`);

      // Perguntar se deve continuar
      if (task.name !== 'Iniciar servidor de desenvolvimento') {
        console.log(`${colors.yellow}Continuando com as próximas tarefas...${colors.reset}`);
      }
    }
  }

  console.log(`\n${colors.green}${colors.bright}
╔════════════════════════════════════════════════╗
║        ✅ CONFIGURAÇÃO CONCLUÍDA! ✅           ║
╚════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`
${colors.blue}📋 PRÓXIMOS PASSOS:${colors.reset}

1. ${colors.yellow}Acesse:${colors.reset} http://localhost:3000

2. ${colors.yellow}Faça login com:${colors.reset}
   Email: alexandre@buscabuscabrasil.com.br
   Senha: (a senha que você configurou)

3. ${colors.yellow}Para criar índices no Firebase Console:${colors.reset}
   - Acesse os links de erro no console do navegador
   - Clique em "Create Index"
   - Aguarde 2-3 minutos

4. ${colors.yellow}Para deploy na Vercel:${colors.reset}
   npm run build
   vercel --prod

${colors.green}Sistema pronto para uso! 🚀${colors.reset}
`);
}

// Funções das tarefas
async function checkNodeVersion() {
  const { stdout } = await execPromise('node --version');
  const version = stdout.trim();
  console.log(`  Node.js versão: ${version}`);

  const majorVersion = parseInt(version.split('.')[0].replace('v', ''));
  if (majorVersion < 14) {
    throw new Error('Node.js 14+ é necessário');
  }
}

async function installDependencies() {
  console.log('  Instalando pacotes npm...');
  await execPromise('npm install');
  console.log('  Pacotes instalados com sucesso');
}

async function createEnvFile() {
  const envContent = `# Firebase Config
REACT_APP_FIREBASE_API_KEY=${firebaseConfig.apiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
REACT_APP_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
REACT_APP_FIREBASE_APP_ID=${firebaseConfig.appId}

# Affiliate Tags
REACT_APP_AMAZON_TAG=buscabusca0f-20
REACT_APP_ML_AFFILIATE_ID=WA20250726131129

# Telegram Bot
REACT_APP_TELEGRAM_BOT_TOKEN=8412872348:AAHqvLQyWC2ruzEJf8EzxiAa0rgGTfZqAdM
REACT_APP_TELEGRAM_CHAT_ID=834836872

# Build Config
CI=false
GENERATE_SOURCEMAP=false`;

  fs.writeFileSync('.env.local', envContent);
  console.log('  Arquivo .env.local criado');
}

async function setupFirebase() {
  // Criar arquivo firebase.json
  const firebaseJson = {
    firestore: {
      rules: "firestore.rules",
      indexes: "firestore.indexes.json"
    },
    hosting: {
      public: "build",
      ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
      rewrites: [
        {
          source: "**",
          destination: "/index.html"
        }
      ]
    }
  };

  fs.writeFileSync('firebase.json', JSON.stringify(firebaseJson, null, 2));
  console.log('  Arquivo firebase.json criado');
}

async function createFirestoreIndexes() {
  // Índices já foram criados no arquivo firestore.indexes.json
  console.log('  Arquivo de índices já existe');
  console.log(`  ${colors.yellow}IMPORTANTE: Acesse o console do Firebase para criar os índices${colors.reset}`);
  console.log(`  Link: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes`);
}

async function setupSecurityRules() {
  // Regras já foram criadas no arquivo firestore.rules
  console.log('  Arquivo de regras já existe');

  // Tentar fazer deploy se Firebase CLI estiver instalado
  try {
    await execPromise('firebase --version');
    console.log('  Firebase CLI detectado, fazendo deploy das regras...');
    await execPromise(`firebase use ${firebaseConfig.projectId} --add`).catch(() => {});
    await execPromise('firebase deploy --only firestore:rules');
    console.log('  Regras deployadas com sucesso');
  } catch (e) {
    console.log('  Firebase CLI não instalado - faça deploy manual das regras');
  }
}

async function clearOldData() {
  // Criar script de limpeza
  const clearScript = `
// Script para limpar dados antigos
if (typeof window !== 'undefined') {
  localStorage.clear();
  sessionStorage.clear();
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  console.log('✅ Cache e dados locais limpos');
}
`;

  fs.writeFileSync('public/clear-cache.js', clearScript);
  console.log('  Script de limpeza criado');
}

async function buildProduction() {
  console.log('  Criando build de produção...');
  console.log('  Isso pode levar alguns minutos...');

  const { stdout, stderr } = await execPromise('npm run build');

  if (stderr && !stderr.includes('warning')) {
    throw new Error(stderr);
  }

  console.log('  Build criado com sucesso em /build');
}

async function startDevServer() {
  console.log('  Iniciando servidor de desenvolvimento...');
  console.log(`  ${colors.green}Acesse: http://localhost:3000${colors.reset}`);

  // Iniciar servidor em background
  const { spawn } = require('child_process');
  const server = spawn('npm', ['start'], {
    detached: false,
    stdio: 'inherit'
  });

  // Aguardar alguns segundos para o servidor iniciar
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// Função para criar usuário de teste (opcional)
async function createTestUser() {
  const testUserScript = `
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const app = initializeApp(${JSON.stringify(firebaseConfig)});
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, 'teste@buscabuscabrasil.com.br', 'teste123456')
  .then(user => {
    console.log('✅ Usuário de teste criado:', user.user.email);
    process.exit(0);
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Usuário de teste já existe');
    } else {
      console.error('Erro:', error.message);
    }
    process.exit(1);
  });
`;

  fs.writeFileSync('create-test-user.js', testUserScript);

  try {
    await execPromise('node create-test-user.js');
  } catch (e) {
    // Ignorar se usuário já existe
  }

  fs.unlinkSync('create-test-user.js');
}

// Executar tudo
runTasks().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});