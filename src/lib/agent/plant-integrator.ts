/**
 * Plant Integrator — BotanIA Agent
 *
 * Scan 8-point check pour les plantes:
 * 1. PlantCard dans HologramEvolution.tsx
 * 2. Sprite images /stages/{plantDefId}/*.png
 * 3. CARD_DATA dans src/data/graines/
 * 4. Entrée boutique SEED_VARIETIES
 * 5. Entrée plantules PLANTULES_LOCALES
 * 6. Images packet/card boutique
 * 7. Entry dans ai-engine.ts (PLANTS)
 * 8. Données compagnonnage (companion-matrix)
 */

import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { getPlantCategory } from '@/data/plant-categories';
import { getPlantFamily } from '@/lib/botany-constants';
import { buildImagePrompt, type ImageAssetType, type CardDataInfo } from '@/lib/agent/image-prompt-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CheckStatus = '✅' | '❌' | '⚠️' | '❓';

export interface ImageAsset {
  type: ImageAssetType;
  expectedPath: string;       // chemin public attendu, ex: "/plants/tomato-stage-1.png"
  prompt: string;             // prompt manga détaillé pour génération
  foundPath?: string;         // chemin trouvé si existants
  status: CheckStatus;
  stageNumber?: number;       // 1-5 pour plant-stage, 1-5 pour tree-stage, 1-5 pour plantule
  shopId?: string;            // pour packet/card/pot/tree-stage
  varietyId?: string;         // ID de la variété (ex: "tomato-brandywine")
  stageGroup?: 'stage' | 'mature'; // pour plantule-stage et plantule-mature
}

export type { CardDataInfo };

export interface PlantCardDetails {
  plantCategory?: string;
  plantFamily?: string;
  tBase?: number;
  tCap?: number;
  kc?: number;
  waterNeedMmPerDay?: number;
  totalDaysToHarvest?: number;
  droughtResistance?: number;
  diseaseResistance?: number;
  pestResistance?: number;
  companions?: string[];
  diseaseRisks?: string[];
}

export interface PlantCheck {
  plantDefId: string;
  displayName: string;
  plantCategory?: string;
  catalogSource: 'SEED_VARIETIES' | 'PLANTULES_LOCALES' | 'BOTH' | 'UNKNOWN';
  dataFilePath?: string;
  cardDataPreview?: PlantCardDetails;
  cardDataInfo?: CardDataInfo;
  imageAssets: ImageAsset[];
  checks: {
    plantCard: { status: CheckStatus; details: string; filePath?: string };
    sprites: { status: CheckStatus; details: string; missing: number; total: number; folderPath?: string; presentFiles?: string[] };
    cardData: { status: CheckStatus; details: string; filePath?: string };
    seedVariety: { status: CheckStatus; details: string };
    plantule: { status: CheckStatus; details: string; catalogEntry: boolean; missing: number; total: number };
    packetImage: { status: CheckStatus; details: string; foundPath?: string };
    plantsEntry: { status: CheckStatus; details: string; filePath?: string };
    companionData: { status: CheckStatus; details: string; companions?: string[] };
  };
  overallStatus: '✅ COMPLET' | '⚠️ PARTIEL' | '❌ INCOMPLET';
  missingCount: number;
}

export interface ScanResult {
  timestamp: number;
  scannedCount: number;
  results: PlantCheck[];
  summary: {
    complete: number;
    partial: number;
    incomplete: number;
  };
}

export interface PlantCardGeneration {
  plantDefId: string;
  displayName: string;
  code: string; // Code PlantCard à insérer
  spritePrompt: string; // Prompt manga pour les sprites
}

// ─── Paths ───────────────────────────────────────────────────────────────────

const BOTANIA_SRC = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src');
const HOLOID_PATH = path.join(BOTANIA_SRC, 'components/game/HologramEvolution.tsx');
const AI_ENGINE_PATH = path.join(BOTANIA_SRC, 'lib/ai-engine.ts');
const CATALOG_PATH = path.join(BOTANIA_SRC, 'store/catalog.ts');
const COMPANION_PATH = path.join(BOTANIA_SRC, 'lib/companion-matrix.ts');
const DATA_GRAINES_PATH = path.join(BOTANIA_SRC, 'data/graines');
const DATA_ARBRES_PATH = path.join(BOTANIA_SRC, 'data/arbres');
const PUBLIC_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public');

