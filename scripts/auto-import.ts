#!/usr/bin/env tsx
// Auto-Import CARD_DATA -> HologramEvolution.tsx
// =============================================
//
// Usage:
//   npx tsx scripts/auto-import.ts [--dry-run] [--check-only]
//
// Options:
//   --dry-run      Show changes without applying
//   --check-only   Only check if updates are available
//   (default)     Show summary of available changes
//   --write       Apply changes and create commit
//

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOLOCRAM_PATH = path.resolve(__dirname, "../src/components/game/HologramEvolution.tsx");
const DATA_ROOT = path.resolve(__dirname, "../src/data");

// ─── File Finder (native, no dependencies) ──────────────────────────────────

function findFiles(dir: string, pattern: RegExp, results: string[] = [], rel: string = ""): string[] {
  if (!fs.existsSync(dir)) return results;
  const prefix = rel ? rel + "/" : "";
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, pattern, results, prefix + entry.name);
    } else if (pattern.test(entry.name)) {
      results.push(prefix + entry.name);
    }
  }
  return results;
}

// ─── Type Definitions ───────────────────────────────────────────────────────

interface GameData {
  stageDurations: number[];
  realDaysToHarvest: number | null;
  optimalTemp: number | [number, number] | { min: number; max: number };
  waterNeed: number;
  lightNeed: number;
}

interface Conditions {
  temperature: {
    base: number;
    optimal: number | { min: number; max: number };
    max: number;
    frostResistance?: number;
  };
  waterNeeds: string;
  soil?: { ph: string; type: string; amendment?: string };
  soilType?: string;
  soilPH?: string;
  light: { needs: number };
}

interface CardData {
  id: string;
  plantDefId: string;
  shopId: string;
  category: string;
  name: string;
  emoji: string;
  price: number;
  gameData: GameData;
  conditions: Conditions;
  period?: {
    sowing?: { indoor?: string[] | null; outdoor?: string[] | null };
    flowering?: string[];
    harvest?: string[];
    planting?: string[];
    dormancy?: string[];
  };
  companions?: string[];
  enemies?: string[];
  growth?: {
    firstHarvest?: string | null;
    fullProduction?: string | null;
    matureTreeHeight?: string | null;
    spread?: string | null;
    lifespan?: string | null;
    annualGrowth?: string;
  };
  pollination?: { type: string; pollinator?: string | null; note?: string };
  yield?: {
    amount?: string | null;
    fruitSize?: string | null;
    fruitsPerTree?: string | null;
    harvestWindow?: string | null;
    conservation?: string;
  };
  notes?: string;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

function stripTsSyntax(str: string): string {
  // Remove all " as const" from the string — breaks new Function() parsing
  // Replace "value" as const with "value" and restore the comma if needed
  let result = str;
  // Handle "something" as const,  (with comma) → "something",
  result = result.replace(/"([^"]*)"\s+as\s+const\s*,/g, '"$1",');
  // Handle "something" as const\n  (at end of line, no comma) → "something",
  result = result.replace(/"([^"]*)"\s+as\s+const\s*\n/g, '"$1",\n');
  // Handle "something" as const}  (at end of object) → "something"}
  result = result.replace(/"([^"]*)"\s+as\s+const\s*\}/g, '"$1"}');
  // Handle "something" as const]  (at end of array) → "something"]
  result = result.replace(/"([^"]*)"\s+as\s+const\s*\]/g, '"$1"]');
  return result;
}

function parseFile(filePath: string): CardData | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(/export\s+const\s+CARD_DATA\s*=\s*(\{[\s\S]*?\})\s*;?\s*export\s+default/m);
    if (!match) return null;
    const clean = stripTsSyntax(match[1]);
    const fn = new Function(`return (${clean})`);
    const data = fn();
    if (data && data.id && data.plantDefId && data.gameData) return data as CardData;
    return null;
  } catch (e) {
    console.warn(`  Parse error in ${filePath}: ${e}`);
    return null;
  }
}

