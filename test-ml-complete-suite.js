/**
 * 🧪 SUITE COMPLETA DE TESTES - MERCADO LIVRE
 *
 * Testa TODOS os cenários possíveis para garantir que:
 * 1. Tags wa* são sempre preservadas (não perde comissão)
 * 2. URLs /social/ são corrigidas (& → ?)
 * 3. forceInApp é removido corretamente
 * 4. URLs malformadas são corrigidas
 */

console.log('🧪 ========================================');
console.log('🧪 SUITE COMPLETA DE TESTES - MERCADO LIVRE');
console.log('🧪 ========================================\n');

// ============================================
// FUNÇÕES TESTADAS (reproduzem lógica real)
// ============================================

const AFFILIATE_TAGS = {
  ML_WORD: 'wa20250726131129',
  ML_TOOL: '88344921'
};

function removeForceInApp(url) {
  if (!url.includes('forceInApp')) return url;

  // CASO 1: forceInApp logo após ?
  url = url.replace(/\?forceInApp=[^&]*&/gi, '?');

  // CASO 2: forceInApp único parâmetro
  url = url.replace(/\?forceInApp=[^&]*$/gi, '');

  // CASO 3: forceInApp no meio/fim
  url = url.replace(/&forceInApp=[^&]*/gi, '');

  // Limpar & ou ? órfãos
  url = url.replace(/&&+/g, '&');
  url = url.replace(/\?&/g, '?');
  url = url.replace(/&$/g, '');

  return url;
}

function fixMalformedSocialUrl(url) {
  // Corrigir /social/ID&param → /social/ID?param
  if (url.match(/\/social\/[^?]+&/)) {
    url = url.replace(/\/social\/([^?&]+)&/, '/social/$1?');
  }
  return url;
}

function preserveWaTags(url) {
  // Verificar se tem tags wa*
  const mattWordMatch = url.match(/matt_word=([^&]*)/i);
  const currentWord = mattWordMatch ? mattWordMatch[1].toLowerCase() : '';

  if (currentWord.startsWith('wa')) {
    console.log('   ✅ Tags wa* detectadas, preservando comissão');

    // Remover apenas forceInApp
    url = removeForceInApp(url);

    // Corrigir malformação
    url = fixMalformedSocialUrl(url);

    return { preserved: true, url };
  }

  // Sem tags wa*, mas ainda aplicar limpezas básicas
  console.log('   ℹ️ Sem tags wa*, aplicando limpezas básicas');

  // Remover forceInApp mesmo sem tags wa*
  url = removeForceInApp(url);

  // Corrigir malformações
  url = fixMalformedSocialUrl(url);

  // Limpar & ou ? órfãos
  url = url.replace(/&&+/g, '&');
  url = url.replace(/\?&/g, '?');
  url = url.replace(/&$/g, '');

  return { preserved: false, url };
}

// ============================================
// CASOS DE TESTE
// ============================================