// ─── Plant type constants ─────────────────────────────────────────────────────

const COLUMNAR_TREES = ['apple-colonnaire-amboise', 'plum-colonnaire-atlanta', 'pear-colonnaire-londres'];

// ─── Read files ─────────────────────────────────────────────────────────────

export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await readdir(dirPath);
    return true;
  } catch {
    return false;
  }
}

// ─── Check 1: PlantCard in HologramEvolution ─────────────────────────────────

async function checkPlantCard(plantDefId: string, content: string): Promise<{ status: CheckStatus; details: string; filePath?: string; cardData?: PlantCardDetails }> {
  // Chercher "id: 'zucchini'" ou 'zucchini' dans PLANT_CARDS
  const plantCardPatterns = [
    new RegExp(`${plantDefId}\\s*:\\s*{`, 'i'),  // unquoted key: photinia: {
    new RegExp(`['"]${plantDefId}['"]\\s*:\\s*{`, 'i'),  // quoted key: 'photinia': {
    new RegExp(`id:\\s*['"]${plantDefId}['"]`, 'i'),
  ];

  for (const pattern of plantCardPatterns) {
    const match = pattern.exec(content);
    if (match) {
      // Extraire les données de la PlantCard
      const cardData = extractPlantCardData(content, plantDefId);
      return {
        status: '✅',
        details: `PlantCard existe dans HologramEvolution.tsx`,
        filePath: 'src/components/game/HologramEvolution.tsx',
        cardData,
      };
    }
  }

  return { status: '❌', details: `PlantCard MANQUANTE pour "${plantDefId}"` };
}

/**
 * Extrait les données complètes d'une PlantCard depuis le contenu du fichier
 */
