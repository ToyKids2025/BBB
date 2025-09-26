const fs = require('fs');
const path = require('path');

// Função para criar um ícone PNG básico
function createPNG(size) {
  // PNG header
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);

  // IHDR chunk
  const width = Buffer.alloc(4);
  width.writeUInt32BE(size);
  const height = Buffer.alloc(4);
  height.writeUInt32BE(size);

  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
    Buffer.from('IHDR'),
    width,
    height,
    Buffer.from([0x08, 0x06, 0x00, 0x00, 0x00]), // 8 bit, RGBA
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // CRC placeholder
  ]);

  // Simple IDAT with purple gradient background
  const pixelData = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Gradient from #667eea to #764ba2
      const ratio = (x + y) / (size * 2);
      const r = Math.floor(102 + (118 - 102) * ratio);
      const g = Math.floor(126 + (75 - 126) * ratio);
      const b = Math.floor(234 + (162 - 234) * ratio);

      // Center white circle
      const centerX = size / 2;
      const centerY = size / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const radius = size * 0.35;

      if (distance < radius) {
        // White circle
        pixelData.push(255, 255, 255, 255);
      } else {
        // Gradient background
        pixelData.push(r, g, b, 255);
      }
    }
  }

  // Compress data (simplified - just store uncompressed for now)
  const idat = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // Length placeholder
    Buffer.from('IDAT'),
    Buffer.from(pixelData),
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // CRC placeholder
  ]);

  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Criar ícones simples como placeholder
const sizes = [96, 152, 167, 180, 192, 512];

console.log('🎨 Gerando ícones BBB...\n');

sizes.forEach(size => {
  // Criar um SVG simples e converter para arquivo
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="white"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size*0.25}" font-weight="bold" fill="#667eea" text-anchor="middle" dominant-baseline="middle">BBB</text>
</svg>`;

  // Salvar como SVG temporário
  const svgPath = path.join(__dirname, 'public', `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);

  // Para criar PNG de verdade, precisaríamos de uma lib como sharp ou canvas
  // Por enquanto, vamos criar PNGs placeholder simples
  const pngPath = path.join(__dirname, 'public', `icon-${size}.png`);

  // Criar PNG simples (1x1 pixel roxo como placeholder)
  const simplePNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, 0x00, 0x00, 0x00, // 8 bit RGB
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFF, 0xFF,
    0x66, 0x7E, 0xEA, // RGB data (purple)
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);

  fs.writeFileSync(pngPath, simplePNG);
  console.log(`✅ Criado: icon-${size}.png`);
});

// Criar favicon.ico
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
const faviconData = Buffer.from([
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10,
  0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x68, 0x04,
  0x00, 0x00, 0x16, 0x00, 0x00, 0x00
]);

fs.writeFileSync(faviconPath, faviconData);
console.log('✅ Criado: favicon.ico');

console.log('\n✨ Todos os ícones foram gerados!');
console.log('📌 Para ícones com melhor qualidade, abra: http://localhost:3000/icon-generator.html');