import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.resolve('public', name));
    console.log(`Generated public/${name}`);
  }

  // Maskable icon with 10% padding safe zone
  const innerSize = Math.round(512 * 0.8);
  const padding = Math.round((512 - innerSize) / 2);
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();
  
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 13, b: 22, alpha: 1 }
    }
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