function extractPlantCardData(content: string, plantDefId: string): PlantCardDetails | undefined {
  try {
    // Trouver le bloc PlantCard complet - cherche la clé puis compte les accolades
    const keyPattern = `${plantDefId}\\s*:\\s*\\{`;
    const keyMatch = new RegExp(keyPattern, 'i').exec(content);
    if (!keyMatch) return undefined;

    const blockStart = keyMatch.index + keyMatch[0].length;
    let braceCount = 0;
    let blockEnd = blockStart;

    for (let i = blockStart; i < Math.min(content.length, blockStart + 50000); i++) {
      if (content[i] === '{') braceCount++;
      else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) { blockEnd = i + 1; break; }
      }
    }

    if (braceCount !== 0) return undefined;

    const block = content.substring(blockStart, blockEnd);
    const data: PlantCardDetails = {};

    const extract = (key: string): string | undefined => {
      const m = block.match(new RegExp(`${key}:\\s*([\\d.\\[\\]'",a-zA-Z-]+)`));
      return m ? m[1].trim() : undefined;
    };

    const extractNum = (key: string): number | undefined => {
      const v = extract(key);
      return v ? parseFloat(v) : undefined;
    };

    const extractArr = (key: string): string[] | undefined => {
      const v = extract(key);
      if (!v) return undefined;
      // extrait les chaînes entre quotes
      const matches = v.matchAll(/['"]([^'"]+)['"]/g);
      return [...matches].map(m => m[1]);
    };

    data.plantCategory = extract('plantCategory')?.replace(/['"]/g, '') || extract('plantCategory');
    data.plantFamily = extract('plantFamily')?.replace(/['"]/g, '') || undefined;
    data.tBase = extractNum('tBase');
    data.tCap = extractNum('tCap');
    data.kc = extractNum('kc');
    data.waterNeedMmPerDay = extractNum('waterNeedMmPerDay');
    data.totalDaysToHarvest = extractNum('totalDaysToHarvest');
    data.droughtResistance = extractNum('droughtResistance');
    data.diseaseResistance = extractNum('diseaseResistance');
    data.pestResistance = extractNum('pestResistance');
    data.companions = extractArr('companions');
    data.diseaseRisks = extractArr('diseaseRisks');

    return data;
  } catch {
    return undefined;
  }
}

// ─── Check 2: Sprite images (plant stages) ──────────────────────────────────

async function checkSprites(plantDefId: string, isTree: boolean = false): Promise<{ status: CheckStatus; details: string; missing: number; total: number; presentFiles?: string[] }> {
  // Check public/plants/{plantDefId}-stage-{n}.png for n=1-5 (vegetables)
  // Or public/trees/{shopId}/{varietyId}-stage-{n}.png for n=1-5 (trees)
  const presentFiles: string[] = [];
  const total = isTree ? 5 : 5;

  if (isTree) {
    // For trees, we check the trees folder - but we need to know the shopId/varietyId
    // This is handled in checkImageAssets which has access to cardData
    // Here we just return a generic check for /trees/ folder structure
    return { status: '⚠️', details: `Vérifié via checkImageAssets`, missing: 0, total: 0, presentFiles: [] };
  }

  for (let n = 1; n <= total; n++) {
    const filePath = path.join(PUBLIC_ROOT, 'plants', `${plantDefId}-stage-${n}.png`);
    try {
      const content = await readFile(filePath);
      if (content) presentFiles.push(`/plants/${plantDefId}-stage-${n}.png`);
    } catch {
      // file doesn't exist
    }
  }

  const missing = total - presentFiles.length;

  if (missing === 0) {
    return { status: '✅', details: `${total}/${total} sprites présents dans /plants/`, missing: 0, total, presentFiles };
  } else if (missing <= 3) {
    return { status: '⚠️', details: `${presentFiles.length}/${total} sprites présents`, missing, total, presentFiles };
  } else {
    return { status: '❌', details: `${presentFiles.length}/${total} sprites présents`, missing, total, presentFiles };
  }
}

// ─── Check 3: CARD_DATA ───────────────────────────────────────────────────────

async function checkCardData(plantDefId: string): Promise<{ status: CheckStatus; details: string; filePath?: string }> {
  try {
    const searchDirs = [DATA_GRAINES_PATH, DATA_ARBRES_PATH];

    for (const baseDir of searchDirs) {
      const entries = await readdir(baseDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDir = path.join(baseDir, entry.name);
          const files = await readdir(subDir);

          for (const file of files) {
            if (file.endsWith('.ts')) {
              const filePath = path.join(subDir, file);
              const content = await readFile(filePath, 'utf-8');

              // Chercher plantDefId dans le fichier
              if (content.includes(`plantDefId: "${plantDefId}"`) || content.includes(`plantDefId: '${plantDefId}'`)) {
                return { status: '✅', details: `CARD_DATA trouvé: ${file}`, filePath };
              }
            }
          }
        }
      }
    }

    return { status: '❌', details: `CARD_DATA MANQUANT pour "${plantDefId}" dans src/data/graines/ et src/data/arbres/` };
  } catch {
    return { status: '❌', details: `Erreur lecture CARD_DATA` };
  }
}

// ─── Check 4: SEED_VARIETIES ────────────────────────────────────────────────

async function checkSeedVariety(plantDefId: string, catalogContent: string): Promise<{ status: CheckStatus; details: string }> {
  if (catalogContent.includes(`plantDefId: "${plantDefId}"`) || catalogContent.includes(`plantDefId: '${plantDefId}'`)) {
    return { status: '✅', details: `Entrée existe dans SEED_VARIETIES` };
  }
  return { status: '❌', details: `Pas d'entrée dans SEED_VARIETIES` };
}

// ─── Check 5: PLANTULES_LOCALES ─────────────────────────────────────────────

async function checkPlantule(plantDefId: string, catalogContent: string): Promise<{ status: CheckStatus; details: string; catalogEntry: boolean }> {
  if (catalogContent.includes('PLANTULES_LOCALES')) {
    // Chercher si plantDefId est dans PLANTULES_LOCALES
    const plantuleMatch = catalogContent.match(/PLANTULES_LOCALES[\s\S]*?\];/);
    if (plantuleMatch && plantuleMatch[0].includes(`"${plantDefId}"`)) {
      return { status: '✅', details: `Plantule existe dans PLANTULES_LOCALES`, catalogEntry: true };
    }
  }
  return { status: '❌', details: `Pas de plantule dans PLANTULES_LOCALES`, catalogEntry: false };
}

// ─── Check 5b: Plantule Images ──────────────────────────────────────────────

