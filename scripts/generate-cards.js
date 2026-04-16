// ═══════════════════════════════════════════════════════════
//  Generate all missing plant card images (512×720 PNG)
//  Uses Node.js canvas module — same style as card-arbousier
// ═══════════════════════════════════════════════════════════

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const WIDTH = 512;
const HEIGHT = 720;
const OUT_DIR = path.join(__dirname, '..', 'public', 'cards');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Plant data ───
// Categories: 'vegetable', 'hedge', 'tree', 'herb'
const PLANTS = {
  // Légumes
  cucumber:   { name: 'Concombre',      emoji: '🥒', cat: 'vegetable', family: 'Cucurbitaceae',   harvest: 'Été',         tBase: 12, tCap: 35, days: 60 },
  zucchini:   { name: 'Courgette',      emoji: '🥒', cat: 'vegetable', family: 'Cucurbitaceae',   harvest: 'Été',         tBase: 12, tCap: 35, days: 55 },
  bean:       { name: 'Haricot',        emoji: '🫘', cat: 'vegetable', family: 'Fabaceae',         harvest: 'Été',         tBase: 10, tCap: 30, days: 65 },
  pea:        { name: 'Pois',           emoji: '🟢', cat: 'vegetable', family: 'Fabaceae',         harvest: 'Printemps',   tBase: 5,  tCap: 25, days: 70 },
  spinach:    { name: 'Épinard',        emoji: '🥬', cat: 'vegetable', family: 'Amaranthaceae',    harvest: 'Printemps',   tBase: 5,  tCap: 25, days: 45 },
  radish:     { name: 'Radis',          emoji: '🔴', cat: 'vegetable', family: 'Brassicaceae',      harvest: 'Printemps',   tBase: 5,  tCap: 28, days: 30 },
  cabbage:    { name: 'Chou Fleur',     emoji: '🥬', cat: 'vegetable', family: 'Brassicaceae',      harvest: 'Automne',     tBase: 5,  tCap: 25, days: 90 },
  eggplant:   { name: 'Aubergine',      emoji: '🍆', cat: 'vegetable', family: 'Solanaceae',        harvest: 'Été',         tBase: 15, tCap: 35, days: 80 },
  squash:     { name: 'Courge',         emoji: '🎃', cat: 'vegetable', family: 'Cucurbitaceae',    harvest: 'Automne',     tBase: 12, tCap: 35, days: 100 },
  melon:      { name: 'Melon',          emoji: '🍈', cat: 'vegetable', family: 'Cucurbitaceae',    harvest: 'Été',         tBase: 15, tCap: 35, days: 115 },
  parsley:    { name: 'Persil',         emoji: '🌿', cat: 'herb',     family: 'Apiaceae',         harvest: 'Toute saison', tBase: 5, tCap: 25, days: 75 },
  sunflower:  { name: 'Tournesol',      emoji: '🌻', cat: 'vegetable', family: 'Asteraceae',       harvest: 'Automne',     tBase: 8,  tCap: 35, days: 100 },
  corn:       { name: 'Maïs',           emoji: '🌽', cat: 'vegetable', family: 'Poaceae',          harvest: 'Été',         tBase: 10, tCap: 35, days: 112 },
  quinoa:     { name: 'Quinoa',         emoji: '🌾', cat: 'vegetable', family: 'Amaranthaceae',    harvest: 'Automne',     tBase: 5,  tCap: 30, days: 107 },
  amaranth:   { name: 'Amarante',       emoji: '🌺', cat: 'vegetable', family: 'Amaranthaceae',    harvest: 'Été',         tBase: 12, tCap: 35, days: 95 },
  sorrel:     { name: 'Oseille',        emoji: '🥬', cat: 'herb',     family: 'Polygonaceae',     harvest: 'Printemps',   tBase: 3,  tCap: 25, days: 72 },

  // Petits fruits / haies
  goji:       { name: 'Goji',           emoji: '🍒', cat: 'hedge',    family: 'Solanaceae',        harvest: 'Automne',     tBase: 8,  tCap: 35, days: 180 },
  lycium:     { name: 'Lyciet',         emoji: '🍇', cat: 'hedge',    family: 'Solanaceae',        harvest: 'Automne',     tBase: 8,  tCap: 35, days: 180 },
  mirabellier:{ name: 'Mirabellier',     emoji: '🫐', cat: 'hedge',    family: 'Rosaceae',          harvest: 'Été',         tBase: 7,  tCap: 30, days: 150 },
  photinia:   { name: 'Photinia',       emoji: '🌿', cat: 'hedge',    family: 'Rosaceae',          harvest: 'Ornement',    tBase: 7,  tCap: 35, days: 365 },
  eleagnus:   { name: 'Élagnus',        emoji: '🌾', cat: 'hedge',    family: 'Elaeagnaceae',      harvest: 'Ornement',    tBase: 5,  tCap: 35, days: 365 },
  laurus:     { name: 'Laurier Sauce',  emoji: '🌿', cat: 'hedge',    family: 'Lauraceae',         harvest: 'Toute saison', tBase: 5, tCap: 35, days: 365 },
  cornus:     { name: 'Cornouillier',   emoji: '🌸', cat: 'hedge',    family: 'Cornaceae',         harvest: 'Ornement',    tBase: 5,  tCap: 30, days: 300 },
  casseille:  { name: 'Casseille',      emoji: '🫐', cat: 'hedge',    family: 'Grossulariaceae',   harvest: 'Été',         tBase: 5,  tCap: 30, days: 120 },
  akebia:     { name: 'Akébie',         emoji: '🌸', cat: 'hedge',    family: 'Lardizabalaceae',   harvest: 'Automne',     tBase: 8,  tCap: 30, days: 200 },
  josta:      { name: 'Josta',          emoji: '🫐', cat: 'hedge',    family: 'Grossulariaceae',   harvest: 'Été',         tBase: 5,  tCap: 28, days: 130 },
  'baco-noir':{ name: 'Baco Noir',      emoji: '🍇', cat: 'hedge',    family: 'Vitaceae',          harvest: 'Automne',     tBase: 10, tCap: 35, days: 180 },
  olive:      { name: 'Olivier',        emoji: '🫒', cat: 'hedge',    family: 'Oleaceae',          harvest: 'Automne',     tBase: 10, tCap: 35, days: 300 },
  arbousier:  { name: 'Arbousier',      emoji: '🍓', cat: 'hedge',    family: 'Ericaceae',         harvest: 'Automne',     tBase: 8,  tCap: 30, days: 365 },
  amelanchier:{ name: 'Amélanchier',    emoji: '🫐', cat: 'hedge',    family: 'Rosaceae',          harvest: 'Été',         tBase: 5,  tCap: 30, days: 150 },
  blackcurrant:{ name: 'Cassis',        emoji: '🫐', cat: 'hedge',    family: 'Grossulariaceae',   harvest: 'Été',         tBase: 5,  tCap: 28, days: 100 },
  blackberry: { name: 'Mûrier',         emoji: '🫐', cat: 'hedge',    family: 'Rosaceae',          harvest: 'Été',         tBase: 8,  tCap: 30, days: 120 },

  // Arbres
  apple:      { name: 'Pommier Reinette', emoji: '🍎', cat: 'tree', family: 'Rosaceae',       harvest: 'Automne',  tBase: 7,  tCap: 30, days: 365 },
  'apple-golden': { name: 'Pommier Golden', emoji: '🍎', cat: 'tree', family: 'Rosaceae',    harvest: 'Automne',  tBase: 7,  tCap: 30, days: 365 },
  'apple-gala':   { name: 'Pommier Gala',  emoji: '🍎', cat: 'tree', family: 'Rosaceae',    harvest: 'Automne',  tBase: 7,  tCap: 30, days: 365 },
  pear:       { name: 'Poirier Comice',  emoji: '🍐', cat: 'tree',   family: 'Rosaceae',       harvest: 'Automne',  tBase: 7,  tCap: 30, days: 365 },
  cherry:     { name: 'Cerisier',        emoji: '🍒', cat: 'tree',   family: 'Rosaceae',       harvest: 'Été',      tBase: 6,  tCap: 30, days: 300 },
  hazelnut:   { name: 'Noisetier',       emoji: '🌰', cat: 'tree',   family: 'Betulaceae',     harvest: 'Automne',  tBase: 5,  tCap: 28, days: 365 },
  walnut:     { name: 'Noyer',           emoji: '🌰', cat: 'tree',   family: 'Juglandaceae',   harvest: 'Automne',  tBase: 8,  tCap: 30, days: 365 },
  orange:     { name: 'Oranger',         emoji: '🍊', cat: 'tree',   family: 'Rutaceae',       harvest: 'Hiver',    tBase: 12, tCap: 35, days: 365 },
  lemon:      { name: 'Citronnier',      emoji: '🍋', cat: 'tree',   family: 'Rutaceae',       harvest: 'Toute saison', tBase: 12, tCap: 35, days: 365 },
  oak:        { name: 'Chêne',           emoji: '🌳', cat: 'tree',   family: 'Fagaceae',        harvest: 'Ornement', tBase: 5,  tCap: 30, days: 365 },
  birch:      { name: 'Bouleau',         emoji: '🌳', cat: 'tree',   family: 'Betulaceae',      harvest: 'Ornement', tBase: 3,  tCap: 25, days: 365 },
  maple:      { name: 'Érable',          emoji: '🌳', cat: 'tree',   family: 'Sapindaceae',     harvest: 'Ornement', tBase: 5,  tCap: 30, days: 365 },
  pine:       { name: 'Pin Sylvestre',   emoji: '🌲', cat: 'tree',   family: 'Pinaceae',        harvest: 'Ornement', tBase: 3,  tCap: 30, days: 365 },
  magnolia:   { name: 'Magnolia',        emoji: '🌸', cat: 'tree',   family: 'Magnoliaceae',    harvest: 'Ornement', tBase: 8,  tCap: 30, days: 365 },
};