function loadAllCardData(): { vegetables: CardData[]; trees: CardData[] } {
  const seedFiles = findFiles(path.join(DATA_ROOT, "graines"), /\.ts$/);
  const treeFiles = findFiles(path.join(DATA_ROOT, "arbres"), /\.ts$/);

  const vegetables: CardData[] = [];
  const trees: CardData[] = [];

  const TREE_CATEGORIES = ['fruit-tree', 'forest-tree', 'ornamental-tree', 'ornamental-hedge', 'hedge'];

  for (const f of seedFiles) {
    const data = parseFile(path.join(DATA_ROOT, "graines", f));
    if (data) {
      // Use category from CARD_DATA to determine if it's a tree
      if (TREE_CATEGORIES.includes(data.category)) {
        trees.push(data);
      } else {
        vegetables.push(data);
      }
    }
  }

  for (const f of treeFiles) {
    const data = parseFile(path.join(DATA_ROOT, "arbres", f));
    if (data) {
      // Use category from CARD_DATA - all arbres are trees by default
      if (TREE_CATEGORIES.includes(data.category) || data.category === 'fruit-tree' || data.category === 'forest-tree') {
        trees.push(data);
      } else {
        vegetables.push(data);
      }
    }
  }

  return { vegetables, trees };
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function getOptimalTemp(data: CardData): [number, number] {
  const o = data.gameData.optimalTemp;
  if (Array.isArray(o)) return o as [number, number];
  if (typeof o === "object" && o && "min" in o) return [o.min, o.max];
  if (typeof o === "number") return [o - 5, o + 7];
  return [18, 28];
}

function getBaseTemp(data: CardData): number {
  const base = data.conditions?.temperature?.base;
  return typeof base === "number" ? base : 10;
}

function parseTreeNum(str: string | null | undefined, fallback: number): number {
  if (!str) return fallback;
  const m = String(str).match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : fallback;
}

// ─── Validation des données d'arbres ────────────────────────────────────────

interface ValidationRule {
  min?: number;
  max?: number;
  valid?: number[];
}

const TREE_VALIDATION: Record<string, { totalDays: ValidationRule; firstHarvest: ValidationRule }> = {
  // Fruitiers à noyau (pêche, cerise, prune, abricot)
  stoneFruits: { totalDays: { min: 1095, max: 1460 }, firstHarvest: { valid: [3, 4] } },
  // Fruitiers à pepins (pomme, poire, coing)
  pomeFruits: { totalDays: { min: 1825, max: 1825 }, firstHarvest: { valid: [5] } },
  // Agrumes
  citrus: { totalDays: { min: 1460, max: 1460 }, firstHarvest: { valid: [4] } },
  // Noisetier
  hazelnut: { totalDays: { min: 2190, max: 2190 }, firstHarvest: { valid: [6] } },
  // Noyer
  walnut: { totalDays: { min: 2920, max: 2920 }, firstHarvest: { valid: [8] } },
  // Petits fruits / arbustes à fruits (groseille, cassis, caseille, josta, myrtille)
  berryShrubs: { totalDays: { min: 117, max: 365 }, firstHarvest: { valid: [1, 2] } },
  // Arbres forestiers/ornement
  forestTrees: { totalDays: { min: 5475, max: 10950 }, firstHarvest: { valid: [15, 20, 25, 30] } },
};

const STONE_FRUITS = ['peach', 'plum', 'cherry', 'apricot'];
const POME_FRUITS = ['apple', 'pear', 'quince'];
const CITRUS = ['orange', 'lemon', 'grapefruit', 'lime', 'mandarin', 'kumquat'];
const HAZELNUT = ['hazelnut'];
const WALNUT = ['walnut'];
const BERRY_SHRUBS = ['blackcurrant', 'redcurrant', 'whitecurrant', 'currant', 'gooseberry', 'casseille', 'josta', 'blueberry', 'cranberry', 'raspberry', 'blackberry'];
const HEDGE_SHRUBS = ['photinia', 'eleagnus', 'laurus', 'cypress', 'thuya', 'ivy', 'escallonia', 'cortland', 'cupressus'];
const FOREST_TREES = ['oak', 'pine', 'maple', 'birch', 'magnolia', 'spruce', 'fir', 'cedar', 'larch', 'beech'];

function getTreeCategory(treeId: string): string {
  if (STONE_FRUITS.includes(treeId)) return 'stoneFruits';
  if (POME_FRUITS.includes(treeId)) return 'pomeFruits';
  if (CITRUS.includes(treeId)) return 'citrus';
  if (HAZELNUT.includes(treeId)) return 'hazelnut';
  if (WALNUT.includes(treeId)) return 'walnut';
  if (BERRY_SHRUBS.includes(treeId)) return 'berryShrubs';
  if (HEDGE_SHRUBS.includes(treeId)) return 'berryShrubs';  // Utilise même règle pour les haies
  return 'forestTrees';
}

function validateAndFixTreeData(plantDefId: string, data: CardData, sd: number[], existingFirstHarvest: number): { totalDays: number; firstHarvestYears: number; warnings: string[] } {
  const warnings: string[] = [];
  const category = getTreeCategory(plantDefId);
  const rules = TREE_VALIDATION[category];

  // Calculer totalDays
  let totalDays = data.gameData.realDaysToHarvest ?? Math.round(sd.reduce((a, b) => a + b, 0) * 4);

  // Valider et corriger totalDays
  if (rules) {
    if (rules.totalDays.min !== undefined && rules.totalDays.max !== undefined) {
      if (totalDays < rules.totalDays.min || totalDays > rules.totalDays.max) {
        warnings.push(`totalDays ${totalDays} hors plage [${rules.totalDays.min}-${rules.totalDays.max}] pour ${category}, utilisé ${rules.totalDays.min}`);
        totalDays = rules.totalDays.min;
      }
    }
  }

  // Calculer firstHarvestYears correct
  let firstHarvestYears = existingFirstHarvest;
  const expectedFirstHarvest = Math.round(totalDays / 365);
  if (firstHarvestYears !== expectedFirstHarvest) {
    warnings.push(`firstHarvestYears corrigé: ${firstHarvestYears} → ${expectedFirstHarvest} (totalDays/365)`);
    firstHarvestYears = expectedFirstHarvest;
  }

  return { totalDays, firstHarvestYears, warnings };
}

// ─── Fin Validation ───────────────────────────────────────────────────────────

function companionsToRelations(c: CardData["companions"], e: CardData["enemies"]) {
  const out: { plantId: string; type: "beneficial" | "harmful"; reason?: string }[] = [];
  for (const v of c ?? []) out.push({ plantId: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), type: "beneficial", reason: "Associe naturellement" });
  for (const v of e ?? []) out.push({ plantId: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), type: "harmful", reason: "Incompatible" });
  return out;
}

