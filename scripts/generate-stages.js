// ═══════════════════════════════════════════════════════════
//  Generate stage images for all plants (6 stades × 51 plants)
//  Format: public/stages/{plantId}/{0-5}.png (256×256)
//
//  Stades: 0=Graine, 1=Levée, 2=Plantule, 3=Croissance, 4=Floraison, 5=Récolte
// ═══════════════════════════════════════════════════════════

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 256;
const OUT_DIR = path.join(__dirname, '..', 'public', 'stages');

// Stage metadata
const STAGES = [
  { index: 0, label: 'Graine',      emoji: '🌰', bg: '#fef9c3' },
  { index: 1, label: 'Levée',      emoji: '🌱', bg: '#dcfce7' },
  { index: 2, label: 'Plantule',   emoji: '🌿', bg: '#bbf7d0' },
  { index: 3, label: 'Croissance', emoji: '🪴', bg: '#86efac' },
  { index: 4, label: 'Floraison',  emoji: '🌸', bg: '#fce7f3' },
  { index: 5, label: 'Récolte',    emoji: '🍅', bg: '#fef3c7' },
];

// All plants with display info
const PLANTS = {
  // Légumes
  tomato:     { name: 'Tomate',       emoji: '🍅', cat: 'vegetable', harvestEmoji: '🍅' },
  carrot:     { name: 'Carotte',      emoji: '🥕', cat: 'vegetable', harvestEmoji: '🥕' },
  lettuce:    { name: 'Salade',       emoji: '🥬', cat: 'vegetable', harvestEmoji: '🥬' },
  strawberry: { name: 'Fraise',       emoji: '🍓', cat: 'vegetable', harvestEmoji: '🍓' },
  basil:      { name: 'Basilic',      emoji: '🌿', cat: 'herb',      harvestEmoji: '🌿' },
  pepper:     { name: 'Piment',       emoji: '🌶️', cat: 'vegetable', harvestEmoji: '🌶️' },
  cucumber:   { name: 'Concombre',    emoji: '🥒', cat: 'vegetable', harvestEmoji: '🥒' },
  zucchini:   { name: 'Courgette',    emoji: '🥒', cat: 'vegetable', harvestEmoji: '🥒' },
  bean:       { name: 'Haricot',      emoji: '🫘', cat: 'vegetable', harvestEmoji: '🫘' },
  pea:        { name: 'Pois',         emoji: '🟢', cat: 'vegetable', harvestEmoji: '🟢' },
  spinach:    { name: 'Épinard',      emoji: '🥬', cat: 'vegetable', harvestEmoji: '🥬' },
  radish:     { name: 'Radis',        emoji: '🔴', cat: 'vegetable', harvestEmoji: '🔴' },
  cabbage:    { name: 'Chou Fleur',   emoji: '🥬', cat: 'vegetable', harvestEmoji: '🥬' },
  eggplant:   { name: 'Aubergine',    emoji: '🍆', cat: 'vegetable', harvestEmoji: '🍆' },
  squash:     { name: 'Courge',       emoji: '🎃', cat: 'vegetable', harvestEmoji: '🎃' },
  parsley:    { name: 'Persil',       emoji: '🌿', cat: 'herb',      harvestEmoji: '🌿' },
  melon:      { name: 'Melon',        emoji: '🍈', cat: 'vegetable', harvestEmoji: '🍈' },
  corn:       { name: 'Maïs',        emoji: '🌽', cat: 'vegetable', harvestEmoji: '🌽' },
  sunflower:  { name: 'Tournesol',    emoji: '🌻', cat: 'vegetable', harvestEmoji: '🌻' },
  quinoa:     { name: 'Quinoa',       emoji: '🌾', cat: 'vegetable', harvestEmoji: '🌾' },
  amaranth:   { name: 'Amarante',     emoji: '🌺', cat: 'vegetable', harvestEmoji: '🌺' },
  sorrel:     { name: 'Oseille',      emoji: '🥬', cat: 'herb',      harvestEmoji: '🥬' },
  // Petits fruits / haies
  goji:       { name: 'Goji',         emoji: '🍒', cat: 'hedge',     harvestEmoji: '🍒' },
  lycium:     { name: 'Lyciet',       emoji: '🍇', cat: 'hedge',     harvestEmoji: '🍇' },
  mirabellier:{ name: 'Mirabellier',  emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  photinia:   { name: 'Photinia',     emoji: '🌿', cat: 'hedge',     harvestEmoji: '🌿' },
  eleagnus:   { name: 'Élagnus',      emoji: '🌾', cat: 'hedge',     harvestEmoji: '🌾' },
  laurus:     { name: 'Laurier',      emoji: '🌿', cat: 'hedge',     harvestEmoji: '🌿' },
  cornus:     { name: 'Cornouillier',  emoji: '🌸', cat: 'hedge',     harvestEmoji: '🌸' },
  casseille:  { name: 'Casseille',     emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  akebia:     { name: 'Akébie',       emoji: '🌸', cat: 'hedge',     harvestEmoji: '🌸' },
  josta:      { name: 'Josta',        emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  'baco-noir':{ name: 'Baco Noir',    emoji: '🍇', cat: 'hedge',     harvestEmoji: '🍇' },
  olive:      { name: 'Olivier',      emoji: '🫒', cat: 'hedge',     harvestEmoji: '🫒' },
  arbousier:  { name: 'Arbousier',    emoji: '🍓', cat: 'hedge',     harvestEmoji: '🍓' },
  amelanchier:{ name: 'Amélanchier',  emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  blackcurrant:{ name: 'Cassis',      emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  blackberry: { name: 'Mûrier',       emoji: '🫐', cat: 'hedge',     harvestEmoji: '🫐' },
  // Arbres
  apple:      { name: 'Pommier',      emoji: '🍎', cat: 'tree',      harvestEmoji: '🍎' },
  'apple-golden': { name: 'Pommier Golden', emoji: '🍎', cat: 'tree', harvestEmoji: '🍎' },
  'apple-gala':   { name: 'Pommier Gala',  emoji: '🍎', cat: 'tree', harvestEmoji: '🍎' },
  pear:       { name: 'Poirier',      emoji: '🍐', cat: 'tree',      harvestEmoji: '🍐' },
  cherry:     { name: 'Cerisier',     emoji: '🍒', cat: 'tree',      harvestEmoji: '🍒' },
  hazelnut:   { name: 'Noisetier',    emoji: '🌰', cat: 'tree',      harvestEmoji: '🌰' },
  walnut:     { name: 'Noyer',        emoji: '🌰', cat: 'tree',      harvestEmoji: '🌰' },
  orange:     { name: 'Oranger',      emoji: '🍊', cat: 'tree',      harvestEmoji: '🍊' },
  lemon:      { name: 'Citronnier',   emoji: '🍋', cat: 'tree',      harvestEmoji: '🍋' },
  oak:        { name: 'Chêne',        emoji: '🌳', cat: 'tree',      harvestEmoji: '🌳' },
  birch:      { name: 'Bouleau',       emoji: '🌳', cat: 'tree',      harvestEmoji: '🌳' },
  maple:      { name: 'Érable',       emoji: '🌳', cat: 'tree',      harvestEmoji: '🌳' },
  pine:       { name: 'Pin',          emoji: '🌲', cat: 'tree',      harvestEmoji: '🌲' },
  magnolia:   { name: 'Magnolia',     emoji: '🌸', cat: 'tree',      harvestEmoji: '🌸' },
};

// Size progression by stage (percentage of canvas used)
const SIZE_PROGRESSION = [0.12, 0.20, 0.30, 0.50, 0.65, 0.75];

function generateStage(plantId, plantInfo, stageInfo) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const sz = SIZE;

  // Background
  ctx.fillStyle = stageInfo.bg;
  ctx.fillRect(0, 0, sz, sz);

  // Soft circular glow in center
  const grad = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2);
  grad.addColorStop(0, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, sz, sz);

  // Pot (terracotta) at bottom — always present
  const potW = sz * 0.35;
  const potH = sz * 0.18;
  const potX = sz/2 - potW/2;
  const potY = sz - potH - 8;
  const potColor = '#c2855a';
  const potDark = '#a0694f';

  // Pot body
  ctx.fillStyle = potColor;
  ctx.beginPath();
  ctx.moveTo(potX + 4, potY);
  ctx.lineTo(potX + potW - 4, potY);
  ctx.lineTo(potX + potW - 8, potY + potH);
  ctx.lineTo(potX + 8, potY + potH);
  ctx.closePath();
  ctx.fill();

  // Pot rim
  ctx.fillStyle = potDark;
  ctx.fillRect(potX - 2, potY - 4, potW + 4, 6);

  // Soil line
  ctx.fillStyle = '#5c3a1e';
  ctx.fillRect(potX + 6, potY + 2, potW - 12, 5);

  // Stage-specific visual
  const centerY = potY - sz * SIZE_PROGRESSION[stageInfo.index] * 0.3;
  const centerX = sz / 2;

  if (stageInfo.index === 0) {
    // Graine — small seed on soil
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(centerX, potY - 4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6B4F12';
    ctx.beginPath();
    ctx.ellipse(centerX, potY - 4, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (stageInfo.index === 1) {
    // Levée — tiny sprout
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, potY - 4);
    ctx.lineTo(centerX, potY - 22);
    ctx.stroke();
    // Tiny leaf
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(centerX + 5, potY - 20, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (stageInfo.index === 2) {
    // Plantule — small stem + 2 leaves
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, potY - 4);
    ctx.lineTo(centerX, potY - 40);
    ctx.stroke();
    // Leaves
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(centerX - 10, potY - 35, 10, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 10, potY - 30, 10, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (stageInfo.index === 3) {
    // Croissance — bigger stem + 4 leaves
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, potY - 4);
    ctx.lineTo(centerX, potY - 65);
    ctx.stroke();
    // Branches
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, potY-30); ctx.lineTo(centerX-25, potY-45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-45); ctx.lineTo(centerX+25, potY-55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-55); ctx.lineTo(centerX-18, potY-65); ctx.stroke();
    // Leaves
    ctx.fillStyle = '#4ade80';
    for (const [lx, ly, angle] of [[-25,-45,0.4],[25,-55,-0.4],[-18,-65,0.3],[10,-40,-0.3]]) {
      ctx.beginPath();
      ctx.ellipse(centerX + lx, potY + ly, 14, 7, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (stageInfo.index === 4) {
    // Floraison — full plant + flower
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, potY - 4);
    ctx.lineTo(centerX, potY - 85);
    ctx.stroke();
    // Branches
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, potY-25); ctx.lineTo(centerX-30, potY-45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-45); ctx.lineTo(centerX+30, potY-60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-60); ctx.lineTo(centerX-22, potY-78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-50); ctx.lineTo(centerX+20, potY-70); ctx.stroke();
    // Leaves
    ctx.fillStyle = '#4ade80';
    for (const [lx, ly, angle] of [[-30,-45,0.4],[30,-60,-0.4],[-22,-78,0.3],[20,-70,-0.3],[-12,-35,-0.2],[15,-40,0.2]]) {
      ctx.beginPath();
      ctx.ellipse(centerX + lx, potY + ly, 14, 7, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Flower at top
    ctx.fillStyle = '#f472b6';
    for (let a = 0; a < 5; a++) {
      const angle = (a / 5) * Math.PI * 2 - Math.PI/2;
      ctx.beginPath();
      ctx.ellipse(centerX + Math.cos(angle)*8, potY - 85 + Math.sin(angle)*8, 6, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(centerX, potY - 85, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (stageInfo.index === 5) {
    // Récolte — full plant with harvest emoji
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, potY - 4);
    ctx.lineTo(centerX, potY - 95);
    ctx.stroke();
    // Branches
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, potY-20); ctx.lineTo(centerX-35, potY-42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-38); ctx.lineTo(centerX+35, potY-55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-55); ctx.lineTo(centerX-25, potY-75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-45); ctx.lineTo(centerX+25, potY-68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, potY-65); ctx.lineTo(centerX-15, potY-85); ctx.stroke();
    // Leaves
    ctx.fillStyle = '#4ade80';
    for (const [lx, ly, angle] of [[-35,-42,0.4],[35,-55,-0.4],[-25,-75,0.3],[25,-68,-0.3],[-15,-85,0.2],[12,-30,-0.2],[-8,-50,0.2],[20,-45,-0.2]]) {
      ctx.beginPath();
      ctx.ellipse(centerX + lx, potY + ly, 14, 7, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Harvest emoji at top
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(plantInfo.harvestEmoji, centerX, potY - 95);
  }

  // Stage label at bottom-right
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  roundRect(ctx, sz - 70, sz - 26, 62, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageInfo.label, sz - 39, sz - 16);

  // Plant name top-left
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 6, 6, ctx.measureText(plantInfo.name).width + 12, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(plantInfo.name, 12, 16);

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
  const plantDir = path.join(OUT_DIR, id);

  if (!fs.existsSync(plantDir)) fs.mkdirSync(plantDir, { recursive: true });

  for (const stage of STAGES) {
    const outPath = path.join(plantDir, `${stage.index}.png`);

    if (fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    try {
      const buf = generateStage(id, info, stage);
      fs.writeFileSync(outPath, buf);
      generated++;
    } catch (err) {
      console.error(`  ❌  ${id}/${stage.index} — ${err.message}`);
    }
  }
  console.log(`  ✅  ${id} — ${info.name}`);
}

console.log(`\n═══ Done: ${generated} generated, ${skipped} skipped ═══`);