// ─── Gradients by category ───
const GRADIENTS = {
  vegetable: { top: '#22c55e', bottom: '#166534', border: '#15803d', bg: '#f0fdf4' },
  herb:      { top: '#10b981', bottom: '#065f46', border: '#047857', bg: '#ecfdf5' },
  hedge:     { top: '#8b5cf6', bottom: '#5b21b6', border: '#6d28d9', bg: '#faf5ff' },
  tree:      { top: '#b45309', bottom: '#78350f', border: '#92400e', bg: '#fffbeb' },
};

function generateCard(plantId, info) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const colors = GRADIENTS[info.cat];

  // Background fill
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Top gradient band
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, colors.top);
  grad.addColorStop(1, colors.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, 200);

  // Border
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, WIDTH - 8, HEIGHT - 8);

  // Inner border accent
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, WIDTH - 24, HEIGHT - 24);

  // Title banner
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(20, 20, WIDTH - 40, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(info.name.toUpperCase(), WIDTH / 2, 52);

  // Emoji (large)
  ctx.font = '90px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(info.emoji, WIDTH / 2, 160);

  // Separator line
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 215);
  ctx.lineTo(WIDTH - 30, 215);
  ctx.stroke();

  // Info section
  const startX = 40;
  let y = 255;
  const lineHeight = 38;
  const labelColor = '#78716c';
  const valueColor = '#1c1917';

  function drawRow(label, value, yPos) {
    ctx.fillStyle = labelColor;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, startX, yPos);

    ctx.fillStyle = valueColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(value, startX + 180, yPos);
  }

  drawRow('Famille', info.family, y); y += lineHeight;
  drawRow('Récolte', info.harvest, y); y += lineHeight;
  drawRow('T. base', `${info.tBase}°C`, y); y += lineHeight;
  drawRow('T. plafond', `${info.tCap}°C`, y); y += lineHeight;
  drawRow('Jours récolte', `~${info.days}j`, y); y += lineHeight;

  // Category badge
  y += 15;
  const catLabels = { vegetable: 'LÉGUME', herb: 'AROMATIQUE', hedge: 'HAIE / PETIT FRUIT', tree: 'ARBRE' };
  ctx.fillStyle = colors.top;
  roundRect(ctx, startX, y, 160, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(catLabels[info.cat], startX + 80, y + 15);

  // Bottom decorative bar
  const bottomGrad = ctx.createLinearGradient(0, HEIGHT - 60, WIDTH, HEIGHT - 60);
  bottomGrad.addColorStop(0, colors.top);
  bottomGrad.addColorStop(0.5, colors.border);
  bottomGrad.addColorStop(1, colors.top);
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, HEIGHT - 60, WIDTH, 60);

  // BotanIA branding
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BotanIA', WIDTH / 2, HEIGHT - 30);

  return canvas.toBuffer('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Main ───
let generated = 0;
let skipped = 0;

for (const [id, info] of Object.entries(PLANTS)) {
  const outPath = path.join(OUT_DIR, `card-${id}.png`);

  // Skip if already exists
  if (fs.existsSync(outPath)) {
    console.log(`  ⏭  ${id} — already exists`);
    skipped++;
    continue;
  }

  try {
    const buf = generateCard(id, info);
    fs.writeFileSync(outPath, buf);
    generated++;
    console.log(`  ✅  ${id} — ${info.name}`);
  } catch (err) {
    console.error(`  ❌  ${id} — ${err.message}`);
  }
}

console.log(`\n═══ Done: ${generated} generated, ${skipped} skipped ═══`);