function guessFamily(id: string): string {
  const f: Record<string, string> = {
    // Solanaceae
    tomato: "Solanaceae", pepper: "Solanaceae", eggplant: "Solanaceae", potato: "Solanaceae", goji: "Solanaceae", lycium: "Solanaceae",
    // Cucurbitaceae
    cucumber: "Cucurbitaceae", zucchini: "Cucurbitaceae", squash: "Cucurbitaceae", pumpkin: "Cucurbitaceae", melon: "Cucurbitaceae", watermelon: "Cucurbitaceae",
    // Fabaceae
    bean: "Fabaceae", pea: "Fabaceae", lentil: "Fabaceae", chickpea: "Fabaceae", faba: "Fabaceae",
    // Brassicaceae
    radish: "Brassicaceae", cabbage: "Brassicaceae", kale: "Brassicaceae", turnip: "Brassicaceae", broccoli: "Brassicaceae", cauliflower: "Brassicaceae",
    // Asteraceae
    lettuce: "Asteraceae", sunflower: "Asteraceae", artichoke: "Asteraceae", endive: "Asteraceae", chicory: "Asteraceae",
    // Apiaceae
    carrot: "Apiaceae", parsley: "Apiaceae", celery: "Apiaceae", dill: "Apiaceae", fennel: "Apiaceae", coriander: "Apiaceae",
    // Amaranthaceae
    spinach: "Amaranthaceae", chard: "Amaranthaceae", quinoa: "Amaranthaceae", amaranth: "Amaranthaceae", beet: "Amaranthaceae",
    // Lamiaceae
    basil: "Lamiaceae", mint: "Lamiaceae", thyme: "Lamiaceae", sage: "Lamiaceae", oregano: "Lamiaceae", rosemary: "Lamiaceae", lavender: "Lamiaceae",
    // Rosaceae fruits
    strawberry: "Rosaceae", apple: "Rosaceae", pear: "Rosaceae", cherry: "Rosaceae", apricot: "Rosaceae", plum: "Rosaceae", peach: "Rosaceae", quince: "Rosaceae", almond: "Rosaceae", blackberry: "Rosaceae", raspberry: "Rosaceae", hawthorn: "Rosaceae", sorbus: "Rosaceae", amelanchier: "Rosaceae",
    // Rutaceae
    orange: "Rutaceae", lemon: "Rutaceae", grapefruit: "Rutaceae", lime: "Rutaceae", mandarin: "Rutaceae", kumquat: "Rutaceae",
    // Juglandaceae
    walnut: "Juglandaceae", hazelnut: "Juglandaceae", pecan: "Juglandaceae", chestnut: "Juglandaceae",
    // Fagaceae
    oak: "Fagaceae", beech: "Fagaceae",
    // Betulaceae
    birch: "Betulaceae", alder: "Betulaceae", hornbeam: "Betulaceae",
    // Sapindaceae
    maple: "Sapindaceae",
    // Pinaceae
    pine: "Pinaceae", spruce: "Pinaceae", fir: "Pinaceae", cedar: "Pinaceae", larch: "Pinaceae",
    // Autres arbres/arbustes
    magnolia: "Magnoliaceae", fig: "Moraceae", eleagnus: "Elaeagnaceae", laurus: "Lauraceae", cornus: "Cornaceae",
    blackcurrant: "Grossulariaceae", redcurrant: "Grossulariaceae", gooseberry: "Grossulariaceae", casseille: "Grossulariaceae", josta: "Grossulariaceae",
    olive: "Oleaceae", arbousier: "Ericaceae", blueberry: "Ericaceae", grape: "Vitaceae", akebia: "Lardizabalaceae", pomegranate: "Lythraceae",
    escallonia: "Escalloniaceae", cupressus: "Cupressaceae", cortland: "Rosaceae",
    rhubarb: "Polygonaceae", asparagus: "Asparagaceae", onion: "Amaryllidaceae", garlic: "Amaryllidaceae", leek: "Amaryllidaceae",
  };
  return f[id] ?? "Unknown";
}

