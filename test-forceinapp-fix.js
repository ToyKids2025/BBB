/**
 * 🧪 TESTE UNITÁRIO - FIX forceInApp
 * 
 * Testa se a remoção do forceInApp preserva o "?" inicial
 */

console.log('🧪 INICIANDO TESTES - Fix forceInApp\n');

// Função de teste (reproduz a lógica corrigida)
function removeForceInApp(url) {
  if (!url.includes('forceInApp')) return url;

  // CASO 1: forceInApp logo após ? → ?forceInApp=X&outros → ?outros
  url = url.replace(/\?forceInApp=[^&]*&/gi, '?');
  
  // CASO 2: forceInApp único parâmetro → ?forceInApp=X → (vazio)
  url = url.replace(/\?forceInApp=[^&]*$/gi, '');
  
  // CASO 3: forceInApp no meio/fim → &forceInApp=X
  url = url.replace(/&forceInApp=[^&]*/gi, '');

  // Limpar & ou ? órfãos que possam ter sobrado
  url = url.replace(/&&+/g, '&');
  url = url.replace(/\?&/g, '?');
  url = url.replace(/&$/g, '');

  return url;
}

// Array de testes
const tests = [
  {
    name: 'CASO 1: forceInApp no início (com outros parâmetros)',
    input: 'https://example.com/social/wa123?forceInApp=true&ref=XXX&matt_word=wa123',
    expected: 'https://example.com/social/wa123?ref=XXX&matt_word=wa123',
  },
  {
    name: 'CASO 2: forceInApp no meio',
    input: 'https://example.com/social/wa123?matt_word=wa123&forceInApp=true&ref=XXX',
    expected: 'https://example.com/social/wa123?matt_word=wa123&ref=XXX',
  },
  {
    name: 'CASO 3: forceInApp no final',
    input: 'https://example.com/social/wa123?matt_word=wa123&ref=XXX&forceInApp=true',
    expected: 'https://example.com/social/wa123?matt_word=wa123&ref=XXX',
  },
  {
    name: 'CASO 4: forceInApp único parâmetro',
    input: 'https://example.com/social/wa123?forceInApp=true',
    expected: 'https://example.com/social/wa123',
  },
  {
    name: 'CASO 5: URL real do usuário (problema original)',
    input: 'https://www.mercadolivre.com.br/social/wa20250726131129?matt_word=wa20250726131129&matt_tool=88344921&forceInApp=true&ref=BLfv9re2Ce3IHOCRy4UG4qLQv%2BSOYYLae7KgXRAiUimgJkdno1Fl8FFMzefGf7NzfIm1olr%2FifeGjSXKHfyUuWXQC6bi%2FsvbZpcRTAunalDzj5tlqfQ31eSWpuwfvdDYogV06Fswii3bbWEWMryswDwMkCFuYG3eIK%2BvamVGv6fmYraVnz04HSASnpJ48K937aez%2FQ%3D%3D',
    expected: 'https://www.mercadolivre.com.br/social/wa20250726131129?matt_word=wa20250726131129&matt_tool=88344921&ref=BLfv9re2Ce3IHOCRy4UG4qLQv%2BSOYYLae7KgXRAiUimgJkdno1Fl8FFMzefGf7NzfIm1olr%2FifeGjSXKHfyUuWXQC6bi%2FsvbZpcRTAunalDzj5tlqfQ31eSWpuwfvdDYogV06Fswii3bbWEWMryswDwMkCFuYG3eIK%2BvamVGv6fmYraVnz04HSASnpJ48K937aez%2FQ%3D%3D',
  },
  {
    name: 'CASO 6: Sem forceInApp (não deve modificar)',
    input: 'https://example.com/social/wa123?matt_word=wa123&ref=XXX',
    expected: 'https://example.com/social/wa123?matt_word=wa123&ref=XXX',
  },
  {
    name: 'CASO 7: forceInApp=false',
    input: 'https://example.com/social/wa123?forceInApp=false&matt_word=wa123',
    expected: 'https://example.com/social/wa123?matt_word=wa123',
  },
];

// Executar testes
let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = removeForceInApp(test.input);
  const isPass = result === test.expected;

  if (isPass) {
    passed++;
    console.log(`✅ TESTE ${index + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`❌ TESTE ${index + 1}: ${test.name}`);
    console.log(`   Input:    ${test.input.substring(0, 100)}...`);
    console.log(`   Expected: ${test.expected.substring(0, 100)}...`);
    console.log(`   Got:      ${result.substring(0, 100)}...`);
  }
  console.log('');
});

// Resumo
console.log('━'.repeat(60));
console.log(`📊 RESULTADO: ${passed} PASSOU | ${failed} FALHOU`);
console.log('━'.repeat(60));

if (failed === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM!');
  process.exit(0);
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!');
  process.exit(1);
}
