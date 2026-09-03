import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.resolve('public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Standard Brand SVG Icon
// Featuring the ProSegurança Amber Shield with HardHat & Protective Star motif on deep slate background
const createSvgIcon = (size = 512, isMaskable = false) => {
  // For maskable icon, keep essential graphic within central 80% circle (safe zone with 10-15% padding)
  const scale = isMaskable ? 0.72 : 0.84;
  const offset = ((1 - scale) * size) / 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0b1120"/>
    </linearGradient>

    <!-- Shield Gold / Amber Gradient -->
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Inner Metallic Glow -->
    <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <!-- Shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#f59e0b" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Base App Background -->
  <rect width="${size}" height="${size}" rx="${isMaskable ? 0 : Math.round(size * 0.22)}" fill="url(#bgGrad)"/>
  
  <!-- Subtle Ambient Glow -->
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.35}" fill="#f59e0b" opacity="0.12" filter="blur(30px)"/>

  <!-- Centered Scaled Content -->
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- Outer Shield with Glow & Stroke -->
    <g filter="url(#shadow)">
      <!-- Main Shield Shape (viewBox 0 0 512 512) -->
      <path d="M256 36 L430 84 C430 260 360 395 256 476 C152 395 82 260 82 84 Z" 
            fill="url(#shieldGrad)" 
            stroke="#fef3c7" 
            stroke-width="10" 
            stroke-linejoin="round"/>
      
      <!-- Inner Shield Highlight Contour -->
      <path d="M256 56 L410 98 C410 248 348 368 256 442 C164 368 102 248 102 98 Z" 
            fill="url(#innerGlow)" />

      <!-- Inner Dark Core for High Contrast & Sophistication -->
      <path d="M256 82 L388 120 C388 238 335 342 256 408 C177 342 124 238 124 120 Z" 
            fill="#090d16" 
            stroke="#f59e0b" 
            stroke-width="6"/>
    </g>

    <!-- Hard Hat Icon & Safety Symbols inside Shield -->
    <!-- Safety Hard Hat (Yellow / Gold) -->
    <g transform="translate(256, 225) scale(8.5)" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Hard hat base rim -->
      <path d="M-12 5 C-12 3.5 -10 2.5 -7 2.5 L7 2.5 C10 2.5 12 3.5 12 5 C12 6.5 10 7.5 7 7.5 L-7 7.5 C-10 7.5 -12 6.5 -12 5 Z" fill="#f59e0b"/>
      <!-- Hat crown dome -->
      <path d="M-9 2.5 C-9 -6 9 -6 9 2.5" fill="#fbbf24"/>
      <!-- Hat top ridge/crest -->
      <path d="M-2 -6 L-2 2.5 M2 -6 L2 2.5" stroke="#d97706" stroke-width="1.8"/>
    </g>

    <!-- Star / Shield Check Star of Safety -->
    <g transform="translate(256, 142) scale(1.4)">
      <polygon points="0,-22 6,-6 22,-6 10,4 14,20 0,10 -14,20 -10,4 -22,-6 -6,-6" 
               fill="#fef3c7" 
               stroke="#f59e0b" 
               stroke-width="2"/>
    </g>

    <!-- Typography "PRO" "SEGURANÇA" subtle monogram band -->
    <text x="256" y="340" 
          text-anchor="middle" 
          font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
          font-size="34" 
          font-weight="900" 
          letter-spacing="5" 
          fill="#fef3c7">
      PROSEGURANÇA
    </text>
    <text x="256" y="370" 
          text-anchor="middle" 
          font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
          font-size="16" 
          font-weight="700" 
          letter-spacing="3" 
          fill="#94a3b8">
      EPIS • MOÇAMBIQUE
    </text>
  </g>
</svg>
`;
};

async function generateAllIcons() {
  console.log('Generating PWA icons for ProSegurança...');

  const svgStandard = createSvgIcon(512, false);
  const svgMaskable = createSvgIcon(512, true);

  // Save SVG
  fs.writeFileSync(path.join(outputDir, 'icon.svg'), svgStandard.trim());
  fs.writeFileSync(path.join(outputDir, 'favicon.svg'), svgStandard.trim());

  // 1. 512x512 standard
  await sharp(Buffer.from(svgStandard))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 2. 192x192 standard
  await sharp(Buffer.from(svgStandard))
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. 512x512 maskable (with safe zone margins)
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. Apple Touch Icon 180x180
  await sharp(Buffer.from(svgStandard))
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. Favicon 64x64 and 32x32
  await sharp(Buffer.from(svgStandard))
    .resize(64, 64)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('All PWA icons generated successfully!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
