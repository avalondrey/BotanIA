const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '..', 'public', 'logo.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  if (!fs.existsSync(inputSvg)) {
    console.error('logo.svg non trouvé');
    process.exit(1);
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(inputSvg);

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Generated ${outputFile}`);
  }

  // Génère aussi le badge.png (96x96 par exemple)
  const badgeFile = path.join(outputDir, 'badge.png');
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(badgeFile);
  console.log(`Generated ${badgeFile}`);
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