function getHarvestSeason(data: CardData): string {
  const h = data.period?.harvest;
  if (!h) return "['autumn']";
  const s = h.map((m: string) => {
    if (/juin|juill|août|jui/i.test(m)) return "summer";
    if (/sept|oct|nov/i.test(m)) return "autumn";
    if (/mars|avr|mai|mar|apr/i.test(m)) return "spring";
    return "autumn";
  });
  return `['${[...new Set(s)].join("', '")}']`;
}

function getPlantMonths(data: CardData): string {
  if (data.period?.sowing?.indoor) return "[1, 2, 3]";
  if (data.period?.sowing?.outdoor) return "[3, 4, 5]";
  if (data.period?.planting) return "[10, 11, 2, 3]";
  return "[3, 4, 5]";
}

function buildDiseaseRisks(data: CardData): string {
  const risks: { name: string; emoji: string; trigger: string; prev: string }[] = [];
  if (data.category === "vegetable") {
    risks.push({ name: "Mildiou", emoji: "🌧️", trigger: "HR>90%, T10-25C, humidite", prev: "Aerer, eviter irrigation foliaire" });
    risks.push({ name: "Oidum", emoji: "🌞", trigger: "HR 60-80%, T15-25C", prev: "Bonne aeration, eviter exces azote" });
    risks.push({ name: "Botrytis", emoji: "🦠", trigger: "HR>85%, temp douce", prev: "Aerer, drainage" });
  } else if (data.category === "fruit-tree") {
    risks.push({ name: "Tavelure", emoji: "🍂", trigger: "HR>85%, T15-25C, printemps", prev: "Taille aeree, varietes resistantes" });
    risks.push({ name: "Feu bacterien", emoji: "🔥", trigger: "T douce, humidite", prev: "Elagage urgent, steriliser outils" });
    risks.push({ name: "Moniliose", emoji: "🍒", trigger: "Humidite elevee apres fleur", prev: "Taille, elimination fruits atteints" });
  } else {
    risks.push({ name: "Cochenille", emoji: "🐛", trigger: "Temps sec, stress", prev: "Inspection, savon noir" });
    risks.push({ name: "Oidum", emoji: "🌞", trigger: "HR moderee, T15-25C", prev: "Bonne aeration" });
  }
  return risks.map(r =>
    `      { name: '${r.name}', emoji: '${r.emoji}', triggerConditions: '${r.trigger}', prevention: '${r.prev}' }`
  ).join(",\n");
}

