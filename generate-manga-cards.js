/**
 * Generate a manga/cel-shaded style card
 * Style: Thick black outlines, cross-hatching shadows, screenone dots
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const CARDS_DIR = path.join(__dirname, 'public', 'cards');

// Ensure directory exists
if (!fs.existsSync(CARDS_DIR)) {
  fs.mkdirSync(CARDS_DIR, { recursive: true });
}

function drawMangaCard(ctx, width, height, options) {
  const { bgColor, emoji, text, subtext, style = 'manga' } = options;

  // 1. BACKGROUND with gradient (subtle)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, adjustColor(bgColor, -20));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. SCREENONE DOTS pattern (texture)
  drawScreenone(ctx, width, height, bgColor);

  // 3. BORDER - thick black outline (manga style)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  // 4. INNER BORDER - thinner
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333333';
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 5. EMOJI/ILLUSTRATION AREA (top 60%)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(20, 20, width - 40, height * 0.55, 8);
  ctx.clip();

  // Light gradient for illustration area
  const illuGrad = ctx.createLinearGradient(0, 20, 0, height * 0.75);
  illuGrad.addColorStop(0, '#FFFFFF');
  illuGrad.addColorStop(1, adjustColor(bgColor, 30));
  ctx.fillStyle = illuGrad;
  ctx.fillRect(20, 20, width - 40, height * 0.55);

  // Draw emoji large in center
  ctx.font = '100px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, width / 2, height * 0.32);

  // Cross-hatching shadow under emoji
  drawCrossHatching(ctx, width / 2 - 60, height * 0.5, 120, 30);

  ctx.restore();

  // 6. TEXT AREA (bottom 40%)
  const textY = height * 0.72;

  // NAME - bold with shadow effect
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow (offset black)
  ctx.fillStyle = '#000000';
  ctx.fillText(text, width / 2 + 2, textY + 2);

  // Main text
  ctx.fillStyle = '#000000';
  ctx.fillText(text, width / 2, textY);

  // SUBTEXT
  if (subtext) {
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#444444';
    ctx.fillText(subtext, width / 2, textY + 30);
  }

  // 7. CORNER DECORATIONS (manga style)
  drawCornerDecorations(ctx, width, height);

  // 8. SPEECH BUBBLE or EFFECT (optional manga element)
  // Small sparkle effects
  drawSparkle(ctx, 35, 35, 8);
  drawSparkle(ctx, width - 35, 35, 6);
  drawSparkle(ctx, 35, height - 35, 6);
  drawSparkle(ctx, width - 35, height - 35, 8);
}

function drawScreenone(ctx, w, h, baseColor) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#000000';
  const spacing = 12;
  for (let x = 0; x < w; x += spacing) {
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCrossHatching(ctx, x, y, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  const spacing = 6;
  // Diagonal lines one way
  for (let i = -h; i < w; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  // Diagonal lines other way
  for (let i = -h; i < w; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i + h, y);
    ctx.lineTo(x + i, y + h);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCornerDecorations(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  const size = 15;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(15, 25);
  ctx.lineTo(15, 15);
  ctx.lineTo(25, 15);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - 25, 15);
  ctx.lineTo(w - 15, 15);
  ctx.lineTo(w - 15, 25);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(15, h - 25);
  ctx.lineTo(15, h - 15);
  ctx.lineTo(25, h - 15);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - 25, h - 15);
  ctx.lineTo(w - 15, h - 15);
  ctx.lineTo(w - 15, h - 25);
  ctx.stroke();

  ctx.restore();
}

function drawSparkle(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;

  // 4-point star
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // Diagonal small lines
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.moveTo(x + size * 0.5, y - size * 0.5);
  ctx.lineTo(x - size * 0.5, y + size * 0.5);
  ctx.stroke();

  ctx.restore();
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function generateMangaCard(filename, bgColor, emoji, text, subtext = '') {
  const filepath = path.join(CARDS_DIR, filename);

  const width = 400;
  const height = 300;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  drawMangaCard(ctx, width, height, { bgColor, emoji, text, subtext });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Created: ${filename}`);
}

// ============================================
// PREVIEW - Generate ONE card first for approval
// ============================================

console.log('Generating PREVIEW card (Manga Cel-Shaded style)...\n');

// PREVIEW: Tomate Noire de Crimée (Kokopelli)
generateMangaCard(
  'card-tomato-blackk-MANGAPREVIEW.png',
  '#fce7f3', // pink background
  '🍅',
  'Noire de Crimée',
  'Tomate ancienne • Kokopelli'
);