const testCases = [
  {
    category: '🔥 CASOS CRÍTICOS (do usuário)',
    tests: [
      {
        name: 'URL real do usuário - /social/ com tags wa* e forceInApp',
        input: 'https://www.mercadolivre.com.br/social/wa20250726131129?matt_word=wa20250726131129&matt_tool=88344921&forceInApp=true&ref=BLfv9re2Ce3IHOCRy4UG4qLQv%2BSOYYLae7KgXRAiUimgJkdno1Fl8FFMzefGf7NzfIm1olr%2FifeGjSXKHfyUuWXQC6bi%2FsvbZpcRTAunalDzj5tlqfQ31eSWpuwfvdDYogV06Fswii3bbWEWMryswDwMkCFuYG3eIK%2BvamVGv6fmYraVnz04HSASnpJ48K937aez%2FQ%3D%3D',
        expected: 'https://www.mercadolivre.com.br/social/wa20250726131129?matt_word=wa20250726131129&matt_tool=88344921&ref=BLfv9re2Ce3IHOCRy4UG4qLQv%2BSOYYLae7KgXRAiUimgJkdno1Fl8FFMzefGf7NzfIm1olr%2FifeGjSXKHfyUuWXQC6bi%2FsvbZpcRTAunalDzj5tlqfQ31eSWpuwfvdDYogV06Fswii3bbWEWMryswDwMkCFuYG3eIK%2BvamVGv6fmYraVnz04HSASnpJ48K937aez%2FQ%3D%3D',
        mustPreserve: true
      },
      {
        name: 'URL malformada (& no lugar de ?) - deve corrigir',
        input: 'https://www.mercadolivre.com.br/social/wa20250726131129&ref=XXX&matt_word=wa20250726131129&matt_tool=88344921',
        expected: 'https://www.mercadolivre.com.br/social/wa20250726131129?ref=XXX&matt_word=wa20250726131129&matt_tool=88344921',
        mustPreserve: true
      },
    ]
  },
  {
    category: '📦 CASOS COM forceInApp',
    tests: [
      {
        name: 'forceInApp no início (deve preservar tags wa*)',
        input: 'https://www.mercadolivre.com.br/social/wa123?forceInApp=true&matt_word=wa123&matt_tool=88344921',
        expected: 'https://www.mercadolivre.com.br/social/wa123?matt_word=wa123&matt_tool=88344921',
        mustPreserve: true
      },
      {
        name: 'forceInApp no meio (deve preservar tags wa*)',
        input: 'https://www.mercadolivre.com.br/social/wa456?matt_word=wa456&forceInApp=true&matt_tool=88344921',
        expected: 'https://www.mercadolivre.com.br/social/wa456?matt_word=wa456&matt_tool=88344921',
        mustPreserve: true
      },
      {
        name: 'forceInApp no final (deve preservar tags wa*)',
        input: 'https://www.mercadolivre.com.br/social/wa789?matt_word=wa789&matt_tool=88344921&forceInApp=false',
        expected: 'https://www.mercadolivre.com.br/social/wa789?matt_word=wa789&matt_tool=88344921',
        mustPreserve: true
      },
      {
        name: 'Apenas forceInApp (sem outras tags wa*)',
        input: 'https://www.mercadolivre.com.br/MLB-123?forceInApp=true',
        expected: 'https://www.mercadolivre.com.br/MLB-123',
        mustPreserve: false
      },
    ]
  },
  {
    category: '🔗 CASOS /social/ COM TAGS wa*',
    tests: [
      {
        name: '/social/ com tags wa* (deve preservar 100%)',
        input: 'https://www.mercadolivre.com.br/social/wa111?matt_word=wa111&matt_tool=999',
        expected: 'https://www.mercadolivre.com.br/social/wa111?matt_word=wa111&matt_tool=999',
        mustPreserve: true
      },
      {
        name: '/social/ com tags wa* + ref (deve preservar)',
        input: 'https://www.mercadolivre.com.br/social/wa222?matt_word=wa222&matt_tool=999&ref=XXX',
        expected: 'https://www.mercadolivre.com.br/social/wa222?matt_word=wa222&matt_tool=999&ref=XXX',
        mustPreserve: true
      },
      {
        name: '/social/ com tags wa* case insensitive (deve preservar)',
        input: 'https://www.mercadolivre.com.br/social/WA333?matt_word=WA333&matt_tool=999',
        expected: 'https://www.mercadolivre.com.br/social/WA333?matt_word=WA333&matt_tool=999',
        mustPreserve: true
      },
    ]
  },
  {
    category: '⚠️ CASOS MALFORMADOS',
    tests: [
      {
        name: 'URL com múltiplos &&&',
        input: 'https://www.mercadolivre.com.br/MLB-123?a=1&&&b=2',
        expected: 'https://www.mercadolivre.com.br/MLB-123?a=1&b=2',
        mustPreserve: false
      },
      {
        name: 'URL com ?& órfão',
        input: 'https://www.mercadolivre.com.br/MLB-456?&a=1&b=2',
        expected: 'https://www.mercadolivre.com.br/MLB-456?a=1&b=2',
        mustPreserve: false
      },
      {
        name: 'URL com & no final',
        input: 'https://www.mercadolivre.com.br/MLB-789?a=1&b=2&',
        expected: 'https://www.mercadolivre.com.br/MLB-789?a=1&b=2',
        mustPreserve: false
      },
    ]
  },
  {
    category: '✅ CASOS QUE NÃO DEVEM SER MODIFICADOS',
    tests: [
      {
        name: 'URL limpa sem forceInApp (não modificar)',
        input: 'https://www.mercadolivre.com.br/MLB-999?matt_word=wa999&matt_tool=88344921',
        expected: 'https://www.mercadolivre.com.br/MLB-999?matt_word=wa999&matt_tool=88344921',
        mustPreserve: true
      },
      {
        name: 'URL /p/ com tags wa* (não modificar)',
        input: 'https://www.mercadolivre.com.br/p/MLB-888?matt_word=wa888&matt_tool=777',
        expected: 'https://www.mercadolivre.com.br/p/MLB-888?matt_word=wa888&matt_tool=777',
        mustPreserve: true
      },
    ]
  },
];

