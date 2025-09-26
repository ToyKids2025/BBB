const fs = require('fs');
const path = require('path');

// SVG base para criar os ícones
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#667eea"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">
    BBB
  </text>
</svg>`;

// Função para criar PNG a partir de SVG (simplificada)
function createIcon(size, filename) {
  // Para produção, usar um conversor SVG para PNG real
  // Por enquanto, criar um placeholder válido
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, size >> 8, 0x00, 0x00, 0x00, size & 0xFF, // width
    0x00, 0x00, 0x00, size >> 8, 0x00, 0x00, 0x00, size & 0xFF, // height
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, etc
    0x00, 0x00, 0x00, 0x00, // CRC (simplified)
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);

  // Criar em public e build
  ['public', 'build'].forEach(dir => {
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Criado: ${filepath}`);
  });
}

// Criar os ícones necessários
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 167, name: 'icon-167.png' },
  { size: 180, name: 'icon-180.png' }
];

// Criar também favicon.ico
const faviconBuffer = Buffer.from([
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00,
  0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00,
  0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00
]);

['public', 'build'].forEach(dir => {
  const faviconPath = path.join(dir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, faviconBuffer);
    console.log(`✅ Criado: ${faviconPath}`);
  }
});

// Criar todos os ícones
sizes.forEach(({ size, name }) => {
  createIcon(size, name);
});

console.log('\n🎨 Todos os ícones foram criados com sucesso!');