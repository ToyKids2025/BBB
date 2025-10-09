#!/usr/bin/env node
/**
 * 🔧 FIX: Adicionar domínios autorizados no Firebase Auth
 *
 * Este script adiciona automaticamente os domínios necessários
 * para evitar o warning de "domain not authorized"
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

console.log('🔧 Configurando domínios autorizados no Firebase Auth...');
console.log(`📦 Projeto: ${PROJECT_ID}`);
console.log('');

// NOTA: Este script requer configuração manual no Firebase Console
// porque a API REST não permite adicionar authorized domains sem token OAuth2
console.log('❌ SOLUÇÃO AUTOMÁTICA NÃO DISPONÍVEL');
console.log('');
console.log('✅ SOLUÇÃO MANUAL (2 minutos):');
console.log('');
console.log('1. Acesse: https://console.firebase.google.com/project/' + PROJECT_ID + '/authentication/settings');
console.log('2. Role até "Authorized domains"');
console.log('3. Clique em "Add domain" e adicione:');
console.log('   - www.buscabuscabrasil.com.br');
console.log('   - buscabuscabrasil.com.br');
console.log('4. Salve');
console.log('');
console.log('🎯 ALTERNATIVA RÁPIDA (recomendado):');
console.log('');
console.log('Se você não usa Google Sign-in, desabilite o provider:');
console.log('1. Acesse: https://console.firebase.google.com/project/' + PROJECT_ID + '/authentication/providers');
console.log('2. Clique em "Google" e desabilite');
console.log('3. Isso elimina o warning instantaneamente');
console.log('');
console.log('💡 Seu sistema usa apenas Email/Password, então desabilitar Google é seguro!');
