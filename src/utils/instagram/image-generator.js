/**
 * 🎨 IMAGE GENERATOR - Gera imagens para posts do Instagram
 *
 * Cria imagens 1080x1080 (formato Instagram) com 3 templates:
 * - Moderno (Roxo): Gradiente roxo, elegante
 * - Minimalista (Branco): Clean, simples
 * - Colorido (Vermelho/Amarelo): Vibrante, chamativo
 *
 * @version 1.0.0
 * @author BuscaBusca Brasil
 */

/**
 * 🎨 TEMPLATE: MODERNO (Roxo)
 *
 * @param {Object} productData - Dados do produto
 * @param {string} productData.title - Título do produto
 * @param {number} productData.price - Preço atual
 * @param {number} productData.originalPrice - Preço original (opcional)
 * @param {number} productData.discount - Desconto percentual (opcional)
 * @param {string} productData.images - Array de URLs de imagens
 * @param {string} productData.platform - Plataforma (mercadolivre, amazon, etc)
 * @returns {Promise<string>} Data URL da imagem gerada (base64)
 */
export async function generateModernTemplate(productData) {
  console.log('🎨 [ImageGen] Gerando template MODERNO...');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // 1️⃣ FUNDO: Gradiente roxo (#667eea → #764ba2)
  const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // 2️⃣ IMAGEM DO PRODUTO (se disponível)
  if (productData.images && productData.images.length > 0) {
    try {
      const img = await loadImage(productData.images[0]);

      // Desenhar imagem centralizada com borda arredondada
      ctx.save();
      roundRect(ctx, 90, 90, 900, 600, 30);
      ctx.clip();

      // Calcular proporção para cobrir o retângulo
      const scale = Math.max(900 / img.width, 600 / img.height);
      const x = 90 + (900 - img.width * scale) / 2;
      const y = 90 + (600 - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

      // Sombra da imagem
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      roundRect(ctx, 90, 90, 900, 600, 30);
      ctx.stroke();
      ctx.shadowColor = 'transparent';

    } catch (error) {
      console.warn('⚠️ [ImageGen] Erro ao carregar imagem do produto:', error);
      // Continuar sem imagem
    }
  }

  // 3️⃣ TÍTULO (com fundo semi-transparente)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(90, 720, 900, 100);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'center';
  const titleLines = wrapText(ctx, productData.title, 850);
  const startY = 770 - (titleLines.length - 1) * 20;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 540, startY + i * 50);
  });

  // 4️⃣ PREÇO
  const priceY = 900;

  // Preço original (riscado)
  if (productData.originalPrice && productData.discount) {
    ctx.fillStyle = '#cccccc';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    const originalText = `R$ ${productData.originalPrice.toFixed(2)}`;
    ctx.fillText(originalText, 540, priceY);

    // Linha sobre o preço (riscado)
    const metrics = ctx.measureText(originalText);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(540 - metrics.width / 2, priceY - 10);
    ctx.lineTo(540 + metrics.width / 2, priceY - 10);
    ctx.stroke();
  }

  // Preço atual (destaque)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`R$ ${productData.price.toFixed(2)}`, 540, priceY + 70);

  // Badge de desconto
  if (productData.discount) {
    ctx.fillStyle = '#ff3b3b';
    roundRect(ctx, 780, priceY + 20, 180, 60, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`-${productData.discount}%`, 870, priceY + 62);
  }

  // 5️⃣ CALL TO ACTION
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  roundRect(ctx, 340, 1000, 400, 60, 30);
  ctx.fill();

  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('COMPRAR AGORA', 540, 1040);

  // 6️⃣ LOGO/MARCA (canto superior direito)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('BuscaBusca Brasil', 990, 50);

  console.log('✅ [ImageGen] Template MODERNO gerado');

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 🎨 TEMPLATE: MINIMALISTA (Branco)
 */
export async function generateMinimalistTemplate(productData) {
  console.log('🎨 [ImageGen] Gerando template MINIMALISTA...');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // 1️⃣ FUNDO: Branco puro
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1080, 1080);

  // 2️⃣ IMAGEM DO PRODUTO
  if (productData.images && productData.images.length > 0) {
    try {
      const img = await loadImage(productData.images[0]);

      // Desenhar imagem centralizada (sem borda)
      const scale = Math.min(800 / img.width, 600 / img.height);
      const x = (1080 - img.width * scale) / 2;
      const y = 100;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    } catch (error) {
      console.warn('⚠️ [ImageGen] Erro ao carregar imagem do produto:', error);
    }
  }

  // 3️⃣ LINHA DIVISÓRIA
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 720);
  ctx.lineTo(940, 720);
  ctx.stroke();

  // 4️⃣ TÍTULO
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  const titleLines = wrapText(ctx, productData.title, 800);
  const startY = 780;
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, 540, startY + i * 50);
  });

  // 5️⃣ PREÇO
  const priceY = 920;

  // Preço original
  if (productData.originalPrice && productData.discount) {
    ctx.fillStyle = '#999999';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    const originalText = `R$ ${productData.originalPrice.toFixed(2)}`;
    ctx.fillText(originalText, 540, priceY);

    // Linha
    const metrics = ctx.measureText(originalText);
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(540 - metrics.width / 2, priceY - 8);
    ctx.lineTo(540 + metrics.width / 2, priceY - 8);
    ctx.stroke();
  }

  // Preço atual
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`R$ ${productData.price.toFixed(2)}`, 540, priceY + 60);

  // 6️⃣ PLATAFORMA (rodapé)
  ctx.fillStyle = '#666666';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  const platformText = productData.platform === 'mercadolivre' ? 'Mercado Livre' :
                       productData.platform === 'amazon' ? 'Amazon' :
                       productData.platform.toUpperCase();
  ctx.fillText(`Disponível no ${platformText}`, 540, 1040);

  console.log('✅ [ImageGen] Template MINIMALISTA gerado');

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 🎨 TEMPLATE: COLORIDO (Vermelho/Amarelo)
 */
