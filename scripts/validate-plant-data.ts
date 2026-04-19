#!/usr/bin/env npx tsx
/**
 * Script de validation des données d'arbres dans HologramEvolution.tsx
 * Valide TREE_CARDS pour les règles spécifiques aux arbres
 * Et vérifie que tous les plantDefId du catalog existent dans PLANT_CARDS/TREE_CARDS
 */

import * as fs from 'fs';
import * as path from 'path';

const HOLO_PATH = path.join(__dirname, '../src/components/game/HologramEvolution.tsx');
const CATALOG_PATH = path.join(__dirname, '../src/store/catalog.ts');

// Règles de validation pour les arbres
const TREE_VALIDATION: Record<string, { totalDays: { min: number; max: number }; firstHarvest: number[] }> = {
  stoneFruits: { totalDays: { min: 1095, max: 1460 }, firstHarvest: [3, 4] },
  pomeFruits: { totalDays: { min: 1825, max: 1825 }, firstHarvest: [5] },
  citrus: { totalDays: { min: 1460, max: 1460 }, firstHarvest: [4] },
  hazelnut: { totalDays: { min: 2190, max: 2190 }, firstHarvest: [6] },
  walnut: { totalDays: { min: 2920, max: 2920 }, firstHarvest: [8] },
  forestTrees: { totalDays: { min: 5475, max: 10950 }, firstHarvest: [15, 20, 25, 30] },
};

const STONE_FRUITS = ['peach', 'plum', 'cherry', 'apricot'];
const POME_FRUITS = ['apple', 'pear', 'quince'];
const CITRUS = ['orange', 'lemon', 'grapefruit', 'lime', 'mandarin', 'kumquat'];
const HAZELNUT = ['hazelnut'];
const WALNUT = ['walnut'];
const FOREST_TREES = ['oak', 'pine', 'maple', 'birch', 'magnolia', 'spruce', 'fir', 'cedar', 'larch', 'beech'];

function getTreeCategory(treeId: string): string {
  if (STONE_FRUITS.includes(treeId)) return 'stoneFruits';
  if (POME_FRUITS.includes(treeId)) return 'pomeFruits';
  if (CITRUS.includes(treeId)) return 'citrus';
  if (HAZELNUT.includes(treeId)) return 'hazelnut';
  if (WALNUT.includes(treeId)) return 'walnut';
  return 'forestTrees';
}

interface ValidationError {
  treeId: string;
  field: string;
  expected: string;
  actual: any;
}

function validateTree(treeId: string, data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const category = getTreeCategory(treeId);
  const rules = TREE_VALIDATION[category];

  if (rules) {
    // Vérifier totalDaysToHarvest
    if (typeof data.totalDaysToHarvest === 'number') {
      const total = data.totalDaysToHarvest;
      if (total < rules.totalDays.min || total > rules.totalDays.max) {
        errors.push({
          treeId,
          field: 'totalDaysToHarvest',
          expected: `${rules.totalDays.min}-${rules.totalDays.max} pour ${category}`,
          actual: total,
        });
      }
    }

    // Vérifier firstHarvestYears
    if (typeof data.firstHarvestYears === 'number') {
      if (!rules.firstHarvest.includes(data.firstHarvestYears)) {
        errors.push({
          treeId,
          field: 'firstHarvestYears',
          expected: `${rules.firstHarvest.join(' ou ')} (totalDays/365)`,
          actual: data.firstHarvestYears,
        });
      }
    }
  }

  // Vérifier stageGDD minimum pour les arbres
  if (Array.isArray(data.stageGDD)) {
    const minGDD = [200, 400, 800, 1500];
    const isTooLow = (data.stageGDD as number[]).some((gdd, i) => gdd < minGDD[i]);
    if (isTooLow) {
      errors.push({
        treeId,
        field: 'stageGDD',
        expected: '>= [200, 400, 800, 1500]',
        actual: data.stageGDD,
      });
    }
  }

  // Vérifier stageDurations trop courtes pour les arbres
  if (Array.isArray(data.stageDurations)) {
    const hasShortStages = (data.stageDurations as number[]).some(d => d < 30);
    if (hasShortStages && category !== 'hazelnut') {
      errors.push({
        treeId,
        field: 'stageDurations',
        expected: 'stades longs [45, 90, 180, 365] pour arbres',
        actual: data.stageDurations,
      });
    }
  }

  return errors;
}

