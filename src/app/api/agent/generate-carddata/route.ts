/**
 * API: POST /api/agent/generate-carddata
 * Generate CARD_DATA TypeScript file for a plantDefId
 * Request: { plantDefId: string }
 * Response: { success: boolean, code: string, shopId: string, varietyId: string, fileName: string }
 */

import { NextResponse } from 'next/server';
import { readFileIfExists } from '@/lib/agent/plant-integrator';
import path from 'path';
import { readdir, readFile } from 'fs/promises';

const BOTANIA_SRC = path.join(process.cwd(), 'src');
const CATALOG_PATH = path.join(BOTANIA_SRC, 'store/catalog.ts');
const DATA_GRAINES_PATH = path.join(BOTANIA_SRC, 'data/graines');

interface SeedInfo {
  id: string;
  plantDefId: string;
  shopId: string;
  name: string;
  emoji: string;
  price: number;
  grams: number;
  description: string;
}

/** Extrait les infos d'une variété depuis SEED_VARIETIES dans catalog.ts */
async function findSeedInCatalog(plantDefId: string): Promise<SeedInfo | null> {
  const content = await readFileIfExists(CATALOG_PATH);
  if (!content) return null;

  // Trouver le bloc correspondant au plantDefId dans SEED_VARIETIES
  const seedSection = content.match(/SEED_VARIETIES[\s\S]*?\];/)?.[0] || '';
  if (!seedSection) return null;

  // Découpons les entrées d'objet individuelles - chercher celles avec notre plantDefId
  // Pattern: cherche un bloc {...} contenant plantDefId: "X"
  const blockPattern = new RegExp(
    `\\{[^{}]*plantDefId:\\s*["']${plantDefId}["'][^{}]*\\}`,
    'gs'
  );
  const matches = [...seedSection.matchAll(blockPattern)];
  if (!matches.length) return null;

  // Prendre la première variété trouvée
  const block = matches[0][0];

  const get = (key: string): string | undefined => {
    const m = block.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
    return m ? m[1] : undefined;
  };
  const getNum = (key: string): number => {
    const m = block.match(new RegExp(`${key}:\\s*([\\d.]+)`));
    return m ? parseFloat(m[1]) : 0;
  };

  return {
    id: get('id') || plantDefId,
    plantDefId,
    shopId: get('shopId') || 'clause',
    name: get('name') || plantDefId,
    emoji: get('emoji') || '🌱',
    price: getNum('price') || 30,
    grams: getNum('grams') || 1,
    description: get('description') || '',
  };
}