async function checkPlantuleImages(plantDefId: string): Promise<{ status: CheckStatus; details: string; missing: number; total: number }> {
  const totalImages = 10; // 5 stages + 5 mature
  let presentCount = 0;

  // Stages 1-5
  for (let n = 1; n <= 5; n++) {
    const filePath = path.join(PUBLIC_ROOT, 'plantules', `${plantDefId}-stage-${n}.png`);
    try { await readFile(filePath); presentCount++; } catch { /* missing */ }
  }

  // Mature 1-5
  for (let n = 1; n <= 5; n++) {
    const filePath = path.join(PUBLIC_ROOT, 'plantules', `${plantDefId}-mature-${n}.png`);
    try { await readFile(filePath); presentCount++; } catch { /* missing */ }
  }

  const missing = totalImages - presentCount;
  if (missing === 0) {
    return { status: '✅', details: `10/10 images plantule présentes`, missing: 0, total: totalImages };
  } else if (missing <= 5) {
    return { status: '⚠️', details: `${presentCount}/10 images plantule présentes`, missing, total: totalImages };
  } else {
    return { status: '❌', details: `${presentCount}/10 images plantule présentes`, missing, total: totalImages };
  }
}

// ─── Check 6: Packet image ───────────────────────────────────────────────────

async function checkPacketImage(plantDefId: string): Promise<{ status: CheckStatus; details: string }> {
  // Vérifier plusieurs chemins possibles pour les images packet
  const possiblePaths = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'public/packets', `${plantDefId}.png`),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'public/packets/clause', `${plantDefId}.png`),
    path.join(/*turbopackIgnore: true*/ process.cwd(), 'public/cards', `card-${plantDefId}.png`),
  ];

  for (const p of possiblePaths) {
    const content = await readFileIfExists(p);
    if (content) {
      return { status: '✅', details: `Image packet: ${path.basename(path.dirname(p))}/${path.basename(p)}` };
    }
  }

  return { status: '❓', details: `Image packet non trouvée (optionnel)` };
}

// ─── Check 7: PlantDefinition entry (via plant-db.ts → PLANT_CARDS + TREE_CARDS) ──

async function checkPlantsEntry(plantDefId: string, holoContent: string): Promise<{ status: CheckStatus; details: string }> {
  // Now plant-db.ts generates PlantDefinition from PLANT_CARDS + TREE_CARDS in HologramEvolution.tsx
  // So we check that the plant exists in either PLANT_CARDS or TREE_CARDS
  const plantCardPatterns = [
    new RegExp(`['"]${plantDefId}['"]\\s*:\\s*{`, 'i'),
  ];

  for (const pattern of plantCardPatterns) {
    if (pattern.test(holoContent)) {
      return { status: '✅', details: `Entry existe dans PLANT_CARDS ou TREE_CARDS (HologramEvolution.tsx)` };
    }
  }

  return { status: '❌', details: `Entry MANQUANTE dans HologramEvolution.tsx (PLANT_CARDS ou TREE_CARDS)` };
}

// ─── Check 8: Companion data ────────────────────────────────────────────────

async function checkCompanionData(plantDefId: string, companionContent: string): Promise<{ status: CheckStatus; details: string }> {
  if (companionContent.includes(plantDefId)) {
    return { status: '✅', details: `Données compagnonnage présentes` };
  }
  return { status: '❓', details: `Pas de données compagnonnage (optionnel)` };
}

// ─── Read CARD_DATA for a plant ──────────────────────────────────────────────