// Extraire toutes les entrées d'arbres depuis TREE_CARDS
function extractTreeEntries(content: string): Map<string, Record<string, unknown>> {
  const entries = new Map<string, Record<string, unknown>>();

  // Trouver TREE_CARDS
  const treeCardsStart = content.indexOf('export const TREE_CARDS');
  if (treeCardsStart === -1) return entries;

  // Trouver la fin (prochain export ou fin du fichier)
  const nextExport = content.indexOf('\nexport const', treeCardsStart + 20);
  const treeSection = nextExport === -1
    ? content.substring(treeCardsStart)
    : content.substring(treeCardsStart, nextExport);

  // Matcher les entrées d'arbres : // ─── NOM ───\n  id: {\n    ...
  const entryRegex = /\/\/\s*──+\s*([^\n]+?)\s*──+\s*\n\s*(\w+):\s*\{/g;
  let match;

  while ((match = entryRegex.exec(treeSection)) !== null) {
    const id = match[2];

    // Trouver le bloc { ... } correspondant
    const blockStart = match.index + match[0].length;
    let braceCount = 0;
    let blockEnd = blockStart;

    for (let i = blockStart; i < treeSection.length; i++) {
      if (treeSection[i] === '{') braceCount++;
      else if (treeSection[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          blockEnd = i + 1;
          break;
        }
      }
      if (i - blockStart > 10000) break;
    }

    const block = treeSection.substring(blockStart, blockEnd);
    const entry: Record<string, unknown> = { id };

    // Parser totalDaysToHarvest
    const totalMatch = block.match(/totalDaysToHarvest:\s*(\d+)/);
    if (totalMatch) entry.totalDaysToHarvest = parseInt(totalMatch[1]);

    // Parser firstHarvestYears
    const firstMatch = block.match(/firstHarvestYears:\s*(\d+)/);
    if (firstMatch) entry.firstHarvestYears = parseInt(firstMatch[1]);

    // Parser stageGDD
    const gddRegex = /stageGDD:\s*\[([^\]]+)\]/;
    const gddMatch = block.match(gddRegex);
    if (gddMatch) {
      entry.stageGDD = gddMatch[1].split(',').map((s: string) => parseInt(s.trim()));
    }

    // Parser stageDurations
    const durRegex = /stageDurations:\s*\[([^\]]+)\]/;
    const durMatch = block.match(durRegex);
    if (durMatch) {
      entry.stageDurations = durMatch[1].split(',').map((s: string) => parseInt(s.trim()));
    }

    entries.set(id, entry);
  }

  return entries;
}

