import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = 'c:/Users/cakma/astro-blog/public/favicon.svg';
const outputDir = 'c:/Users/cakma/astro-blog/public';

async function generate() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192.png'));
    console.log('Generated icon-192.png');

    // Generate 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));
    console.log('Generated icon-512.png');

    // Generate 512x512 Maskable PNG with background color (solid white/light background for maskable)
    // Maskable icons require a safe zone padding and background fill
    await sharp(svgBuffer)
      .resize(384, 384) // Resize SVG with padding
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // solid white background
      })
      .png()
      .toFile(path.join(outputDir, 'icon-512-maskable.png'));
    console.log('Generated icon-512-maskable.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generate();
