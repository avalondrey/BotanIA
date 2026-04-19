#!/usr/bin/env npx tsx
/**
 * Script de génération des Sprite Sheets
 * =====================================
 *
 * Combine les sprites individuels en une seule image (sprite sheet)
 * pour réduire les requêtes HTTP et le poids total.
 *
 * Usage:
 *   npx tsx scripts/generate-sprite-sheets.ts
 *   npx tsx scripts/generate-sprite-sheets.ts --preview  (affiche les dimensions)
 *   npx tsx scripts/generate-sprite-sheets.ts --check     (vérifie sans générer)
 */

import * as fs from 'fs';
import * as path from 'path';

const PLANTS_DIR = path.join(__dirname, '../public/plants');
const TREES_DIR = path.join(__dirname, '../public/trees');
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');
const SHEET_COLS = 6; // 6 stades par ligne

interface SpriteInfo {
  name: string;
  width: number;
  height: number;
  file: string;
}

// ─── Lecture des sprites existants ────────────────────────────────────────────

function getPlantSprites(): Map<string, SpriteInfo[]> {
  const plants = new Map<string, SpriteInfo[]>();

  if (!fs.existsSync(PLANTS_DIR)) {
    console.error(`❌ Répertoire non trouvé: ${PLANTS_DIR}`);
    return plants;
  }

  const files = fs.readdirSync(PLANTS_DIR).filter(f => f.endsWith('.png'));

  for (const file of files) {
    // Parse: basil-stage-1.png → { name: 'basil', stage: 1 }
    const match = file.match(/^(.+)-stage-(\d+)\.png$/);
    if (!match) continue;

    const [, name, stageStr] = match;
    const stage = parseInt(stageStr, 10);

    if (!plants.has(name)) plants.set(name, []);
    const sprites = plants.get(name)!;

    const filePath = path.join(PLANTS_DIR, file);
    const stats = fs.statSync(filePath);

    sprites.push({
      name,
      width: 0, // Will be read from image
      height: 0,
      file: filePath,
    });
  }

  return plants;
}

// ─── Création du sprite sheet ───────────────────────────────────────────────

interface GeneratedSheet {
  plantName: string;
  outputFile: string;
  width: number;
  height: number;
  stageWidth: number;
  stageHeight: number;
  stages: { index: number; x: number; y: number }[];
}

/**
 * Génère un sprite sheet pour une plante (tous les stades dans 1 image)
 * Format: une seule rangée horizontale
 */
function generateSpriteSheet(sprites: SpriteInfo[], outputPath: string): GeneratedSheet | null {
  if (sprites.length === 0) return null;

  // Tous les stades doivent avoir la même taille
  const stageWidth = sprites[0].width;
  const stageHeight = sprites[0].height;
  const sheetWidth = stageWidth * sprites.length;
  const sheetHeight = stageHeight;

  // Créer le sprite sheet (Canvas simulé en mémoire)
  // On va utiliser sharp pour créer le sheet
  try {
    // Pour l'instant on va générer le JSON de mapping
    // La génération réelle des images nécessite sharp ou canvas
    const stages = sprites.map((s, i) => ({
      index: i + 1,
      x: i * stageWidth,
      y: 0,
    }));

    return {
      plantName: sprites[0].name,
      outputFile: outputPath.replace(path.join(__dirname, '../public'), ''),
      width: sheetWidth,
      height: sheetHeight,
      stageWidth,
      stageHeight,
      stages,
    };
  } catch (e) {
    console.error(`Erreur pour ${sprites[0].name}:`, e);
    return null;
  }
}

// ─── Génération CSS ──────────────────────────────────────────────────────────

