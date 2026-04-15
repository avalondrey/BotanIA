/**
 * Generate PLANTS entry code for ai-engine.ts
 * Reads from SEED_VARIETIES or PLANTULES_LOCALES in catalog.ts
 */

import { readFile } from 'fs/promises';
import path from 'path';

const CATALOG_PATH = () => path.join(process.cwd(), 'src/store/catalog.ts');
const AI_ENGINE_PATH = () => path.join(process.cwd(), 'src/lib/ai-engine.ts');

interface PlantData {
  name: string;
  emoji: string;
  stageDurations: [number, number, number, number];
  optimalTemp: [number, number];
  waterNeed: number;
  lightNeed: number;
  realDaysToHarvest: number;
}

/**
 * Extract a plant data from catalog.ts for a given plantDefId
 * Searches both SEED_VARIETIES and PLANTULES_LOCALES arrays
 */
async function extractFromCatalog(plantDefId: string): Promise<PlantData | null> {
  const content = await readFile(CATALOG_PATH(), 'utf-8');

  // Find the position of plantDefId: "plantDefId" or 'plantDefId'
  const searchId = `plantDefId: "${plantDefId}"`;
  const searchId2 = `plantDefId: '${plantDefId}'`;
  let pos = content.indexOf(searchId);
  if (pos === -1) pos = content.indexOf(searchId2);
  if (pos === -1) return null;

  // The entry starts at the previous "{"
  const startBlock = content.lastIndexOf('{', pos);
  // Find the closing "}" that ends this entry (followed by , or whitespace+})
  // Walk forward from pos to find matching }
  let braceCount = 0;
  let entryStart = -1;
  let entryEnd = -1;
  let inString = false;
  let stringChar = '';
  let i = startBlock;

  // Find the opening { for this specific entry
  while (i >= 0) {
    const ch = content[i];
    if (ch === '"' || ch === "'") {
      if (!inString) {
        inString = true;
        stringChar = ch;
      } else if (ch === stringChar) {
        inString = false;
      }
    }
    if (!inString) {
      if (content[i] === '{') {
        entryStart = i;
        break;
      }
    }
    i--;
  }

  // Find the closing } for this entry
  braceCount = 0;
  inString = false;
  i = startBlock;
  while (i < content.length) {
    const ch = content[i];
    if ((ch === '"' || ch === "'") && (i === 0 || content[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = ch;
      } else if (ch === stringChar) {
        inString = false;
      }
    }
    if (!inString) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
      if (ch === '}' && braceCount === 0) {
        entryEnd = i + 1;
        break;
      }
    }
    i++;
  }

  if (entryStart === -1 || entryEnd === -1) return null;

  const block = content.slice(entryStart, entryEnd);

  const getNum = (key: string): number | undefined => {
    const m = block.match(new RegExp(`${key}:\\s*(\\d+(?:\\.\\d+)?)`));
    return m ? parseFloat(m[1]) : undefined;
  };

  const getArr = (key: string): [number, number, number, number] | undefined => {
    const m = block.match(new RegExp(`${key}:\\s*\\[(\\d+),\\s*(\\d+),\\s*(\\d+),\\s*(\\d+)\\]`));
    return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), parseInt(m[4])] : undefined;
  };

  const getArr2 = (key: string): [number, number] | undefined => {
    const m = block.match(new RegExp(`${key}:\\s*\\[(\\d+),\\s*(\\d+)\\]`));
    return m ? [parseInt(m[1]), parseInt(m[2])] : undefined;
  };

  const getStr = (key: string): string | undefined => {
    const m = block.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
    return m ? m[1] : undefined;
  };

  return {
    name: getStr('name') || plantDefId,
    emoji: getStr('emoji') || '🌱',
    stageDurations: getArr('stageDurations') || [7, 15, 14, 20],
    optimalTemp: getArr2('optimalTemp') || [15, 25],
    waterNeed: getNum('waterNeed') || 4.0,
    lightNeed: getNum('lightNeed') || 6,
    realDaysToHarvest: getNum('realDaysToHarvest') || 60,
  };
}

function plantDataToCode(plantDefId: string, data: PlantData): string {
  const { name, emoji, stageDurations, optimalTemp, waterNeed, lightNeed, realDaysToHarvest } = data;

  // Estimate crop coefficient from waterNeed (FAO ranges)
  const cropCoefficient = Math.min(1.2, Math.max(0.5, waterNeed / 6));

  // Optimal planting months from temperature
  const getOptimalMonths = (): number[] => {
    if (optimalTemp[0] >= 18) return [3, 4, 5]; // Warm season
    if (optimalTemp[1] <= 20) return [2, 3, 8, 9]; // Cool season
    return [3, 4, 5, 9, 10];
  };

  const optimalMonths = getOptimalMonths();

  const harvestSeason = optimalTemp[0] >= 18 ? 'summer'
    : optimalTemp[1] <= 22 ? 'spring,autumn'
    : 'spring,summer';

  // Plant family estimation for resistance values
  const brassicas = ['cabbage', 'broccoli', 'cauliflower', 'kale', 'brussels-sprouts'];
  const legumes = ['bean', 'pea', 'lentil', 'chickpea'];
  const isBrassica = brassicas.includes(plantDefId);
  const isLegume = legumes.includes(plantDefId);

  const diseaseResistance = isBrassica ? 40 : isLegume ? 60 : 50;
  const pestResistance = isBrassica ? 35 : isLegume ? 55 : 45;
  const droughtResistance = isLegume ? 0.65 : isBrassica ? 0.45 : 0.50;

  return `  ${plantDefId}: {
    id: "${plantDefId}",
    name: "${name}",
    emoji: "${emoji}",
    image: "/cards/card-${plantDefId}.png",
    stageDurations: [${stageDurations.join(', ')}],
    optimalTemp: [${optimalTemp[0]}, ${optimalTemp[1]}],
    waterNeed: ${waterNeed},
    lightNeed: ${lightNeed},
    harvestEmoji: "${emoji}",
    cropCoefficient: ${cropCoefficient.toFixed(2)},
    optimalPlantMonths: [${optimalMonths.join(', ')}],
    optimalSeasons: [${harvestSeason.split(',').map(s => `"${s.trim()}"`).join(', ')}],
    diseaseResistance: ${diseaseResistance},
    pestResistance: ${pestResistance},
    droughtResistance: ${droughtResistance.toFixed(2)},
    realDaysToHarvest: ${realDaysToHarvest},
  },`;
}

export async function generatePlantsCode(plantDefId: string): Promise<string> {
  const data = await extractFromCatalog(plantDefId);
  if (!data) {
    throw new Error(`Pas de données trouvées dans le catalogue pour "${plantDefId}"`);
  }
  return plantDataToCode(plantDefId, data);
}

export async function checkPlantsEntryExists(plantDefId: string): Promise<boolean> {
  try {
    const content = await readFile(AI_ENGINE_PATH(), 'utf-8');
    // Match both quoted and unquoted keys: 'sorrel': and sorrel:
    return content.includes(`'${plantDefId}':`) ||
           content.includes(`"${plantDefId}":`) ||
           content.includes(`${plantDefId}: {`) ||
           content.includes(`${plantDefId}:\n`) ||
           content.includes(`${plantDefId}: `);
  } catch {
    return false;
  }
}
