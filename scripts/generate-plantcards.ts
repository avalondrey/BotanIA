/**
 * Script de génération automatique des PlantCards depuis CARD_DATA
 * Utilise les données des fichiers src/data/graines/ pour générer les entrées manquantes
 */

import * as fs from 'fs';
import * as path from 'path';

const HOLO_PATH = path.join(__dirname, '../src/components/game/HologramEvolution.tsx');
const DATA_GRAINES_PATH = path.join(__dirname, '../src/data/graines');

const PLANT_DATA_TEMPLATE = `  // ─── {NAME} ───
  {id}: {
    id: '{id}',
    tBase: {tBase},
    tCap: {tCap},
    stageGDD: [{stageGDD}],
    kc: {kc},
    waterNeedMmPerDay: {waterNeed},
    minSoilTempForSowing: {minSoil},
    optimalSoilTemp: {optSoil},
    lightNeedHours: {light},
    stageDurations: [{stageDurations}],
    companions: [],
    diseaseRisks: [
      {
        name: 'Oidium',
        emoji: '🌞',
        triggerConditions: 'HR 60-80%, T20-30C',
        prevention: 'Good air circulation',
      },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer'],
    totalDaysToHarvest: {totalDays},
    plantFamily: '{family}',
    droughtResistance: 0.40,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
  },`;

const CATEGORY_MAP: Record<string, string> = {
  hedge: 'hedge',
  vegetable: 'vegetable',
  'fruit-tree': 'fruit-tree',
  'forest-tree': 'forest-tree',
};

const FAMILY_MAP: Record<string, string> = {
  Solanaceae: 'Solanaceae', Cucurbitaceae: 'Cucurbitaceae', Fabaceae: 'Fabaceae',
  Brassicaceae: 'Brassicaceae', Asteraceae: 'Asteraceae', Apiaceae: 'Apiaceae',
  Amaranthaceae: 'Amaranthaceae', Lamiaceae: 'Lamiaceae', Rosaceae: 'Rosaceae',
};

function getDefaultValues(category: string) {
  if (category === 'hedge') {
    return {
      tBase: 5, tCap: 30, stageGDD: '100, 300, 600, 1000',
      kc: 0.70, waterNeed: 3.0, minSoil: 5, optSoil: 18, light: 6,
      stageDurations: '21, 40, 60, 90', totalDays: 200, family: 'Rosaceae',
    };
  }
  if (category === 'fruit-tree') {
    return {
      tBase: 7, tCap: 30, stageGDD: '200, 400, 800, 1500',
      kc: 0.85, waterNeed: 3.5, minSoil: 8, optSoil: 18, light: 7,
      stageDurations: '45, 90, 180, 365', totalDays: 1825, family: 'Rosaceae',
    };
  }
  // vegetable default
  return {
    tBase: 10, tCap: 30, stageGDD: '50, 150, 300, 450',
    kc: 0.95, waterNeed: 4.0, minSoil: 12, optSoil: 20, light: 7,
    stageDurations: '14, 28, 35, 42', totalDays: 60, family: 'Solanaceae',
  };
}

function extractCardData(filePath: string): Record<string, string> | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  const idMatch = content.match(/id:\s*["']([^"']+)["']/);
  const categoryMatch = content.match(/category:\s*["']([^"']+)["']/);
  const nameMatch = content.match(/name:\s*["']([^"']+)["']/);

  if (!idMatch || !categoryMatch) return null;

  const id = idMatch[1].replace(/-[a-z]+$/, ''); // Remove variety suffix
  const category = categoryMatch[1];
  const name = nameMatch ? nameMatch[1] : id;

  const conditions = content.match(/conditions:\s*\{[^}]*temperature:\s*\{[^}]*base:\s*(\d+)[^}]*optimal:\s*(\d+)[^}]*max:\s*(\d+)/s);
  const period = content.match(/period:\s*\{[^}]*cycleDays:\s*(\d+)/s);

  const defaults = getDefaultValues(category);

  return {
    id,
    name,
    category,
    tBase: conditions ? conditions[1] : String(defaults.tBase),
    tCap: conditions ? conditions[3] : String(defaults.tCap),
    stageGDD: defaults.stageGDD,
    kc: defaults.kc,
    waterNeed: defaults.waterNeed,
    minSoil: defaults.minSoil,
    optSoil: defaults.optSoil,
    light: defaults.light,
    stageDurations: defaults.stageDurations,
    totalDays: period ? period[1] : defaults.totalDays,
    family: defaults.family,
  };
}

function main() {
  console.log('🔧 Génération automatique des PlantCards depuis CARD_DATA...\n');

  if (!fs.existsSync(DATA_GRAINES_PATH)) {
    console.error(`❌ Dossier non trouvé: ${DATA_GRAINES_PATH}`);
    process.exit(1);
  }

  // Read current HologramEvolution
  const holoContent = fs.readFileSync(HOLO_PATH, 'utf-8');

  // Get existing IDs
  const existingIds = new Set<string>();
  const entryRegex = /^\s*['"]?([a-z][a-z0-9-]*)['"]?\s*:\s*\{/gm;
  let match;
  while ((match = entryRegex.exec(holoContent)) !== null) {
    existingIds.add(match[1]);
  }

  // Scan all CARD_DATA files
  const newEntries: string[] = [];
  const dirs = fs.readdirSync(DATA_GRAINES_PATH, { withFileTypes: true });

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const shopPath = path.join(DATA_GRAINES_PATH, dir.name);

    try {
      const files = fs.readdirSync(shopPath);
      for (const file of files) {
        if (!file.endsWith('.ts')) continue;
        const filePath = path.join(shopPath, file);
        const cardData = extractCardData(filePath);

        if (cardData && !existingIds.has(cardData.id)) {
          console.log(`  📝 ${cardData.id} (${cardData.category})`);
          newEntries.push(cardData);
        }
      }
    } catch (e) {
      // Skip if can't read directory
    }
  }

  if (newEntries.length === 0) {
    console.log('✅ Aucune nouvelle entrée à générer\n');
    process.exit(0);
  }

  console.log(`\n📋 ${newEntries.length} entrée(s) à générer\n`);

  const args = process.argv.slice(2);
  if (!args.includes('--fix')) {
    console.log('ℹ️  Pour écrire les entrées, utilisez: --fix\n');
    process.exit(0);
  }

  // Generate entries
  const generatedEntries = newEntries.map(data => {
    return `  // ─── ${data.name.toUpperCase()} ───
  ${data.id}: {
    id: '${data.id}',
    plantCategory: '${CATEGORY_MAP[data.category] || 'vegetable'}',
    tBase: ${data.tBase},
    tCap: ${data.tCap},
    stageGDD: [${data.stageGDD}],
    kc: ${data.kc},
    waterNeedMmPerDay: ${data.waterNeed},
    minSoilTempForSowing: ${data.minSoil},
    optimalSoilTemp: ${data.optSoil},
    lightNeedHours: ${data.light},
    stageDurations: [${data.stageDurations}],
    companions: [],
    diseaseRisks: [
      {
        name: 'Oidium',
        emoji: '🌞',
        triggerConditions: 'HR 60-80%, T20-30C',
        prevention: 'Good air circulation',
      },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer'],
    totalDaysToHarvest: ${data.totalDays},
    plantFamily: '${data.family}',
    droughtResistance: 0.40,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
  },`;
  }).join('\n\n');

  console.log('✅ Entrées générées (à copier manuellement dans HologramEvolution.tsx):\n');
  console.log(generatedEntries);
}

main();