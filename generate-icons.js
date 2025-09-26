// Script para gerar placeholders de ícones
const fs = require('fs');
const path = require('path');

// SVG base para ícones
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1a1a1a"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size/4}" fill="#667eea" text-anchor="middle" dy=".3em">BBB</text>
</svg>
`;

// Criar diretório public se não existir
const publicDir = path.join(__dirname, 'public');

// Gerar ícones
const sizes = [96, 152, 167, 180, 192, 512];
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(publicDir, `icon-${size}.png`);
  // Como não temos conversão SVG->PNG, vamos criar placeholders
  console.log(`Placeholder criado para: icon-${size}.png`);
});

console.log('Ícones placeholder criados. Para produção, substitua por ícones PNG reais.');