export async function readCardDataForPlant(plantDefId: string): Promise<CardDataInfo | null> {
  const searchDirs = [DATA_GRAINES_PATH, DATA_ARBRES_PATH];

  for (const baseDir of searchDirs) {
    try {
      const entries = await readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const subDir = path.join(baseDir, entry.name);
        const files = await readdir(subDir);
        for (const file of files) {
          if (!file.endsWith('.ts')) continue;
          const filePath = path.join(subDir, file);
          const content = await readFile(filePath, 'utf-8');
          if (!content.includes(`plantDefId: "${plantDefId}"`) && !content.includes(`plantDefId: '${plantDefId}'`)) continue;

          const get = (key: string): string | undefined => {
            const m = content.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
            return m ? m[1] : undefined;
          };

          const id = get('id') || plantDefId;
          const name = get('name') || plantDefId;
          const emoji = get('emoji') || '🌱';
          const shopId = get('shopId') || entry.name;
          // Map CARD_DATA categories to plant category
          let category: 'vegetable' | 'fruit-tree' | 'hedge' | 'forest-tree';
          if (content.includes('category:')) {
            if (content.includes('hedge') || content.includes('ornamental-hedge')) {
              category = 'hedge';
            } else if (content.includes('forest-tree') || content.includes('ornamental-tree')) {
              category = 'forest-tree';
            } else if (content.includes('fruit-tree')) {
              category = 'fruit-tree';
            } else {
              category = 'vegetable';
            }
          } else {
            category = content.includes('fruit-tree') ? 'fruit-tree' as const : 'vegetable' as const;
          }

          const stages: string[] = [];
          const stagesMatch = content.match(/stages:\s*\[([\s\S]*?)\]/);
          if (stagesMatch) {
            for (const m of stagesMatch[1].matchAll(/["']([^"']+)["']/g)) {
              stages.push(m[1]);
            }
          }

          return {
            id, plantDefId, shopId, category, name, emoji,
            packetImage: get('packetImage'),
            cardImage: get('cardImage'),
            potImage: get('potImage'),
            stages,
          };
        }
      }
    } catch { /* skip */ }
  }
  return null;
}

// ─── Check all image assets ───────────────────────────────────────────────────

