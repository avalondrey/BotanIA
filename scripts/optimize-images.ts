#!/usr/bin/env npx tsx
/**
 * Script d'optimisation des images PNG → WebP
 * =============================================
 *
 * Convertit toutes les images PNG du projet en WebP qualité 85
 * avec conservation de la transparence (alpha channel).
 *
 * Usage:
 *   npx tsx scripts/optimize-images.ts          # Conversion PNG → WebP
 *   npx tsx scripts/optimize-images.ts --check  # Affiche les stats sans convertir
 *   npx tsx scripts/optimize-images.ts --dry-run # Aperçu des fichiers à convertir
 */

import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.join(__dirname, '../public');
const QUALITY = 85;
const COMPRESSION_LEVEL = 6;

interface ImageStats {
  originalPath: string;
  webpPath: string;
  originalSize: number;
  webpSize: number;
  savedBytes: number;
  savedPercent: number;
}

const SKIP_DIRS = ['node_modules', '.next', '.git'];

function findPNGFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Skip certain directories
      if (entry.isDirectory()) {
        if (SKIP_DIRS.some(skip => fullPath.includes(skip))) continue;
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

async function convertToWebP(pngPath: string, outputDir: string): Promise<ImageStats | null> {
  try {
    const sharp = require('sharp');
    const pngBuffer = fs.readFileSync(pngPath);
    const metadata = await sharp(pngBuffer).metadata();

    const relativePath = path.relative(PUBLIC_DIR, pngPath);
    const webpPath = path.join(outputDir, relativePath.replace('.png', '.webp'));

    // Ensure output directory exists
    const webpDir = path.dirname(webpPath);
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true });
    }

    // Convert PNG → WebP with quality 85, preserving alpha
    await sharp(pngBuffer)
      .webp({ quality: QUALITY, effort: COMPRESSION_LEVEL })
      .toFile(webpPath);

    const originalSize = fs.statSync(pngPath).size;
    const webpSize = fs.statSync(webpPath).size;
    const savedBytes = originalSize - webpSize;
    const savedPercent = Math.round((savedBytes / originalSize) * 100);

    return {
      originalPath: relativePath,
      webpPath: webpPath.replace(PUBLIC_DIR + path.sep, ''),
      originalSize,
      webpSize,
      savedBytes,
      savedPercent,
    };
  } catch (e) {
    console.error(`  ❌ Erreur: ${pngPath} — ${e}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const check = args.includes('--check');

  console.log('🖼️  Optimisation Images PNG → WebP\n');
  console.log(`📁 Répertoire: ${PUBLIC_DIR}`);
  console.log(`🎚️  Qualité WebP: ${QUALITY}%\n`);

  const pngFiles = findPNGFiles(PUBLIC_DIR);
  console.log(`📋 ${pngFiles.length} fichier(s) PNG trouvé(s)\n`);

  if (pngFiles.length === 0) {
    console.log('✅ Aucun PNG à convertir');
    return;
  }

  if (dryRun || check) {
    console.log('📋 Fichiers qui seraient convertis:\n');
    for (const f of pngFiles) {
      const rel = path.relative(PUBLIC_DIR, f);
      const size = fs.statSync(f).size;
      console.log(`   ${rel} — ${(size / 1024).toFixed(1)}KB`);
    }
    console.log(`\n💡 Taille totale: ${(pngFiles.reduce((s, f) => s + fs.statSync(f).size, 0) / 1024 / 1024).toFixed(2)}MB`);
    if (dryRun) {
      console.log('\n🔍 Mode dry-run — aucune conversion effectuée');
    }
    return;
  }

  // Conversion
  console.log('⚙️  Conversion en cours...\n');

  const results: ImageStats[] = [];
  let totalOriginal = 0;
  let totalWebp = 0;

  for (const pngPath of pngFiles) {
    process.stdout.write(`  ⏳ ${path.relative(PUBLIC_DIR, pngPath)}... `);

    const result = await convertToWebP(pngPath, PUBLIC_DIR);

    if (result) {
      results.push(result);
      totalOriginal += result.originalSize;
      totalWebp += result.webpSize;
      const arrow = result.savedPercent > 0 ? '↓' : '↑';
      const color = result.savedPercent > 0 ? '32' : '31'; // green or red
      console.log(
        `\x1b[${color}m${(result.webpSize / 1024).toFixed(1)}KB ` +
        `(${arrow}${result.savedPercent}%)\x1b[0m`
      );
    } else {
      console.log('\x1b[33m⚠️ Ignoré\x1b[0m');
    }
  }

  // Stats finales
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSULTATS');
  console.log('═'.repeat(60));

  const totalSaved = totalOriginal - totalWebp;
  const totalSavedPercent = Math.round((totalSaved / totalOriginal) * 100);

  console.log(`\n   Total original:   ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Total WebP:      ${(totalWebp / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   💾 Économisé:     ${(totalSaved / 1024 / 1024).toFixed(2)}MB (${totalSavedPercent}%)`);
  console.log(`   Fichiers:         ${results.length} PNG → WebP`);

  if (totalSavedPercent > 30) {
    console.log(`\n   ✅ Excellent! Compression supérieure à 30%`);
  } else if (totalSavedPercent > 0) {
    console.log(`\n   ⚠️ Compression modérée (certaines images peuvent déjà être optimisées)`);
  } else {
    console.log(`\n   ℹ️ Certaines images sont plus petites en PNG (déjà compressées ou très simples)`);
  }

  // Top 5 économies
  const top5 = [...results]
    .filter(r => r.savedBytes > 0)
    .sort((a, b) => b.savedBytes - a.savedBytes)
    .slice(0, 5);

  if (top5.length > 0) {
    console.log('\n   🏆 Top 5 économies:');
    for (const r of top5) {
      console.log(`      ${r.originalPath.split(path.sep).pop()}`);
      console.log(`         ${(r.originalSize / 1024).toFixed(1)}KB → ${(r.webpSize / 1024).toFixed(1)}KB (↓${r.savedPercent}%)`);
    }
  }

  console.log('\n💡 Les fichiers PNG originaux sont conservés.');
  console.log('   Pour les supprimer après vérification:');
  console.log('   find public -name "*.png" -type f | head -20');

  // Générer un rapport JSON
  const reportPath = path.join(PUBLIC_DIR, 'image-optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    quality: QUALITY,
    totalOriginalMB: (totalOriginal / 1024 / 1024).toFixed(2),
    totalWebpMB: (totalWebp / 1024 / 1024).toFixed(2),
    savedMB: (totalSaved / 1024 / 1024).toFixed(2),
    savedPercent: totalSavedPercent,
    files: results.length,
    details: results.map(r => ({
      original: r.originalPath,
      webp: r.webpPath,
      originalKB: (r.originalSize / 1024).toFixed(1),
      webpKB: (r.webpSize / 1024).toFixed(1),
      savedPercent: r.savedPercent,
    })),
  }, null, 2));

  console.log(`\n📄 Rapport détaillé: ${reportPath.replace(path.join(__dirname, '..'), '')}`);
}

main().catch(console.error);