function getCategoryFromData(data: CardData): string {
  const cat = data.category;
  // Map CARD_DATA categories to PlantCard categories
  if (cat === 'hedge' || cat === 'ornamental-hedge') return 'hedge';
  if (cat === 'forest-tree' || cat === 'ornamental-tree') return 'forest-tree';
  if (cat === 'fruit-tree') return 'fruit-tree';
  if (cat === 'vegetable') return 'vegetable';
  return 'vegetable';  // default
}

function buildVegetableEntry(data: CardData): string {
  const opt = getOptimalTemp(data);
  const base = getBaseTemp(data);
  const comps = companionsToRelations(data.companions, data.enemies);
  const sd = data.gameData.stageDurations;
  const totalDays = data.gameData.realDaysToHarvest ?? Math.round(sd.reduce((a, b) => a + b, 0) * 1.5);
  const kc = Math.max(0.70, Math.min(1.20, data.gameData.waterNeed / 4.0));
  const frostRes = data.conditions?.temperature?.frostResistance ?? -5;
  const drought = Math.max(0.3, Math.min(0.9, (frostRes + 25) / 40));

  const compStr = comps.map(c =>
    `      { plantId: '${c.plantId}', type: '${c.type}'${c.reason ? `, reason: '${c.reason}'` : "" }`
  ).join(",\n");

  const diseaseStr = buildDiseaseRisks(data);
  const plantCategory = getCategoryFromData(data);

  return `  // ─── ${data.name.toUpperCase()} ───
  ${data.plantDefId}: {
    id: '${data.plantDefId}',
    plantCategory: '${plantCategory}',
    tBase: ${base},
    tCap: ${opt[1] + 5},
    stageGDD: [${Math.round(sd[0] * 5)}, ${Math.round(sd[1] * 5)}, ${Math.round(sd[2] * 5)}, ${Math.round(sd[3] * 5)}],
    kc: ${kc.toFixed(2)},
    waterNeedMmPerDay: ${data.gameData.waterNeed},
    minSoilTempForSowing: ${base + 3},
    optimalSoilTemp: ${opt[0]},
    lightNeedHours: ${data.gameData.lightNeed},
    stageDurations: [${sd.join(", ")}],
    companions: [
${compStr}
    ],
    diseaseRisks: [
${diseaseStr}
    ],
    optimalPlantMonths: ${getPlantMonths(data)},
    harvestSeason: ${getHarvestSeason(data)},
    totalDaysToHarvest: ${totalDays},
    plantFamily: '${guessFamily(data.plantDefId)}',
    droughtResistance: ${drought.toFixed(2)},
    diseaseResistance: 0.50,
    pestResistance: 0.50,
  },`;
}