async function checkImageAssets(cardData: CardDataInfo | null): Promise<ImageAsset[]> {
  const assets: ImageAsset[] = [];
  if (!cardData) return assets;

  const { plantDefId, id, shopId, category } = cardData;
  const isTree = category === 'fruit-tree' || category === 'forest-tree';

  // Plant/tree stages (5 for all - vegetables/jardin)
  const stageCount = 5;
  for (let n = 1; n <= stageCount; n++) {
    const expected = isTree
      ? `/trees/${shopId}/${id}-stage-${n}.png`
      : `/plants/${plantDefId}-stage-${n}.png`;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: isTree ? 'tree-stage' : 'plant-stage',
      expectedPath: expected,
      prompt: buildImagePrompt(isTree ? 'tree-stage' : 'plant-stage', cardData, n),
      foundPath,
      status: foundPath ? '✅' : '❌',
      stageNumber: n,
      shopId,
      varietyId: id,
    });
  }

  // Packet image
  if (cardData.packetImage) {
    const expected = cardData.packetImage;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'packet',
      expectedPath: expected,
      prompt: buildImagePrompt('packet', cardData),
      foundPath,
      status: foundPath ? '✅' : '❓',
      shopId,
      varietyId: id,
    });
  }

  // Card image
  if (cardData.cardImage) {
    const expected = cardData.cardImage;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'card',
      expectedPath: expected,
      prompt: buildImagePrompt('card', cardData),
      foundPath,
      status: foundPath ? '✅' : '❓',
      shopId,
      varietyId: id,
    });
  }

  // Pot image (trees only)
  if (cardData.potImage) {
    const expected = cardData.potImage;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'pot',
      expectedPath: expected,
      prompt: buildImagePrompt('pot', cardData),
      foundPath,
      status: foundPath ? '✅' : '❌',
      shopId,
      varietyId: id,
    });
  }

  // Evolution card (vegetables only)
  if (!isTree) {
    const expected = `/plants/card-${plantDefId}-evolution.png`;
    const fullPath = path.join(PUBLIC_ROOT, 'plants', `card-${plantDefId}-evolution.png`);
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'evolution-card',
      expectedPath: expected,
      prompt: buildImagePrompt('evolution-card', cardData),
      foundPath,
      status: foundPath ? '✅' : '❌',
      varietyId: id,
    });
  }

  // Plantule stages (5 stades croissance serre mini) — /plantules/{plantDefId}-stage-{n}.png
  for (let n = 1; n <= 5; n++) {
    const expected = `/plantules/${plantDefId}-stage-${n}.png`;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'plantule-stage',
      expectedPath: expected,
      prompt: buildImagePrompt('plantule-stage', cardData, n),
      foundPath,
      status: foundPath ? '✅' : '❌',
      stageNumber: n,
      varietyId: id,
      stageGroup: 'stage',
    });
  }

  // Plantule mature stages (5 stades fruits/maturation) — /plantules/{plantDefId}-mature-{n}.png
  for (let n = 1; n <= 5; n++) {
    const expected = `/plantules/${plantDefId}-mature-${n}.png`;
    const fullPath = path.join(PUBLIC_ROOT, expected.replace(/^\//, ''));
    let foundPath: string | undefined;
    try { await readFile(fullPath); foundPath = expected; } catch { /* missing */ }
    assets.push({
      type: 'plantule-mature',
      expectedPath: expected,
      prompt: buildImagePrompt('plantule-mature', cardData, n),
      foundPath,
      status: foundPath ? '✅' : '❌',
      stageNumber: n,
      varietyId: id,
      stageGroup: 'mature',
    });
  }

  return assets;
}

// ─── Get all plantDefIds to scan ────────────────────────────────────────────

interface PlantDefIdEntry {
  id: string;
  name: string;
  catalogSource: 'SEED_VARIETIES' | 'PLANTULES_LOCALES' | 'BOTH';
  displayName?: string;
}

async function getAllPlantDefIds(): Promise<PlantDefIdEntry[]> {
  const plantsMap = new Map<string, PlantDefIdEntry>();

  try {
    const catalogContent = await readFileIfExists(CATALOG_PATH);
    if (!catalogContent) return [];

    // Extraire de SEED_VARIETIES avec le nom
    const seedSectionMatch = catalogContent.match(/SEED_VARIETIES[\s\S]*?\];/);
    if (seedSectionMatch) {
      const seedBlock = seedSectionMatch[0];
      // Extraire les entries avec leur displayName
      const entryMatches = seedBlock.matchAll(/plantDefId:\s*["']([^"']+)["'][\s\S]*?displayName:\s*["']([^"']+)["']/g);
      for (const m of entryMatches) {
        const id = m[1];
        const displayName = m[2];
        const existing = plantsMap.get(id);
        if (existing) {
          existing.catalogSource = 'BOTH';
          existing.displayName = displayName;
        } else {
          plantsMap.set(id, { id, name: displayName, catalogSource: 'SEED_VARIETIES', displayName });
        }
      }
      // Fallback: ceux sans displayName explicite
      const allSeedIds = [...seedBlock.matchAll(/plantDefId:\s*["']([^"']+)["']/g)].map(m => m[1]);
      for (const id of allSeedIds) {
        if (!plantsMap.has(id)) {
          plantsMap.set(id, { id, name: id.charAt(0).toUpperCase() + id.slice(1), catalogSource: 'SEED_VARIETIES' });
        }
      }
    }

    // Extraire de PLANTULES_LOCALES
    const plantuleSectionMatch = catalogContent.match(/PLANTULES_LOCALES[\s\S]*?\];/);
    if (plantuleSectionMatch) {
      const plantuleBlock = plantuleSectionMatch[0];
      const allPlantuleIds = [...plantuleBlock.matchAll(/plantDefId:\s*["']([^"']+)["']/g)].map(m => m[1]);
      for (const id of allPlantuleIds) {
        const existing = plantsMap.get(id);
        if (existing) {
          existing.catalogSource = 'BOTH';
        } else {
          plantsMap.set(id, { id, name: id.charAt(0).toUpperCase() + id.slice(1), catalogSource: 'PLANTULES_LOCALES' });
        }
      }
    }
  } catch (e) {
    console.error('Erreur lecture catalog pour extraire les plantDefIds', e);
  }

  return Array.from(plantsMap.values());
}

// ─── Main scan function ───────────────────────────────────────────────────────