// Extraire tous les IDs valides depuis PLANT_CARDS et TREE_CARDS
function extractAllValidIds(content: string): Set<string> {
  const ids = new Set<string>();
  // Regex pour matcher les entrées : word: { ou 'word': {
  const entryRegex = /^\s*['"]?([a-z][a-z0-9-]*)['"]?\s*:\s*\{/gm;
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

// Catégories attendues par plante
const EXPECTED_CATEGORIES: Record<string, 'vegetable' | 'fruit-tree' | 'forest-tree' | 'hedge'> = {
  // Haies
  photinia: 'hedge', eleagnus: 'hedge', laurus: 'hedge', cornus: 'hedge',
  casseille: 'hedge', escallonia: 'hedge', thuya: 'hedge',
  // Fruits
  apple: 'fruit-tree', pear: 'fruit-tree', cherry: 'fruit-tree', plum: 'fruit-tree',
  peach: 'fruit-tree', apricot: 'fruit-tree', orange: 'fruit-tree', lemon: 'fruit-tree',
  hazelnut: 'fruit-tree', walnut: 'fruit-tree', olive: 'fruit-tree', fig: 'fruit-tree',
  // Forestiers
  oak: 'forest-tree', pine: 'forest-tree', maple: 'forest-tree', birch: 'forest-tree',
};

// Extraire plantCategory depuis une entrée
function extractPlantCategory(block: string): string | null {
  const match = block.match(/plantCategory:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

// Validation plantCategory pour toutes les entrées
function validatePlantCategories(content: string): { id: string; expected: string; actual: string | null }[] {
  const errors: { id: string; expected: string; actual: string | null }[] = [];

  // Trouver PLANT_CARDS
  const plantCardsStart = content.indexOf('export const PLANT_CARDS');
  const plantCardsEnd = content.indexOf('\n// ═══', plantCardsStart);
  if (plantCardsStart === -1) return errors;

  const plantSection = content.substring(plantCardsStart, plantCardsEnd);

  // Regex pour extraire chaque entrée
  const entryRegex = /\/\/\s*──+\s*([^\n]+?)\s*──+\s*\n\s*([a-z][a-z0-9-]*)\s*:\s*\{/g;
  let match;

  while ((match = entryRegex.exec(plantSection)) !== null) {
    const id = match[2];
    const expected = EXPECTED_CATEGORIES[id];

    if (expected) {
      // Trouver le bloc
      const blockStart = match.index + match[0].length;
      let braceCount = 0;
      let blockEnd = blockStart;

      for (let i = blockStart; i < plantSection.length; i++) {
        if (plantSection[i] === '{') braceCount++;
        else if (plantSection[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            blockEnd = i + 1;
            break;
          }
        }
        if (i - blockStart > 50000) break;
      }

      const block = plantSection.substring(blockStart, blockEnd);
      const actual = extractPlantCategory(block);

      if (actual !== expected) {
        errors.push({ id, expected, actual });
      }
    }
  }

  return errors;
}

// ─── Validation compagnes ───────────────────────────────────────────────────

interface CompanionError {
  plantId: string;
  companionId: string;
  issue: string;
}

function validateCompanions(content: string, validIds: Set<string>): CompanionError[] {
  const errors: CompanionError[] = [];

  // Regex pour extraire les entrées avec leurs blocs
  const entryRegex = /\/\/\s*──+\s*([^\n]+?)\s*──+\s*\n\s*([a-z][a-z0-9-]*)\s*:\s*\{/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    const plantId = match[2];
    const blockStart = match.index + match[0].length;
    let braceCount = 0;
    let blockEnd = blockStart;

    for (let i = blockStart; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) { blockEnd = i + 1; break; }
      }
      if (i - blockStart > 50000) break;
    }

    const block = content.substring(blockStart, blockEnd);

    // Extraire companions: [...]
    const companionsMatch = block.match(/companions:\s*\[([\s\S]*?)\]\s*,/);
    if (!companionsMatch) continue;

    const companionsBlock = companionsMatch[1];
    // Extraire chaque companion: { plantId: 'xxx', type: 'xxx', reason: 'xxx' }
    const compRegex = /plantId:\s*['"](\w+)['"][\s\S]*?type:\s*['"](\w+)['"][\s\S]*?reason:\s*['"]([^'"]*)['"]/g;
    let compMatch;

    while ((compMatch = compRegex.exec(companionsBlock)) !== null) {
      const companionId = compMatch[1];
      const compType = compMatch[2];
      const reason = compMatch[3];

      if (!validIds.has(companionId)) {
        errors.push({ plantId, companionId, issue: `plantDefId "${companionId}" n'existe pas dans PLANT_CARDS/TREE_CARDS` });
      }
      if (compType !== 'beneficial' && compType !== 'harmful') {
        errors.push({ plantId, companionId, issue: `type "${compType}" invalide (doit être 'beneficial' ou 'harmful')` });
      }
      if (!reason || reason.trim().length < 5) {
        errors.push({ plantId, companionId, issue: `reason "${reason}" trop courte ou vide` });
      }
    }
  }

  return errors;
}

// Extraire tous les plantDefId depuis catalog.ts
function extractCatalogPlantDefIds(content: string): string[] {
  const matches = content.match(/plantDefId:\s*["'](\w+)["']/g) || [];
  return matches.map(m => {
    const match = m.match(/["'](\w+)["']/);
    return match ? match[1] : '';
  }).filter(Boolean);
}

function main() {
  console.log('🔍 Validation des données BotanIA...\n');

  let hasErrors = false;

  // ─── Partie 1: Validation des arbres ───
  console.log('🌳 Validation TREE_CARDS (règles spécifiques arbres)...\n');

  if (!fs.existsSync(HOLO_PATH)) {
    console.error(`❌ Fichier non trouvé: ${HOLO_PATH}`);
    process.exit(1);
  }

  const holoContent = fs.readFileSync(HOLO_PATH, 'utf-8');
  const treeEntries = extractTreeEntries(holoContent);

  console.log(`📋 ${treeEntries.size} entrées trouvées dans TREE_CARDS\n`);

  const treeErrors: ValidationError[] = [];

  for (const [id, data] of treeEntries) {
    const errs = validateTree(id, data);
    treeErrors.push(...errs);
  }

  if (treeErrors.length === 0) {
    console.log('✅ Validation TREE_CARDS PASSÉE\n');
  } else {
    hasErrors = true;
    console.log(`❌ ${treeErrors.length} erreur(s) TREE_CARDS:\n`);
    for (const err of treeErrors) {
      console.log(`  ❌ ${err.treeId}.${err.field}`);
      console.log(`     Attendu: ${err.expected}`);
      console.log(`     Actuel: ${JSON.stringify(err.actual)}\n`);
    }
  }

  // ─── Partie 2: Validation plantDefId ───
  console.log('🔗 Validation plantDefId dans catalog.ts...\n');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`❌ Fichier non trouvé: ${CATALOG_PATH}`);
    process.exit(1);
  }

  const catalogContent = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const validIds = extractAllValidIds(holoContent);
  const catalogPlantDefIds = [...new Set(extractCatalogPlantDefIds(catalogContent))];

  console.log(`📋 ${validIds.size} IDs valides dans PLANT_CARDS + TREE_CARDS`);
  console.log(`📋 ${catalogPlantDefIds.length} plantDefId uniques dans catalog.ts\n`);

  const invalidPlantDefIds = catalogPlantDefIds.filter(id => !validIds.has(id));

  if (invalidPlantDefIds.length === 0) {
    console.log('✅ Validation plantDefId PASSÉE\n');
  } else {
    hasErrors = true;
    console.log(`❌ ${invalidPlantDefIds.length} plantDefId manquant(s) dans PLANT_CARDS/TREE_CARDS:\n`);
    for (const id of invalidPlantDefIds.sort()) {
      console.log(`  ❌ "${id}" — ajouter dans HologramEvolution.tsx\n`);
    }
  }

  // ─── Partie 3: Validation plantCategory ───
  console.log('🌿 Validation plantCategory dans PLANT_CARDS...\n');

  const categoryErrors = validatePlantCategories(holoContent);

  if (categoryErrors.length === 0) {
    console.log('✅ Validation plantCategory PASSÉE\n');
  } else {
    hasErrors = true;
    console.log(`❌ ${categoryErrors.length} plantCategory incorrect(s):\n`);
    for (const err of categoryErrors) {
      console.log(`  ❌ ${err.id}.plantCategory`);
      console.log(`     Attendu: '${err.expected}'`);
      console.log(`     Actuel: ${err.actual ? `'${err.actual}'` : 'NON DÉFINI'}\n`);
    }
  }

  // ─── Partie 4: Validation compagnes ───
  console.log('🤝 Validation compagnes dans PLANT_CARDS...\n');

  const companionErrors = validateCompanions(holoContent, validIds);

  if (companionErrors.length === 0) {
    console.log('✅ Validation compagnes PASSÉE\n');
  } else {
    hasErrors = true;
    console.log(`❌ ${companionErrors.length} erreur(s) de compagnonnage:\n`);
    for (const err of companionErrors) {
      console.log(`  ❌ ${err.plantId} → ${err.companionId}`);
      console.log(`     Problème: ${err.issue}\n`);
    }
  }

  // ─── Résumé ───
  console.log('═'.repeat(50));
  if (hasErrors) {
    console.log('❌ VALIDATION ÉCHOUÉE\n');
    process.exit(1);
  } else {
    console.log('✅ TOUTE LA VALIDATION PASSÉE\n');
    process.exit(0);
  }
}

main();