export async function generateColorfulTemplate(productData) {
  console.log('🎨 [ImageGen] Gerando template COLORIDO...');

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // 1️⃣ FUNDO: Gradiente vibrante (#ff6b6b → #feca57)
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(1, '#feca57');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // 2️⃣ CÍRCULOS DECORATIVOS
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(100, 100, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(980, 980, 250, 0, Math.PI * 2);
  ctx.fill();

  // 3️⃣ IMAGEM DO PRODUTO (com borda branca)
  if (productData.images && productData.images.length > 0) {
    try {
      const img = await loadImage(productData.images[0]);

      // Borda branca
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(115, 115, 850, 550);

      // Imagem
      ctx.save();
      const scale = Math.max(800 / img.width, 500 / img.height);
      const x = 140 + (800 - img.width * scale) / 2;
      const y = 140 + (500 - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

    } catch (error) {
      console.warn('⚠️ [ImageGen] Erro ao carregar imagem do produto:', error);
    }
  }

  // 4️⃣ BADGE "OFERTA" (canto superior esquerdo)
  ctx.save();
  ctx.translate(200, 100);
  ctx.rotate(-0.3);
  ctx.fillStyle = '#ff3838';
  ctx.fillRect(-80, -40, 160, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('OFERTA!', 0, 10);
  ctx.restore();

  // 5️⃣ TÍTULO (com fundo branco)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(90, 700, 900, 120);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  const titleLines = wrapText(ctx, productData.title, 850);
  const startY = 750;
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, 540, startY + i * 55);
  });

  // 6️⃣ PREÇO (fundo branco)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(90, 850, 900, 160);

  const priceY = 920;

  // Texto "POR APENAS"
  ctx.fillStyle = '#666666';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('POR APENAS', 540, priceY);

  // Preço
  ctx.fillStyle = '#ff3838';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`R$ ${productData.price.toFixed(2)}`, 540, priceY + 80);

  // Desconto
  if (productData.discount) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(780, priceY - 10, 190, 70);

    ctx.fillStyle = '#ff3838';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`-${productData.discount}%`, 875, priceY + 35);
  }

  console.log('✅ [ImageGen] Template COLORIDO gerado');

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * 🎨 FUNÇÃO PRINCIPAL - Gera imagem baseada no template escolhido
 *
 * @param {Object} productData - Dados do produto
 * @param {string} template - Nome do template ('moderno', 'minimalista', 'colorido')
 * @returns {Promise<string>} Data URL da imagem gerada
 *
 * @example
 * const imageUrl = await generatePostImage(productData, 'moderno');
 * // imageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
 */
export async function generatePostImage(productData, template = 'moderno') {
  console.log(`🎨 [ImageGen] Gerando imagem com template: ${template}`);

  try {
    switch (template.toLowerCase()) {
      case 'moderno':
        return await generateModernTemplate(productData);
      case 'minimalista':
        return await generateMinimalistTemplate(productData);
      case 'colorido':
        return await generateColorfulTemplate(productData);
      default:
        console.warn(`⚠️ [ImageGen] Template desconhecido: ${template}, usando 'moderno'`);
        return await generateModernTemplate(productData);
    }
  } catch (error) {
    console.error('❌ [ImageGen] Erro ao gerar imagem:', error);
    throw error;
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * 🔧 Carregar imagem de URL
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Para evitar erro CORS
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
    img.src = url;
  });
}

/**
 * 🔧 Desenhar retângulo com bordas arredondadas
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 🔧 Quebrar texto em múltiplas linhas
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;

    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  lines.push(currentLine);
  return lines;
}

/**
 * 🔧 Converter Data URL para Blob (para upload)
 */
export function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * 🔧 Fazer download da imagem gerada
 */
export function downloadImage(dataURL, filename = 'post-instagram.jpg') {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exportar funções
export default {
  generatePostImage,
  generateModernTemplate,
  generateMinimalistTemplate,
  generateColorfulTemplate,
  dataURLtoBlob,
  downloadImage
};