export async function scanAllPlants(): Promise<ScanResult> {
  const timestamp = Date.now();
  const holoContent = await readFileIfExists(HOLOID_PATH) || '';
  const aiEngineContent = await readFileIfExists(AI_ENGINE_PATH) || '';
  const catalogContent = await readFileIfExists(CATALOG_PATH) || '';
  const companionContent = await readFileIfExists(COMPANION_PATH) || '';

  const plantDefIds = await getAllPlantDefIds();
  const results: PlantCheck[] = [];

  for (const plant of plantDefIds) {
    const plantCardResult = await checkPlantCard(plant.id, holoContent);
    const isTree = ['fruit-tree', 'forest-tree'].includes(plantCardResult.cardData?.plantCategory || '');
    const spritesResult = await checkSprites(plant.id, isTree);
    const cardDataResult = await checkCardData(plant.id);
    const companionResult = await checkCompanionData(plant.id, companionContent);
    const plantuleCatalogResult = await checkPlantule(plant.id, catalogContent);
    const plantuleImagesResult = await checkPlantuleImages(plant.id);

    const checks = {
      plantCard: plantCardResult,
      sprites: spritesResult,
      cardData: cardDataResult,
      seedVariety: await checkSeedVariety(plant.id, catalogContent),
      plantule: {
        ...plantuleCatalogResult,
        ...plantuleImagesResult,
      },
      packetImage: await checkPacketImage(plant.id),
      plantsEntry: await checkPlantsEntry(plant.id, holoContent),
      companionData: companionResult,
    };

    const cardDataInfo = await readCardDataForPlant(plant.id);
    const imageAssets = await checkImageAssets(cardDataInfo);

    // Count missing image assets (❌ status)
    const missingImageAssets = imageAssets.filter(a => a.status === '❌').length;

    const missingCount = [
      checks.plantCard.status === '❌',
      checks.sprites.status === '❌' || checks.sprites.status === '⚠️',
      checks.cardData.status === '❌',
      checks.seedVariety.status === '❌',
      checks.plantule.catalogEntry === false || checks.plantule.missing > 0,
      checks.packetImage.status === '❌',
      checks.plantsEntry.status === '❌',
      checks.companionData.status === '❌',
      missingImageAssets > 0, // Tree/plant image assets
    ].filter(Boolean).length;

    let overallStatus: PlantCheck['overallStatus'];
    if (missingCount === 0) {
      overallStatus = '✅ COMPLET';
    } else if (missingCount <= 3) {
      overallStatus = '⚠️ PARTIEL';
    } else {
      overallStatus = '❌ INCOMPLET';
    }

    results.push({
      plantDefId: plant.id,
      displayName: plant.displayName || plant.name,
      plantCategory: plantCardResult.cardData?.plantCategory || plantCardResult.cardData?.plantFamily,
      catalogSource: plant.catalogSource,
      dataFilePath: cardDataResult.filePath,
      cardDataPreview: plantCardResult.cardData,
      cardDataInfo: cardDataInfo ?? undefined,
      imageAssets,
      checks,
      overallStatus,
      missingCount,
    });
  }

  return {
    timestamp,
    scannedCount: results.length,
    results,
    summary: {
      complete: results.filter(r => r.overallStatus === '✅ COMPLET').length,
      partial: results.filter(r => r.overallStatus === '⚠️ PARTIEL').length,
      incomplete: results.filter(r => r.overallStatus === '❌ INCOMPLET').length,
    },
  };
}

// ─── Get plants with missing data ──────────────────────────────────────────

export function getPlantsNeedingWork(scanResult: ScanResult): PlantCheck[] {
  return scanResult.results.filter(r => r.overallStatus !== '✅ COMPLET');
}

// ─── Build sprite prompt ────────────────────────────────────────────────────

export function buildSpritePromptForPlant(plantDefId: string, plantFamily?: string): string {
  const familyDescriptions: Record<string, string> = {
    Cucurbitaceae: 'cucurbit family — trailing vine with large rounded leaves, yellow flowers, fruit grows on ground',
    Solanaceae: 'nightshade family — fruit vegetable, red/orange/yellow/purple fruit',
    Apiaceae: 'carrot family — feathery divided leaves, aromatic herbs',
    Asteraceae: 'daisy family — leafy vegetable with rosette pattern',
    Fabaceae: 'legume family — pod-bearing with climbing or bush habit',
    Brassicaceae: 'cabbage family — leafy vegetable with branching pattern',
    Rosaceae: 'rose family — fruit tree with woody stem',
    Lamiaceae: 'mint family — square stems, aromatic oval leaves',
  };

  const family = plantFamily || 'Cucurbitaceae';
  const familyDesc = familyDescriptions[family] || 'garden vegetable, bushy plant';

  return `PIXEL ART SPRITE - ${plantDefId.toUpperCase()}

Style: Manga cel-shaded cross-hatching illustration
Size: 128x128px
Background: Transparent (PNG with alpha)
Subject: ${familyDesc}

6 STAGES to generate:
Stage 0 (Graine): Tiny seed just planted, barely visible, soil surface
Stage 1 (Levée): Small sprout, 2 cotyledon leaves breaking soil, pale green
Stage 2 (Plantule): 2-4 true leaves, delicate stem, 3-5cm tall
Stage 3 (Croissance): 6-8 leaves, stronger stem, bushy, 10-15cm
Stage 4 (Floraison): Full foliage, yellow flowers appearing
Stage 5 (Récolte): Mature plant with fruit visible, harvest ready

Colors: Vibrant natural greens, yellow flowers, fruit color varies by variety
NO text, NO watermark, NO borders. Pure game asset.`;
}