/** Valeurs par défaut selon le type de plante */
function getPlantDefaults(plantDefId: string) {
  const defaults: Record<string, {
    category: string;
    emoji: string;
    tBase: number;
    tOptimal: number;
    tMax: number;
    tFrost: number;
    waterNeeds: string;
    rain: string;
    soilPh: string;
    soilType: string;
    lightNeeds: number;
    optimalLux: number;
    cycleDays: number;
    spacingBetween: number;
    spacingRows: number;
    yieldAmount: string;
    fruitWeight: string;
    conservation: string;
    taste: string;
    companions: string[];
    enemies: string[];
    waterNeed: number;
  }> = {
    tomato: {
      category: 'vegetable', emoji: '🍅',
      tBase: 12, tOptimal: 25, tMax: 35, tFrost: 0,
      waterNeeds: 'medium', rain: '40-50mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche, bien drainé',
      lightNeeds: 8, optimalLux: 45000,
      cycleDays: 90, spacingBetween: 60, spacingRows: 80,
      yieldAmount: '3-5kg/plante', fruitWeight: '100-200g',
      conservation: '7-10 jours',
      taste: 'Saveur sucrée et acidulée typique de la tomate',
      companions: ['basilic', 'carotte', 'persil'],
      enemies: ['pomme de terre', 'fenouil'],
      waterNeed: 4.0,
    },
    carrot: {
      category: 'vegetable', emoji: '🥕',
      tBase: 7, tOptimal: 18, tMax: 28, tFrost: -5,
      waterNeeds: 'medium', rain: '30-40mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Léger, sableux, profond',
      lightNeeds: 7, optimalLux: 30000,
      cycleDays: 85, spacingBetween: 5, spacingRows: 25,
      yieldAmount: '300-500g/m2', fruitWeight: '100-180g',
      conservation: '4-6 mois en cave',
      taste: 'Sucrée et croquante',
      companions: ['pois', 'laitue', 'oignon'],
      enemies: ['aneth', 'persil'],
      waterNeed: 3.0,
    },
    zucchini: {
      category: 'vegetable', emoji: '🥒',
      tBase: 15, tOptimal: 25, tMax: 35, tFrost: 2,
      waterNeeds: 'high', rain: '50-60mm/semaine',
      soilPh: '6.0-7.5', soilType: 'Riche, humide, bien drainé',
      lightNeeds: 8, optimalLux: 40000,
      cycleDays: 55, spacingBetween: 80, spacingRows: 100,
      yieldAmount: '5-10kg/plante', fruitWeight: '200-400g',
      conservation: '5-7 jours',
      taste: 'Neutre et délicat, idéal cuisiné',
      companions: ['haricot', 'maïs', 'tournesol'],
      enemies: ['fenouil', 'pomme de terre'],
      waterNeed: 5.0,
    },
    lettuce: {
      category: 'vegetable', emoji: '🥬',
      tBase: 5, tOptimal: 18, tMax: 25, tFrost: -3,
      waterNeeds: 'high', rain: '40-50mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche et frais',
      lightNeeds: 6, optimalLux: 25000,
      cycleDays: 60, spacingBetween: 25, spacingRows: 30,
      yieldAmount: '400-600g/plante', fruitWeight: null as any,
      conservation: '5-7 jours au frais',
      taste: 'Fraîche et légèrement amère',
      companions: ['carotte', 'radis', 'oignon'],
      enemies: ['persil', 'céleri'],
      waterNeed: 4.0,
    },
    cucumber: {
      category: 'vegetable', emoji: '🥒',
      tBase: 15, tOptimal: 25, tMax: 35, tFrost: 2,
      waterNeeds: 'high', rain: '50-60mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche, léger et humide',
      lightNeeds: 8, optimalLux: 40000,
      cycleDays: 60, spacingBetween: 50, spacingRows: 100,
      yieldAmount: '4-8kg/plante', fruitWeight: '150-300g',
      conservation: '7-10 jours au frais',
      taste: 'Fraîche et croquante, légèrement sucrée',
      companions: ['haricot', 'maïs', 'tournesol'],
      enemies: ['sauge', 'pomme de terre'],
      waterNeed: 5.0,
    },
    pepper: {
      category: 'vegetable', emoji: '🫑',
      tBase: 12, tOptimal: 25, tMax: 35, tFrost: 2,
      waterNeeds: 'medium', rain: '40-50mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche, drainé, chaud',
      lightNeeds: 8, optimalLux: 50000,
      cycleDays: 120, spacingBetween: 40, spacingRows: 60,
      yieldAmount: '1-2kg/plante', fruitWeight: '100-200g',
      conservation: '2-3 semaines au frais',
      taste: 'Doux et sucré, chair épaisse et croquante',
      companions: ['basilic', 'carotte', 'persil'],
      enemies: ['fenouil', 'brassicacées'],
      waterNeed: 3.5,
    },
    radish: {
      category: 'vegetable', emoji: '🫛',
      tBase: 5, tOptimal: 15, tMax: 25, tFrost: -5,
      waterNeeds: 'medium', rain: '25-35mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Léger, non compacté',
      lightNeeds: 6, optimalLux: 25000,
      cycleDays: 30, spacingBetween: 5, spacingRows: 20,
      yieldAmount: '200-400g/m2', fruitWeight: '20-40g',
      conservation: '1-2 semaines au frais',
      taste: 'Piquant et croquant, saveur typique du radis',
      companions: ['laitue', 'carotte', 'pois'],
      enemies: ['agastache', 'cerfeuil'],
      waterNeed: 2.5,
    },
    bean: {
      category: 'vegetable', emoji: '🫘',
      tBase: 12, tOptimal: 22, tMax: 30, tFrost: 2,
      waterNeeds: 'medium', rain: '30-40mm/semaine',
      soilPh: '6.0-7.5', soilType: 'Léger, bien drainé',
      lightNeeds: 7, optimalLux: 35000,
      cycleDays: 70, spacingBetween: 10, spacingRows: 40,
      yieldAmount: '400-700g/m2', fruitWeight: null as any,
      conservation: '3-5 jours au frais',
      taste: 'Tendre et légèrement sucré',
      companions: ['maïs', 'courge', 'carotte'],
      enemies: ['oignon', 'ail', 'poireau'],
      waterNeed: 3.0,
    },
    pea: {
      category: 'vegetable', emoji: '🟢',
      tBase: 5, tOptimal: 15, tMax: 22, tFrost: -7,
      waterNeeds: 'medium', rain: '30-40mm/semaine',
      soilPh: '6.0-7.5', soilType: 'Drainé, non compact',
      lightNeeds: 6, optimalLux: 25000,
      cycleDays: 75, spacingBetween: 5, spacingRows: 40,
      yieldAmount: '300-500g/m2', fruitWeight: null as any,
      conservation: '2-3 jours (frais) / sec indéfiniment',
      taste: 'Doux et sucré, saveur printanière',
      companions: ['carotte', 'navet', 'laitue'],
      enemies: ['oignon', 'ail', 'poireau'],
      waterNeed: 3.0,
    },
    basil: {
      category: 'vegetable', emoji: '🌿',
      tBase: 15, tOptimal: 25, tMax: 35, tFrost: 5,
      waterNeeds: 'medium', rain: '35-45mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche, drainé, chaud',
      lightNeeds: 8, optimalLux: 40000,
      cycleDays: 70, spacingBetween: 20, spacingRows: 30,
      yieldAmount: '100-300g/plant', fruitWeight: null as any,
      conservation: '3-5 jours (frais) / séché longtemps',
      taste: 'Aromatique et poivré, saveur anisée',
      companions: ['tomate', 'poivron', 'asperge'],
      enemies: ['sauge', 'thym'],
      waterNeed: 3.5,
    },
    eggplant: {
      category: 'vegetable', emoji: '🍆',
      tBase: 15, tOptimal: 28, tMax: 38, tFrost: 5,
      waterNeeds: 'medium', rain: '40-50mm/semaine',
      soilPh: '6.0-7.0', soilType: 'Riche, chaud, bien drainé',
      lightNeeds: 8, optimalLux: 50000,
      cycleDays: 120, spacingBetween: 60, spacingRows: 70,
      yieldAmount: '2-4kg/plante', fruitWeight: '200-500g',
      conservation: '1 semaine au frais',
      taste: 'Chair dense et légèrement amère, fondante à la cuisson',
      companions: ['haricot', 'persil', 'poivron'],
      enemies: ['fenouil', 'pomme de terre'],
      waterNeed: 4.0,
    },
    squash: {
      category: 'vegetable', emoji: '🎃',
      tBase: 15, tOptimal: 25, tMax: 35, tFrost: 2,
      waterNeeds: 'high', rain: '50-60mm/semaine',
      soilPh: '6.0-7.5', soilType: 'Riche, humide, profond',
      lightNeeds: 8, optimalLux: 40000,
      cycleDays: 100, spacingBetween: 100, spacingRows: 150,
      yieldAmount: '3-8kg/plante', fruitWeight: '1000-3000g',
      conservation: '3-6 mois en cave',
      taste: 'Douce et farineuse, saveur de noisette',
      companions: ['maïs', 'haricot', 'tournesol'],
      enemies: ['pomme de terre', 'fenouil'],
      waterNeed: 5.0,
    },
    cabbage: {
      category: 'vegetable', emoji: '🥦',
      tBase: 5, tOptimal: 18, tMax: 25, tFrost: -10,
      waterNeeds: 'high', rain: '50-60mm/semaine',
      soilPh: '6.5-7.5', soilType: 'Riche, compact et frais',
      lightNeeds: 7, optimalLux: 30000,
      cycleDays: 120, spacingBetween: 40, spacingRows: 60,
      yieldAmount: '1-3kg/tête', fruitWeight: null as any,
      conservation: '2-4 semaines au frais',
      taste: 'Légèrement sucré et croquant cru, fondant cuit',
      companions: ['aneth', 'céleri', 'sauge'],
      enemies: ['fraise', 'tomate'],
      waterNeed: 4.5,
    },
    spinach: {
      category: 'vegetable', emoji: '🥬',
      tBase: 5, tOptimal: 15, tMax: 22, tFrost: -8,
      waterNeeds: 'high', rain: '40-50mm/semaine',
      soilPh: '6.5-7.5', soilType: 'Riche en azote, frais',
      lightNeeds: 6, optimalLux: 25000,
      cycleDays: 50, spacingBetween: 10, spacingRows: 25,
      yieldAmount: '300-500g/m2', fruitWeight: null as any,
      conservation: '3-5 jours au frais',
      taste: 'Légèrement amer et ferreux, riche en fer',
      companions: ['fraise', 'pois', 'laitue'],
      enemies: ['betterave', 'quinoa'],
      waterNeed: 4.0,
    },
    strawberry: {
      category: 'vegetable', emoji: '🍓',
      tBase: 5, tOptimal: 20, tMax: 28, tFrost: -5,
      waterNeeds: 'medium', rain: '35-45mm/semaine',
      soilPh: '5.5-6.5', soilType: 'Léger, acide, bien drainé',
      lightNeeds: 7, optimalLux: 35000,
      cycleDays: 90, spacingBetween: 25, spacingRows: 40,
      yieldAmount: '300-500g/plante', fruitWeight: '15-30g',
      conservation: '2-3 jours au frais',
      taste: 'Très parfumée et sucrée, saveur de fraise des bois',
      companions: ['laitue', 'épinard', 'thym'],
      enemies: ['choux', 'fenouil'],
      waterNeed: 3.5,
    },
  };

  return defaults[plantDefId] || {
    category: 'vegetable', emoji: '🌱',
    tBase: 10, tOptimal: 22, tMax: 32, tFrost: 0,
    waterNeeds: 'medium', rain: '30-40mm/semaine',
    soilPh: '6.0-7.0', soilType: 'Sol bien drainé et riche en matière organique',
    lightNeeds: 7, optimalLux: 35000,
    cycleDays: 70, spacingBetween: 30, spacingRows: 50,
    yieldAmount: '1-3kg/plante', fruitWeight: '100-200g',
    conservation: '5-10 jours au frais',
    taste: 'Saveur fraîche et naturelle',
    companions: ['persil', 'basilic', 'carotte'],
    enemies: ['fenouil', 'ail'],
    waterNeed: 3.5,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toVarietyId(plantDefId: string, varietyName: string): string {
  // ex: "tomato" + "Brandywine" → "tomato-brandywine"
  return `${plantDefId}-${varietyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
}

function generateCardDataCode(seed: SeedInfo, defaults: ReturnType<typeof getPlantDefaults>): string {
  const varietyId = seed.id; // ex: "tomato-brandywine"
  const shopId = seed.shopId;
  const plantDefId = seed.plantDefId;
  const category = defaults.category;

  // Stages
  const stages = category === 'fruit-tree'
    ? Array.from({ length: 5 }, (_, i) => `"/trees/${shopId}/${varietyId}-stage-${i + 1}.png"`)
    : Array.from({ length: 6 }, (_, i) => `"/plants/${plantDefId}-stage-${i + 1}.png"`);

  const cycleDays = defaults.cycleDays;
  const stageCount = category === 'fruit-tree' ? 4 : 4;
  const stageBase = Math.floor(cycleDays / stageCount);
  const stageRemainder = cycleDays - stageBase * stageCount;
  const stageDurations = Array.from({ length: stageCount }, (_, i) =>
    i === stageCount - 1 ? stageBase + stageRemainder : stageBase
  );

  const companyLabel = capitalize(shopId);
  const companionStr = defaults.companions.map(c => `"${c}"`).join(', ');
  const enemiesStr = defaults.enemies.map(e => `"${e}"`).join(', ');

  // Sowing periods by base temp
  let indoorSowing = 'null';
  let outdoorSowing: string;
  if (defaults.tBase >= 12) {
    indoorSowing = '["1 mars", "15 avr"]';
    outdoorSowing = '["15 mai", "30 mai"]';
  } else if (defaults.tBase >= 7) {
    indoorSowing = 'null';
    outdoorSowing = '["15 fev", "15 aout"]';
  } else {
    indoorSowing = 'null';
    outdoorSowing = '["1 mars", "1 sept"]';
  }

  const harvestMonthStart = defaults.tBase >= 12 ? '"15 aout"' : '"15 mai"';
  const harvestMonthEnd = defaults.tBase >= 12 ? '"15 oct"' : '"15 nov"';

  const fruitWeightLine = defaults.fruitWeight
    ? `    fruitWeight: "${defaults.fruitWeight}",`
    : `    fruitsPerPlant: null,`;

  return `/**
 * ${seed.name} — ${companyLabel}
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "${varietyId}",
  plantDefId: "${plantDefId}",
  shopId: "${shopId}",
  category: "${category}" as const,
  name: "${seed.name}",
  emoji: "${seed.emoji}",

  // === IMAGE ASSETS ===
  packetImage: "/packets/${shopId}/packet-${varietyId}.png",
  cardImage: "/cards/seeds/${shopId}/${varietyId}.png",
  stages: [
${stages.map(s => `    ${s},`).join('\n')}
  ],

  // === PRIX & QUANTITE ===
  price: ${seed.price},
  gramsPerPacket: ${seed.grams},

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ${indoorSowing},
      outdoor: ${outdoorSowing},
    },
    harvest: [${harvestMonthStart}, ${harvestMonthEnd}],
    cycleDays: ${cycleDays},
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: ${defaults.tBase},
      optimal: ${defaults.tOptimal},
      max: ${defaults.tMax},
      frostResistance: ${defaults.tFrost},
    },
    waterNeeds: "${defaults.waterNeeds}" as const,
    rainRequired: "${defaults.rain}",
    irrigationNote: "Arrosage régulier, sol toujours frais mais pas saturé",

    soil: {
      ph: "${defaults.soilPh}",
      type: "${defaults.soilType}",
      compost: "Apport de compost avant plantation",
    },

    light: {
      needs: ${defaults.lightNeeds},
      optimalLux: ${defaults.optimalLux},
    },

    growthRate: "Croissance régulière en conditions optimales",
    spacingCm: { between: ${defaults.spacingBetween}, rows: ${defaults.spacingRows} },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: ${Math.round(cycleDays * 0.12)}, note: "Levée en ${Math.round(cycleDays * 0.1)}-${Math.round(cycleDays * 0.15)} jours" },
    growth: { days: ${Math.round(cycleDays * 0.4)}, note: "Développement foliaire" },
    maturation: { days: ${Math.round(cycleDays * 0.75)}, note: "Formation des fruits" },
    harvest: { days: ${cycleDays}, note: "Maturité et récolte" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "${defaults.yieldAmount}",
${fruitWeightLine}
    harvestPeriod: [${harvestMonthStart}, ${harvestMonthEnd}],
    conservation: "${defaults.conservation}",
  },

  // === QUALITES CULINAIRES ===
  taste: "${defaults.taste}",
  consumption: "Frais, cuisiné, conserves",
  nutrition: {
    calories: "Variable selon préparation",
    vitaminC: "Présente",
    fibers: "Modérée",
  },

  // === NOTES DE CULTURE ===
  notes: "${seed.description || `Variété ${seed.name} de qualité, cultivée par ${companyLabel}.`}",
  companions: [${companionStr}],
  enemies: [${enemiesStr}],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [${stageDurations.join(', ')}],
    realDaysToHarvest: ${cycleDays},
    optimalTemp: [${defaults.tBase + 3}, ${defaults.tMax - 5}],
    waterNeed: ${defaults.waterNeed},
    lightNeed: ${defaults.lightNeeds},
  },
};

export default CARD_DATA;
`;
}

export async function POST(request: Request) {
  try {
    const { plantDefId } = await request.json();

    if (!plantDefId) {
      return new Response(JSON.stringify({ success: false, error: 'plantDefId requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Vérifier si un CARD_DATA existe déjà
    let existingFile: string | null = null;
    try {
      const entries = await readdir(DATA_GRAINES_PATH, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const subDir = path.join(DATA_GRAINES_PATH, entry.name);
        const files = await readdir(subDir);
        for (const file of files) {
          if (!file.endsWith('.ts')) continue;
          const content = await readFile(path.join(subDir, file), 'utf-8');
          if (content.includes(`plantDefId: "${plantDefId}"`) || content.includes(`plantDefId: '${plantDefId}'`)) {
            existingFile = `src/data/graines/${entry.name}/${file}`;
          }
        }
      }
    } catch {}

    // Trouver la variété dans le catalog
    const seed = await findSeedInCatalog(plantDefId);
    if (!seed) {
      return new Response(JSON.stringify({
        success: false,
        error: `Aucune variété trouvée pour "${plantDefId}" dans SEED_VARIETIES. Ajoutez d'abord une entrée dans catalog.ts.`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const defaults = getPlantDefaults(plantDefId);
    const code = generateCardDataCode(seed, defaults);
    const fileName = `${seed.id}.ts`;
    const targetPath = `src/data/graines/${seed.shopId}/${fileName}`;

    return new Response(JSON.stringify({
      success: true,
      code,
      plantDefId,
      shopId: seed.shopId,
      varietyId: seed.id,
      fileName,
      targetPath,
      alreadyExists: !!existingFile,
      existingFile: existingFile || null,
      seedName: seed.name,
      message: existingFile
        ? `⚠️ Un CARD_DATA existe déjà: ${existingFile}`
        : `✅ Code généré pour ${seed.name} — prêt à valider`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