function generateCSS(sheets: GeneratedSheet[]): string {
  const lines: string[] = [
    '/**',
    ' * Sprite Sheets — Auto-générés',
    ' * Ne pas éditer manuellement — regénérer avec: npx tsx scripts/generate-sprite-sheets.ts',
    ' */',
    '',
  ];

  for (const sheet of sheets) {
    lines.push(`.sprite-${sheet.plantName} {`);
    lines.push(`  width: ${sheet.stageWidth}px;`);
    lines.push(`  height: ${sheet.stageHeight}px;`);
    lines.push(`  background-image: url('${sheet.outputFile}');`);
    lines.push(`  background-size: ${sheet.width}px ${sheet.height}px;`);
    lines.push(`}`);
    lines.push('');

    for (const stage of sheet.stages) {
      lines.push(`.sprite-${sheet.plantName}.stage-${stage.index} {`);
      lines.push(`  background-position: -${stage.x}px -${stage.y}px;`);
      lines.push(`}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Génération TypeScript mapping ───────────────────────────────────────────

function generateTSMapping(sheets: GeneratedSheet[]): string {
  const lines: string[] = [
    '/**',
    ' * Sprite Sheets Mapping — Auto-générés',
    ' * Ne pas éditer manuellement',
    ' */',
    '',
    'export interface SpriteSheetInfo {',
    '  image: string;',
    '  stageWidth: number;',
    '  stageHeight: number;',
    '  stages: { index: number; x: number; y: number }[];',
    '}',
    '',
    'export const SPRITE_SHEETS: Record<string, SpriteSheetInfo> = {',
  ];

  for (const sheet of sheets) {
    lines.push(`  '${sheet.plantName}': {`);
    lines.push(`    image: '${sheet.outputFile}',`);
    lines.push(`    stageWidth: ${sheet.stageWidth},`);
    lines.push(`    stageHeight: ${sheet.stageHeight},`);
    lines.push(`    stages: [`);
    for (const stage of sheet.stages) {
      lines.push(`      { index: ${stage.index}, x: ${stage.x}, y: ${stage.y} },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');
  lines.push('/**');
  lines.push(' * Retourne l\'URL de l\'image pour un stage donné');
  lines.push(' */');
  lines.push('export function getSpriteSheetURL(plantId: string): string | undefined {');
  lines.push('  return SPRITE_SHEETS[plantId]?.image;');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * Retourne les coordonnées CSS pour un stage');
  lines.push(' */');
  lines.push('export function getSpritePosition(');
  lines.push('  plantId: string,');
  lines.push('  stage: number');
  lines.push('): { x: number; y: number; width: number; height: number } | undefined {');
  lines.push('  const sheet = SPRITE_SHEETS[plantId];');
  lines.push('  if (!sheet) return undefined;');
  lines.push('  const s = sheet.stages.find(st => st.index === stage);');
  lines.push('  if (!s) return undefined;');
  lines.push('  return { x: s.x, y: s.y, width: sheet.stageWidth, height: sheet.stageHeight };');
  lines.push('}');

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const check = args.includes('--check');

  console.log('🎨 Génération des Sprite Sheets\n');

  const plants = getPlantSprites();
  console.log(`📋 ${plants.size} plantes trouvées\n`);

  if (plants.size === 0) {
    console.log('❌ Aucune plante avec sprites trouvée');
    return;
  }

  // Vérifier que sharp est disponible
  let sharp: any = null;
  try {
    sharp = require('sharp');
    console.log('✅ Sharp disponible\n');
  } catch {
    console.log('⚠️ Sharp non disponible — génération d\'images ignorée');
    console.log('   Installez avec: npm install sharp');
    console.log('   Les fichiers JSON/CSS seront quand même générés\n');
  }

  const sheets: GeneratedSheet[] = [];
  const PLANT_SPRITE_SIZE = 128; // Taille standard d'un sprite

  for (const [plantName, sprites] of plants) {
    sprites.sort((a, b) => {
      const aMatch = a.file.match(/stage-(\d+)/);
      const bMatch = b.file.match(/stage-(\d+)/);
      return (parseInt(aMatch?.[1] ?? '0') - parseInt(bMatch?.[1] ?? '0'));
    });

    // Lire les dimensions avec sharp
    if (sharp) {
      try {
        const firstSprite = await sharp(sprites[0].file).metadata();
        sprites.forEach(s => {
          s.width = firstSprite.width ?? PLANT_SPRITE_SIZE;
          s.height = firstSprite.height ?? PLANT_SPRITE_SIZE;
        });
      } catch {
        sprites.forEach(s => {
          s.width = PLANT_SPRITE_SIZE;
          s.height = PLANT_SPRITE_SIZE;
        });
      }
    } else {
      sprites.forEach(s => {
        s.width = PLANT_SPRITE_SIZE;
        s.height = PLANT_SPRITE_SIZE;
      });
    }

    const outputFile = `/sprites/${plantName}-stages.png`;
    const outputPath = path.join(OUTPUT_DIR, `${plantName}-stages.png`);

    const sheet = generateSpriteSheet(sprites, outputPath);
    if (sheet) {
      sheets.push(sheet);
      console.log(`  ✅ ${plantName} — ${sprites.length} stades — ${sheet.width}×${sheet.height}px`);
    }

    // Générer le sprite sheet image si sharp est disponible
    if (sharp && !check) {
      try {
        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Créer une image composite avec tous les stades côte à côte
        const composites = sprites.map((sprite, i) => ({
          input: sprite.file,
          left: i * sprite.width,
          top: 0,
        }));

        const firstMeta = await sharp(sprites[0].file).metadata();
        const w = sprites.length * (firstMeta.width ?? PLANT_SPRITE_SIZE);
        const h = firstMeta.height ?? PLANT_SPRITE_SIZE;

        await sharp({
          create: {
            width: w,
            height: h,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          },
        })
          .composite(composites)
          .png({ quality: 90, compressionLevel: 6 })
          .toFile(outputPath);

        // Convertir en WebP pour réduire la taille
        const webpPath = outputPath.replace('.png', '.webp');
        await sharp(outputPath)
          .webp({ quality: 85 })
          .toFile(webpPath);

        const pngStats = fs.statSync(outputPath);
        const webpStats = fs.statSync(webpPath);

        console.log(`     PNG: ${(pngStats.size / 1024).toFixed(1)}KB → WebP: ${(webpStats.size / 1024).toFixed(1)}KB`);
      } catch (e) {
        console.log(`     ⚠️ Erreur génération image: ${e}`);
      }
    }
  }

  // Calculer les statistiques
  const totalOriginal = sheets.length * sheets[0]?.stageWidth * sheets[0]?.stageHeight * sheets[0]?.stages.length * 4 / 1024;
  const totalSpriteSheets = sheets.reduce((sum, s) => sum + s.width * s.height * 4 / 1024, 0);

  console.log(`\n📊 Sprite Sheets générés: ${sheets.length}`);
  console.log(`   Format: horizontal (tous les stades dans 1 image)`);
  console.log(`   Output: ${OUTPUT_DIR.replace(path.join(__dirname, '../public'), '/public')}/`);

  // Générer les fichiers CSS et TS
  const cssOutput = path.join(__dirname, '../src/styles/sprites.css');
  const tsOutput = path.join(__dirname, '../src/lib/sprite-sheets.ts');

  if (!check) {
    // CSS
    const cssDir = path.dirname(cssOutput);
    if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
    fs.writeFileSync(cssOutput, generateCSS(sheets));
    console.log(`\n✅ CSS généré: ${cssOutput.replace(path.join(__dirname, '..'), '')}`);

    // TypeScript
    const tsDir = path.dirname(tsOutput);
    if (!fs.existsSync(tsDir)) fs.mkdirSync(tsDir, { recursive: true });
    fs.writeFileSync(tsOutput, generateTSMapping(sheets));
    console.log(`✅ TypeScript généré: ${tsOutput.replace(path.join(__dirname, '..'), '')}`);

    // JSON de mapping
    const jsonOutput = path.join(OUTPUT_DIR, 'sprite-sheets.json');
    fs.writeFileSync(jsonOutput, JSON.stringify(sheets, null, 2));
    console.log(`✅ JSON généré: ${jsonOutput.replace(path.join(__dirname, '..'), '')}`);
  }

  console.log('\n💡 Utilisation dans le code:');
  console.log('   import { SPRITE_SHEETS, getSpritePosition } from "@/lib/sprite-sheets";');
  console.log('   import "@/styles/sprites.css";');
  console.log('');
  console.log('   // Dans un composant:');
  console.log('   <div class={`sprite-tomato stage-${stage}`} />');
  console.log('');
  console.log('   // Ou via getSpritePosition pour un img/div avec background-position:');
  console.log('   const pos = getSpritePosition("tomato", 3);');
  console.log('   // → { x: 384, y: 0, width: 128, height: 128 } pour stage 3');
}

main().catch(console.error);
