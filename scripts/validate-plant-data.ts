#!/usr/bin/env npx tsx
/**
 * Script de validation des données d'arbres dans HologramEvolution.tsx
 * Valide uniquement TREE_CARDS pour les règles spécifiques aux arbres
 */

import * as fs from 'fs';
import * as path from 'path';

const FILE_PATH = path.join(__dirname, '../src/components/game/HologramEvolution.tsx');

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

function main() {
  console.log('🔍 Validation des données d\'arbres...\n');

  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Fichier non trouvé: ${FILE_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(FILE_PATH, 'utf-8');
  const entries = extractTreeEntries(content);

  console.log(`📋 ${entries.size} entrées trouvées dans TREE_CARDS\n`);

  const errors: ValidationError[] = [];

  for (const [id, data] of entries) {
    const treeErrors = validateTree(id, data);
    errors.push(...treeErrors);
  }

  if (errors.length === 0) {
    console.log('✅ Validation PASSÉE - Aucune erreur trouvée\n');
    process.exit(0);
  }

  console.log(`❌ ${errors.length} erreur(s) trouvée(s):\n`);
  for (const err of errors) {
    console.log(`❌ ${err.treeId}.${err.field}`);
    console.log(`   Attendu: ${err.expected}`);
    console.log(`   Actuel: ${JSON.stringify(err.actual)}\n`);
  }

  process.exit(1);
}

main();