// ─── Generate PlantCard code ─────────────────────────────────────────────────

export function generatePlantCardCode(plantDefId: string, cardDataContent?: string): string {
  // Parser le CARD_DATA si disponible
  let tBase = 10;
  let tCap = 30;
  let kc = 0.95;
  let waterNeed = 4.5;
  let totalDays = 60;
  let plantFamily = 'Cucurbitaceae';


  // Déterminer la catégorie et les valeurs par défaut selon le type de plante
  let plantCategory = getPlantCategory(plantDefId);

  if (cardDataContent) {
    // Extraire les données du CARD_DATA
    const tbaseMatch = cardDataContent.match(/base:\s*(\d+)/);
    const tcapMatch = cardDataContent.match(/max:\s*(\d+)/);
    const kcMatch = cardDataContent.match(/kc:\s*([\d.]+)/);
    const waterMatch = cardDataContent.match(/waterNeed:\s*([\d.]+)/);
    const daysMatch = cardDataContent.match(/cycleDays:\s*(\d+)/);
    const familyMatch = cardDataContent.match(/plantFamily:\s*['"]([^'"]+)['"]/);
    const categoryMatch = cardDataContent.match(/category:\s*["']([^"']+)["']/);

    if (tbaseMatch) tBase = parseInt(tbaseMatch[1]);
    if (tcapMatch) tCap = parseInt(tcapMatch[1]);
    if (kcMatch) kc = parseFloat(kcMatch[1]);
    if (waterMatch) waterNeed = parseFloat(waterMatch[1]);
    if (daysMatch) totalDays = parseInt(daysMatch[1]);
    if (familyMatch) plantFamily = familyMatch[1];
    if (categoryMatch) {
      const cat = categoryMatch[1];
      if (cat === 'hedge' || cat === 'ornamental-hedge') plantCategory = 'hedge';
      else if (cat === 'forest-tree' || cat === 'ornamental-tree') plantCategory = 'forest-tree';
      else if (cat === 'fruit-tree') plantCategory = 'fruit-tree';
      else if (cat === 'aromatic') plantCategory = 'aromatic';
      else plantCategory = 'vegetable';
    }
  }

  if (plantFamily === 'Cucurbitaceae' && plantDefId && getPlantFamily(plantDefId) !== 'Cucurbitaceae') {
    plantFamily = getPlantFamily(plantDefId);
  }
  if (plantFamily === 'Unknown') {
    plantFamily = getPlantFamily(plantDefId);
  }

  const stageGDD = [
    Math.round(totalDays * 0.1),
    Math.round(totalDays * 0.25),
    Math.round(totalDays * 0.35),
    Math.round(totalDays * 0.30),
  ];

  const code = `  // ─── ${plantDefId.toUpperCase()} ───
  '${plantDefId}': {
    id: '${plantDefId}',
    plantCategory: '${plantCategory}',
    tBase: ${tBase},
    tCap: ${tCap},
    stageGDD: [${stageGDD.join(', ')}],
    kc: ${kc},
    waterNeedMmPerDay: ${waterNeed},
    minSoilTempForSowing: ${tBase + 5},
    optimalSoilTemp: ${Math.round((tBase + tCap) / 2)},
    lightNeedHours: 7,
    stageDurations: [6, 15, 14, 20],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Beneficial companion' },
      { plantId: 'bean', type: 'beneficial', reason: 'Fixes nitrogen' },
    ],
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
    totalDaysToHarvest: ${totalDays},
    plantFamily: '${plantFamily}',
    droughtResistance: 0.35,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
  },`;

  return code;
}