function buildTreeEntry(data: CardData): string {
  const opt = getOptimalTemp(data);
  const base = getBaseTemp(data);
  const comps = companionsToRelations(data.companions, data.enemies);
  const sd = data.gameData.stageDurations;
  const frostRes = data.conditions?.temperature?.frostResistance ?? -10;

  // Determine plantCategory from CARD_DATA category
  const cat = data.category;
  let plantCategory: string;
  let fruitEdible: boolean;
  if (cat === 'hedge' || cat === 'ornamental-hedge') {
    plantCategory = 'hedge';
    fruitEdible = false;
  } else if (cat === 'ornamental-tree' || cat === 'forest-tree') {
    plantCategory = 'forest-tree';
    fruitEdible = false;
  } else {
    plantCategory = 'fruit-tree';
    fruitEdible = true;
  }

  const firstHarvest = parseTreeNum(data.growth?.firstHarvest ?? "5 ans", 5);
  const height = parseTreeNum(data.growth?.matureTreeHeight ?? "8 m", 8);
  const spread = parseTreeNum(data.growth?.spread ?? "6 m", 6);
  const lifespan = parseTreeNum(data.growth?.lifespan ?? "100 ans", 100);
  const soilType = data.conditions?.soil?.type ?? data.conditions?.soilType ?? "Tous types";
  const soilPH = data.conditions?.soil?.ph ?? data.conditions?.soilPH ?? "6.0-7.0";

  // Valider et corriger les données d'arbre
  const { totalDays, firstHarvestYears, warnings } = validateAndFixTreeData(data.plantDefId, data, sd, firstHarvest);
  if (warnings.length > 0) {
    console.log(`  ⚠️ ${data.plantDefId}: ${warnings.join(", ")}`);
  }

  const compStr = comps.map(c =>
    `      { plantId: '${c.plantId}', type: '${c.type}'${c.reason ? `, reason: '${c.reason}'` : "" }`
  ).join(",\n");

  const diseaseStr = buildDiseaseRisks(data);

  return `  // ─── ${data.name.toUpperCase()} ───
  ${data.plantDefId}: {
    id: '${data.plantDefId}',
    plantCategory: '${plantCategory}',
    tBase: ${base},
    tCap: ${opt[1] + 5},
    stageGDD: [${Math.round(sd[0] * 5)}, ${Math.round(sd[1] * 5)}, ${Math.round(sd[2] * 5)}, ${Math.round(sd[3] * 5)}],
    kc: ${(data.gameData.waterNeed / 4.0).toFixed(2)},
    waterNeedMmPerDay: ${data.gameData.waterNeed},
    minSoilTempForSowing: ${base + 3},
    optimalSoilTemp: ${opt[0]},
    lightNeedHours: ${data.gameData.lightNeed},
    stageDurations: [${sd.join(", ")}],
    companions: [
${compStr}
    ],
    diseaseRisks: [
${diseaseStr}
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ${getHarvestSeason(data)},
    totalDaysToHarvest: ${totalDays},
    plantFamily: '${guessFamily(data.plantDefId)}',
    droughtResistance: ${(0.5 + frostRes / 50).toFixed(2)},
    diseaseResistance: 0.50,
    pestResistance: 0.50,
    matureTreeHeight: ${height},
    treeSpread: ${spread},
    treeLifespan: ${lifespan},
    firstHarvestYears: ${firstHarvestYears},
    annualYield: '${data.yield?.amount ?? "Variable"}',
    treeData: {
      pollinationType: '${data.pollination?.type ?? "Autofertile"}',
      pollinator: ${data.pollination?.pollinator ? `'${data.pollination.pollinator}'` : "null"},
      frostResistance: ${frostRes},
      soilType: '${soilType.slice(0, 80)}',
      soilPH: '${soilPH}',
      pruningNotes: '${(data.notes ?? "Taille minimale").slice(0, 100)}',
      fruitEdible: ${fruitEdible},
    },
  },`;
}

// ─── Already Integrated Check ─────────────────────────────────────────────

const PLANT_ALREADY_IN: Set<string> = new Set([
  "tomato", "carrot", "lettuce", "strawberry", "basil", "pepper",
  "cucumber", "zucchini", "bean", "pea", "spinach", "radish", "cabbage", "eggplant",
]);