// ============================================
// EXECUTAR TESTES
// ============================================

let totalTests = 0;
let passed = 0;
let failed = 0;
const failures = [];

testCases.forEach(category => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(category.category);
  console.log('='.repeat(60));

  category.tests.forEach((test, index) => {
    totalTests++;
    console.log(`\n📝 Teste ${index + 1}/${category.tests.length}: ${test.name}`);

    // Processar URL
    const result = preserveWaTags(test.input);
    let finalUrl = result.url;

    // Validar
    const isPass = finalUrl === test.expected;
    const preservedCorrectly = result.preserved === test.mustPreserve;

    if (isPass && preservedCorrectly) {
      passed++;
      console.log('   ✅ PASSOU');

      if (result.preserved) {
        console.log('   💰 Comissão PRESERVADA (tags wa*)');
      }
    } else {
      failed++;
      console.log('   ❌ FALHOU');

      if (!isPass) {
        console.log(`   ⚠️ URL incorreta:`);
        console.log(`      Esperado: ${test.expected.substring(0, 100)}...`);
        console.log(`      Obtido:   ${finalUrl.substring(0, 100)}...`);
      }

      if (!preservedCorrectly) {
        console.log(`   ⚠️ Preservação incorreta:`);
        console.log(`      Esperado preservar: ${test.mustPreserve}`);
        console.log(`      Preservou: ${result.preserved}`);
      }

      failures.push({
        test: test.name,
        expected: test.expected,
        got: finalUrl,
        mustPreserve: test.mustPreserve,
        preserved: result.preserved
      });
    }
  });
});

// ============================================
// RELATÓRIO FINAL
// ============================================

console.log('\n\n' + '='.repeat(60));
console.log('📊 RELATÓRIO FINAL');
console.log('='.repeat(60));
console.log(`✅ Passaram: ${passed}/${totalTests}`);
console.log(`❌ Falharam: ${failed}/${totalTests}`);
console.log(`📈 Taxa de sucesso: ${((passed / totalTests) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log('\n❌ TESTES QUE FALHARAM:');
  failures.forEach((f, i) => {
    console.log(`\n${i + 1}. ${f.test}`);
    console.log(`   Esperado: ${f.expected.substring(0, 80)}...`);
    console.log(`   Obtido:   ${f.got.substring(0, 80)}...`);
  });
}

console.log('\n' + '='.repeat(60));

if (failed === 0) {
  console.log('🎉 TODOS OS TESTES PASSARAM!');
  console.log('✅ Comissões estão 100% protegidas!');
  console.log('✅ URLs /social/ funcionando corretamente!');
  process.exit(0);
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!');
  console.log('⚠️ REVISAR CÓDIGO ANTES DE DEPLOY!');
  process.exit(1);
}
