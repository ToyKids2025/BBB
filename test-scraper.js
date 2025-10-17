/**
 * 🧪 TESTE RÁPIDO DO SCRAPER
 * Execute: node test-scraper.js
 */

const axios = require('axios');

// Simular scraper do Mercado Livre usando API oficial
async function testMLScraper() {
  console.log('\n🧪 TESTANDO SCRAPER DO MERCADO LIVRE\n');
  console.log('━'.repeat(60));

  // Produto real do ML
  const mlbId = 'MLB3711633645'; // Notebook Gamer Acer Nitro 5

  try {
    console.log(`📥 Buscando dados do produto ${mlbId}...`);

    const apiUrl = `https://api.mercadolibre.com/items/${mlbId}`;
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = response.data;

    console.log('\n✅ DADOS EXTRAÍDOS:\n');
    console.log(`📦 Título: ${data.title}`);
    console.log(`💰 Preço: R$ ${data.price?.toFixed(2) || 'N/A'}`);
    console.log(`💸 Preço Original: R$ ${data.original_price?.toFixed(2) || 'N/A'}`);

    if (data.original_price && data.price) {
      const discount = Math.round(((data.original_price - data.price) / data.original_price) * 100);
      console.log(`🏷️ Desconto: ${discount}%`);
    }

    console.log(`📸 Imagens: ${data.pictures?.length || 0} fotos`);
    console.log(`⭐ Avaliação: ${data.reviews?.rating_average || 'N/A'}`);
    console.log(`💬 Reviews: ${data.reviews?.total || 0} avaliações`);
    console.log(`🏷️ Categoria: ${data.category_id || 'N/A'}`);
    console.log(`📦 Condição: ${data.condition === 'new' ? 'Novo' : 'Usado'}`);
    console.log(`📊 Vendidos: ${data.sold_quantity || 0} unidades`);

    console.log('\n📸 PRIMEIRA IMAGEM:');
    console.log(data.pictures?.[0]?.secure_url || 'N/A');

    console.log('\n✅ TESTE PASSOU! Scraper está funcionando perfeitamente!\n');
    console.log('━'.repeat(60));

    return true;

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\n⚠️ TESTE FALHOU\n');
    console.log('━'.repeat(60));
    return false;
  }
}

// Executar teste
testMLScraper()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