const TREE_ALREADY_IN: Set<string> = new Set([
  "apple", "apple-gala", "apple-golden", "pear", "cherry", "hazelnut", "walnut",
  "orange", "lemon", "oak", "birch", "maple", "pine", "magnolia",
]);

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const checkOnly = args.includes("--check-only");
  const doWrite = args.includes("--write");

  console.log("🌱 BotanIA — Auto-Import CARD_DATA");
  console.log("═══════════════════════════════════\n");

  if (dryRun) console.log("🔍 Mode dry-run: aucun fichier ne sera modifie\n");
  if (checkOnly) console.log("🔍 Mode check-only: verification uniquement\n");
  if (doWrite) console.log("✏️  Mode write: application des changements\n");

  const { vegetables, trees } = loadAllCardData();

  const newVeggies = vegetables.filter(v => !PLANT_ALREADY_IN.has(v.plantDefId));
  const newTrees = trees.filter(t => !TREE_ALREADY_IN.has(t.plantDefId));

  console.log(`📦 CARD_DATA trouves:`);
  console.log(`   Graines/legumes: ${vegetables.length} (${newVeggies.length} nouveaux a integrer)`);
  console.log(`   Arbres: ${trees.length} (${newTrees.length} nouveaux a integrer)\n`);

  if (newVeggies.length > 0) {
    console.log("🥕 Nouveaux legumes:");
    for (const v of newVeggies) {
      console.log(`   • ${v.emoji} ${v.name} (${v.shopId}) → plantDefId: '${v.plantDefId}'`);
    }
    console.log();
  }

  if (newTrees.length > 0) {
    console.log("🌳 Nouveaux arbres:");
    for (const t of newTrees) {
      console.log(`   • ${t.emoji} ${t.name} (${t.shopId}) → plantDefId: '${t.plantDefId}'`);
    }
    console.log();
  }

  if (checkOnly) {
    process.exit(newVeggies.length === 0 && newTrees.length === 0 ? 0 : 1);
  }

  if (newVeggies.length === 0 && newTrees.length === 0) {
    console.log("✅ HologramEvolution.tsx est deja a jour !");
    process.exit(0);
  }

  if (dryRun) {
    console.log("\n📝 Code qui serait ajoute (PLANT_CARDS):");
    for (const v of newVeggies) {
      console.log(buildVegetableEntry(v));
    }
    console.log("\n📝 Code qui serait ajoute (TREE_CARDS):");
    for (const t of newTrees) {
      console.log(buildTreeEntry(t));
    }
    console.log("\n💡 Lancez --write pour appliquer.");
    process.exit(0);
  }

  if (!doWrite) {
    console.log("\n💡 Lancez --write pour appliquer les changements, ou --dry-run pour previsualiser.");
    process.exit(0);
  }

  // Apply changes
  console.log("✏️  Application des changements...\n");

  const content = fs.readFileSync(HOLOCRAM_PATH, "utf-8");
  let newContent = content;

  if (newVeggies.length > 0) {
    const marker = "// ═══ FIN PLANT_CARDS ═══";
    const vegEntries = newVeggies.map(v => buildVegetableEntry(v)).join("\n\n");
    if (content.includes(marker)) {
      newContent = newContent.replace(marker, `${vegEntries}\n\n${marker}`);
      console.log(`✅ ${newVeggies.length} legumes ajoutes a PLANT_CARDS`);
    } else {
      console.log("⚠️ Marqueure PLANT_CARDS non trouve — integration manuelle necessaire");
    }
  }

  if (newTrees.length > 0) {
    const marker = "// ═══ FIN TREE_CARDS ═══";
    const treeEntries = newTrees.map(t => buildTreeEntry(t)).join("\n\n");
    if (newContent.includes(marker)) {
      newContent = newContent.replace(marker, `${treeEntries}\n\n${marker}`);
      console.log(`✅ ${newTrees.length} arbres ajoutes a TREE_CARDS`);
    } else {
      console.log("⚠️ Marqueure TREE_CARDS non trouve — integration manuelle necessaire");
    }
  }

  fs.writeFileSync(HOLOCRAM_PATH, newContent, "utf-8");

  try {
    execSync("git add src/components/game/HologramEvolution.tsx", { stdio: "pipe" });
    const msg = `feat(holo): auto-import ${newVeggies.length} legumes et ${newTrees.length} arbres depuis CARD_DATA`;
    execSync(`git commit -m "${msg}"`, { stdio: "pipe" });
    console.log(`\n✅ Commit cree: "${msg}"`);
  } catch {
    console.log("\n⚠️ Git commit non effectue (verifiez l'etat git)");
  }

  console.log("\n✨ Auto-import termine !");
}

main().catch(err => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
